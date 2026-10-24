package com.payTrackEdu.application.dtos.paymentPlanInstallment;

import com.payTrackEdu.application.enums.PaymentPlanInstallment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentPlanInstallmentDto(
        UUID id,
        String paymentPlanCode,
        String academicYearCode,
        Integer sequenceNumber,
        PaymentPlanInstallment type,
        BigDecimal amount,
        LocalDate dueDate,
        LocalDate createdAt,
        String createdBy






) {
    public static PaymentPlanInstallmentDto from(com.payTrackEdu.application.domain.PaymentPlanInstallment installment) {
        var paymentPlan = installment.getPaymentPlan();
        var promotionSession = paymentPlan.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();

        return new PaymentPlanInstallmentDto(
                installment.getId(),
                paymentPlan.getCode(),
                academicYear.getCode(),
                installment.getSequenceNumber(),
                installment.getType(),
                installment.getAmount(),
                installment.getDueDate(),
                installment.getCreatedAt().toLocalDate(),
                installment.getCreatedBy()
        );
    }

}
