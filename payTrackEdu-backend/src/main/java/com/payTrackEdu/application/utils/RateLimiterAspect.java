package com.payTrackEdu.application.utils;

// Java
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Set;
import java.util.function.Supplier;

// Servlet (Spring Boot 3+; use javax.servlet.http.HttpServletRequest on Boot 2)
import com.payTrackEdu.application.config.Ratelimited;
import com.payTrackEdu.application.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;

// Lombok
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// AspectJ
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;

// Bucket4j
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.distributed.proxy.ProxyManager;

// Spring
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@Aspect
@RequiredArgsConstructor
@Slf4j
public class RateLimiterAspect {

    private final ProxyManager<String> proxyManager;
    private final ExpressionParser parser = new SpelExpressionParser();
    private final ParameterNameDiscoverer nameDiscoverer = new DefaultParameterNameDiscoverer();



    @Around("@annotation(com.payTrackEdu.application.config.Ratelimited)"
            + " || @annotation(com.payTrackEdu.application.config.RateLimits)")
    public Object rateLimit(ProceedingJoinPoint joinPoint) throws Throwable {
        Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        Set<Ratelimited> limits =
                AnnotatedElementUtils.getMergedRepeatableAnnotations(method, Ratelimited.class);
        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        for (Ratelimited limit : limits) {
            consume(limit, buildKey(limit, joinPoint, method, request));
        }
        return joinPoint.proceed();
    }

    private void consume(Ratelimited limit, String key) {
        Duration window = Duration.of(limit.window(), limit.unit().toChronoUnit());
        Supplier<BucketConfiguration> configuration = () -> BucketConfiguration.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(limit.capacity())
                        .refillIntervally(limit.capacity(), window)
                        .build())
                .build();

        ConsumptionProbe probe;
        try {
            probe = proxyManager.builder().build(key, configuration).tryConsumeAndReturnRemaining(1);
        } catch (RuntimeException e) {

           log.error("Rate limiter unavailable, request allowed without limit", e);
            return;
        }

        if (!probe.isConsumed()) {
            long retryAfter = Math.max(1, (long) Math.ceil(probe.getNanosToWaitForRefill() / 1_000_000_000d));
            throw new RateLimitExceededException(retryAfter);
        }
    }

    private String buildKey(Ratelimited limit, ProceedingJoinPoint joinPoint,
                            Method method, HttpServletRequest request) {
        String subject = switch (limit.key()) {
            case IP -> IpHelper.getClientIp(request);
            case EXPRESSION -> evaluate(limit.expression(), joinPoint, method);
        };
        // hash it so Redis never contains raw emails or IPs
        return "rl:" + limit.name() + ":" + subject;
    }

    private String evaluate(String expression, ProceedingJoinPoint joinPoint, Method method) {
        StandardEvaluationContext context = new StandardEvaluationContext();
        String[] names = nameDiscoverer.getParameterNames(method);
        Object[] args = joinPoint.getArgs();
        if (names != null) {
            for (int i = 0; i < names.length; i++) {
                context.setVariable(names[i], args[i]);
            }
        }
        String value = parser.parseExpression(expression).getValue(context, String.class);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Rate limit key expression returned no value: " + expression);
        }
        return value;
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
