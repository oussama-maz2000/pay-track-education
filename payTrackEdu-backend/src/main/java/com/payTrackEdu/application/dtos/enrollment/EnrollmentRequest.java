package com.payTrackEdu.application.dtos.enrollment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record EnrollmentRequest(
        @NotNull UUID studentId,
        @NotNull UUID promotionSessionId,
        @NotNull UUID paymentPlanId,
        @DecimalMin(value = "0.00") BigDecimal discountAmount,
        @Size(max = 255) String discountReason
) {
}
