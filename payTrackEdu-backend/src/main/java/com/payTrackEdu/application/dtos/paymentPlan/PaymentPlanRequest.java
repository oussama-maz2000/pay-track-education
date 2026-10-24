package com.payTrackEdu.application.dtos.paymentPlan;

import com.payTrackEdu.application.enums.PaymentPlanType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentPlanRequest(
        @NotNull UUID promotionSessionId,
        @NotBlank @Size(max = 150) String code,
        @NotNull PaymentPlanType plan,

        @NotNull @DecimalMin(value = "0.00") BigDecimal totalAmount
) {
}
