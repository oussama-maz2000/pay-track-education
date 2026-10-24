package com.payTrackEdu.application.dtos.paymentPlan;

import com.payTrackEdu.application.domain.PaymentPlan;

import java.util.UUID;

public record PaymentPlanForInstallment(
        UUID id,
        String code
) {
    public static PaymentPlanForInstallment from(PaymentPlan paymentPlan){
        return new PaymentPlanForInstallment(
                paymentPlan.getId(),
                paymentPlan.getCode()
        );
    }
}
