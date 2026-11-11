package com.payTrackEdu.application.dtos.user;

public record PasswordResetOtpIssued(String email,String rawOtp) {

    @Override
    public String toString(){return "PasswordResetOtpIssued[REDACTED]";}
}
