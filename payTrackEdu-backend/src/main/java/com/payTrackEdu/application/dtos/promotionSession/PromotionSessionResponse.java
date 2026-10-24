package com.payTrackEdu.application.dtos.promotionSession;

import com.payTrackEdu.application.domain.PromotionSession;
import com.payTrackEdu.application.enums.PromotionSessionStatus;
import com.payTrackEdu.application.utils.PromotionSessionCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PromotionSessionResponse(
        UUID id,
        String code,
        UUID academicYearId,
        String academicYearCode,
        UUID promotionId,
        String promotionCode,
        String promotionName,
        BigDecimal registrationFee,
        PromotionSessionStatus status,
        LocalDate createdAt,
        String createdBy
) {
    public static PromotionSessionResponse from(PromotionSession promotionSession) {
        return new PromotionSessionResponse(
                promotionSession.getId(),
                promotionSession.getCode() == null
                        ? PromotionSessionCode.generate(
                                promotionSession.getAcademicYear().getCode(),
                                promotionSession.getPromotion().getCode()
                        )
                        : promotionSession.getCode(),
                promotionSession.getAcademicYear().getId(),
                promotionSession.getAcademicYear().getCode(),
                promotionSession.getPromotion().getId(),
                promotionSession.getPromotion().getCode(),
                promotionSession.getPromotion().getName(),
                promotionSession.getRegistrationFee(),
                promotionSession.getStatus(),
                promotionSession.getCreatedAt().toLocalDate(),
                promotionSession.getCreatedBy()
        );
    }
}
