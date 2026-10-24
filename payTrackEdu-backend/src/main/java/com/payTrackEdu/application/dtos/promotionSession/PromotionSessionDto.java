package com.payTrackEdu.application.dtos.promotionSession;

import com.payTrackEdu.application.domain.PromotionSession;
import com.payTrackEdu.application.utils.PromotionSessionCode;

import java.util.UUID;

public record PromotionSessionDto(
        UUID id,
        String code
) {
    public static PromotionSessionDto from(PromotionSession promotionSession) {
        return new PromotionSessionDto(
                promotionSession.getId(),
                promotionSession.getCode() == null
                        ? PromotionSessionCode.generate(
                                promotionSession.getAcademicYear().getCode(),
                                promotionSession.getPromotion().getCode()
                        )
                        : promotionSession.getCode()
        );
    }
}
