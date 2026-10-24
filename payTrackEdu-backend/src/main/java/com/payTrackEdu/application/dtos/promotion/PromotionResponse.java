package com.payTrackEdu.application.dtos.promotion;

import com.payTrackEdu.application.domain.Promotion;

import java.time.LocalDate;
import java.util.UUID;

public record PromotionResponse(
        UUID id,
        String code,
        String name,
        boolean active,
        LocalDate createdAt,
        String createdBy
) {
    public static PromotionResponse from(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                promotion.isActive(),
                promotion.getCreatedAt().toLocalDate(),
                promotion.getCreatedBy()
        );
    }
}
