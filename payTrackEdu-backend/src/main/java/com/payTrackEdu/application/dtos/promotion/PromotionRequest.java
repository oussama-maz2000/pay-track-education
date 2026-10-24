package com.payTrackEdu.application.dtos.promotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PromotionRequest(
        @NotBlank @Size(max = 150) String code,
        @NotBlank @Size(max = 150) String name,
        Boolean active
) {
}
