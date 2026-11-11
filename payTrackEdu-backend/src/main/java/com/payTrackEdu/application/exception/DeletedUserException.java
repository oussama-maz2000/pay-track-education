package com.payTrackEdu.application.exception;

public class DeletedUserException extends RuntimeException {
    public DeletedUserException(String message) {
        super(message);
    }
}