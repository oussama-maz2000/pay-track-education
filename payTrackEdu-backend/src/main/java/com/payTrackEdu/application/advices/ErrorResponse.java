package com.payTrackEdu.application.advices;

public record ErrorResponse(int status,
                            String message,long timestamp) {
}
