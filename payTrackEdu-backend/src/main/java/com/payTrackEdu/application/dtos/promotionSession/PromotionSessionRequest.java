package com.payTrackEdu.application.dtos.promotionSession;

import com.payTrackEdu.application.enums.PromotionSessionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record PromotionSessionRequest(
        @NotNull UUID academicYearId,
        @NotNull UUID promotionId,
        @NotNull @DecimalMin(value = "0.00") BigDecimal registrationFee,
        PromotionSessionStatus status
) {
}
