package com.payTrackEdu.application.dtos.paymentPlan;

import com.payTrackEdu.application.domain.PaymentPlan;
import com.payTrackEdu.application.enums.PaymentPlanType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentPlanDto(
        UUID id,
        String academicYearCode,
        String promotionName,
       String promotionCode,
        String code,
        PaymentPlanType plan,
        BigDecimal totalAmount,
        String createdBy,
        LocalDate createdAt
) {

    public static PaymentPlanDto from(PaymentPlan paymentPlan) {
        var promotionSession = paymentPlan.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();
        var promotion = promotionSession.getPromotion();

        return new PaymentPlanDto(
                paymentPlan.getId(),
                academicYear.getCode(),
                promotion.getName(),
                promotion.getCode(),
                paymentPlan.getCode(),
                paymentPlan.getPlan(),
                paymentPlan.getTotalAmount(),
                paymentPlan.getCreatedBy(),
                paymentPlan.getCreatedAt().toLocalDate()
        );
    }
}
