package com.payTrackEdu.application.dtos.payment;

import com.payTrackEdu.application.domain.Payment;
import com.payTrackEdu.application.enums.PaymentMethod;
import com.payTrackEdu.application.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentDto(
        UUID id,
        String receiptNumber,
        LocalDate paymentDate,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        PaymentStatus status,
        LocalDate createdAt

) {
    public static PaymentDto from(Payment payment)
    {
        return new PaymentDto(
                payment.getId(),
                payment.getReceiptNumber(),
                payment.getPaymentDate(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getCreatedAt().toLocalDate()
        );
    }
}
