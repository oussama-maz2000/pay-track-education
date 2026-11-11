package com.payTrackEdu.application.service;

import com.payTrackEdu.application.dtos.user.PasswordResetOtpIssued;
import com.payTrackEdu.application.utils.SenderMail;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordResetMailListener {
    private final SenderMail senderMail;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(PasswordResetOtpIssued event) {
        try {
            senderMail.sendEmail("Reset your Pay Track Education password", event.email(), event.rawOtp());
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send password reset email", e); 
        }
    }
}
