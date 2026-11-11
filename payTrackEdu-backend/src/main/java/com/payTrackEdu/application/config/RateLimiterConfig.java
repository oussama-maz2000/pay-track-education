package com.payTrackEdu.application.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.function.Supplier;

@Configuration
public class RateLimiterConfig {


/*
* shutdown : indique à spring d'exécuter la méthode shutdown() de l'object RedisClient proprement lorsque l'application s'arrête
* pour liberer les threads et connexions reseau
* */
    @Bean(destroyMethod = "shutdown")
    public RedisClient redisClient(
            @Value("${spring.data.redis.host}") String host,
            @Value("${spring.data.redis.port}") int port,
            @Value("${spring.data.redis.password}") String password,
            @Value("${spring.data.redis.ssl.enabled:false}") boolean ssl) {

        RedisURI.Builder uri = RedisURI.builder().withHost(host).withPort(port).withSsl(ssl);
        if (!password.isBlank()) {
            uri.withPassword(password.toCharArray());
        }
        return RedisClient.create(uri.build());
    }

   @Bean(destroyMethod = "close")
    public StatefulRedisConnection<String,byte[]> rateLimiterConnection(RedisClient redisClient){
        return redisClient.connect(RedisCodec.of(StringCodec.UTF8,ByteArrayCodec.INSTANCE));
   }

   @Bean
    public ProxyManager<String> proxyManager(StatefulRedisConnection<String,byte[]> connection){
        return LettuceBasedProxyManager.builderFor(connection).withExpirationStrategy(ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(1))).build();
   }
}
