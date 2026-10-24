package com.payTrackEdu.application.dtos.payment;

import com.payTrackEdu.application.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull UUID enrollmentId,
        LocalDate paymentDate,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull PaymentMethod paymentMethod,
        @Size(max = 150) String reference,
        @Size(max = 500) String notes
) {
}
