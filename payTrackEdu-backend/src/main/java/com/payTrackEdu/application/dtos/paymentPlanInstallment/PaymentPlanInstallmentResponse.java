package com.payTrackEdu.application.dtos.paymentPlanInstallment;

import com.payTrackEdu.application.enums.PaymentPlanInstallment;
import com.payTrackEdu.application.enums.PaymentPlanType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentPlanInstallmentResponse(
        UUID id,
        UUID paymentPlanId,
        String paymentPlanCode,
        PaymentPlanType paymentPlanType,
        UUID promotionSessionId,
        UUID academicYearId,
        String academicYearCode,
        UUID promotionId,
        String promotionCode,
        String promotionName,
        Integer sequenceNumber,
        PaymentPlanInstallment type,
        BigDecimal amount,
        LocalDate dueDate,
        LocalDate createdAt,
        String createdBy
) {
    public static PaymentPlanInstallmentResponse from(com.payTrackEdu.application.domain.PaymentPlanInstallment installment) {
        var paymentPlan = installment.getPaymentPlan();
        var promotionSession = paymentPlan.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();
        var promotion = promotionSession.getPromotion();

        return new PaymentPlanInstallmentResponse(
                installment.getId(),
                paymentPlan.getId(),
                paymentPlan.getCode(),
                paymentPlan.getPlan(),
                promotionSession.getId(),
                academicYear.getId(),
                academicYear.getCode(),
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                installment.getSequenceNumber(),
                installment.getType(),
                installment.getAmount(),
                installment.getDueDate(),
                installment.getCreatedAt().toLocalDate(),
                installment.getCreatedBy()
        );
    }
}
