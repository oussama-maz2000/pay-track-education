package com.payTrackEdu.application.exception;

import lombok.Getter;

@Getter
public class RateLimitExceededException extends RuntimeException{
    private final long retryAfterSeconds;

    public RateLimitExceededException(long retryAfterSeconds) {
        super("Limite de requêtes dépassée");
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
