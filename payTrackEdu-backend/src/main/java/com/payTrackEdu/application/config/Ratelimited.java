package com.payTrackEdu.application.config;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(RateLimits.class)
public @interface Ratelimited {

    /** Unique bucket name, used as the Redis key prefix (e.g. "forgot-ip"). */
    String name();

    int capacity();

    long window();

    TimeUnit unit() default TimeUnit.MINUTES;

    KeyType key() default KeyType.IP;

    /** SpEL expression, used only when key = EXPRESSION. Method parameters are available by name. */
    String expression() default "";

    enum KeyType { IP, EXPRESSION }
}
