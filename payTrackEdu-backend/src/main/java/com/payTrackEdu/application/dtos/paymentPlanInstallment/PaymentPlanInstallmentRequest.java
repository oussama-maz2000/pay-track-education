package com.payTrackEdu.application.dtos.paymentPlanInstallment;

import com.payTrackEdu.application.enums.PaymentPlanInstallment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentPlanInstallmentRequest(
        @NotNull UUID paymentPlanId,
        @NotNull @Min(1) Integer sequenceNumber,
        @NotNull PaymentPlanInstallment type,
        @NotNull @DecimalMin(value = "0.00") BigDecimal amount,
        @NotNull LocalDate dueDate
) {
}
