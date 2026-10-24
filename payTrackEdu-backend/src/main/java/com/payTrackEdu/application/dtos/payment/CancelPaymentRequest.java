package com.payTrackEdu.application.dtos.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelPaymentRequest(
        @NotBlank @Size(max = 500) String cancellationReason
) {
}
