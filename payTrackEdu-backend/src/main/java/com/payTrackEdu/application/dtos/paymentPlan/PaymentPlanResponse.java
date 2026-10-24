package com.payTrackEdu.application.dtos.paymentPlan;

import com.payTrackEdu.application.domain.PaymentPlan;
import com.payTrackEdu.application.enums.PaymentPlanType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentPlanResponse(
        UUID id,
        UUID promotionSessionId,
        UUID academicYearId,
        String academicYearCode,
        UUID promotionId,
        String promotionCode,
        String promotionName,
        String code,
        PaymentPlanType plan,
        BigDecimal totalAmount,
        String createdBy,
        LocalDate createdAt
) {
    public static PaymentPlanResponse from(PaymentPlan paymentPlan) {
        var promotionSession = paymentPlan.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();
        var promotion = promotionSession.getPromotion();

        return new PaymentPlanResponse(
                paymentPlan.getId(),
                promotionSession.getId(),
                academicYear.getId(),
                academicYear.getCode(),
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                paymentPlan.getCode(),
                paymentPlan.getPlan(),
                paymentPlan.getTotalAmount(),
                paymentPlan.getCreatedBy(),
                paymentPlan.getCreatedAt().toLocalDate()
        );
    }
}
