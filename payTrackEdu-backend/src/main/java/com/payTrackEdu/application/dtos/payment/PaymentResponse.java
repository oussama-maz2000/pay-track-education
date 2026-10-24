package com.payTrackEdu.application.dtos.payment;

import com.payTrackEdu.application.domain.Payment;
import com.payTrackEdu.application.enums.PaymentMethod;
import com.payTrackEdu.application.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(

        UUID id,
        UUID enrollmentId,

        UUID studentId,
        String studentFirstName,
        String studentLastName,

        String promotionCode,
        String academicYearCode,

        String receiptNumber,

        LocalDate paymentDate,

        BigDecimal amount,

        PaymentMethod paymentMethod,

        String reference,

        String notes,

        PaymentStatus status,

        LocalDateTime createdAt,

        LocalDateTime cancelledAt,

        String cancellationReason,
        String createdBy

) {
    public static PaymentResponse from(Payment payment) {
        var enrollment = payment.getEnrollment();
        var student = enrollment.getStudent();
        var promotionSession = enrollment.getPromotionSession();

        return new PaymentResponse(
                payment.getId(),
                enrollment.getId(),
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                promotionSession.getPromotion().getCode(),
                promotionSession.getAcademicYear().getCode(),
                payment.getReceiptNumber(),
                payment.getPaymentDate(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getReference(),
                payment.getNotes(),
                payment.getStatus(),
                payment.getCreatedAt(),
                payment.getCancelledAt(),
                payment.getCancellationReason(),

                payment.getCreatedBy()
        );
    }
}
