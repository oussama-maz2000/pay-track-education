package com.payTrackEdu.application.dtos.paymentAllocation;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentAllocationRequest(

        @NotNull
        UUID paymentId,

        @NotNull
        UUID installmentId,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amount

) {
}
