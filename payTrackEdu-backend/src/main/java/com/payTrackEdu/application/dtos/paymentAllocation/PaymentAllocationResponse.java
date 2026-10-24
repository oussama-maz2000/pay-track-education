package com.payTrackEdu.application.dtos.paymentAllocation;

import com.payTrackEdu.application.domain.PaymentAllocation;
import com.payTrackEdu.application.enums.EnrollmentInstallmentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentAllocationResponse(

        UUID id,

        UUID paymentId,

        String receiptNumber,

        UUID installmentId,

        Integer installmentSequenceNumber,

        EnrollmentInstallmentType installmentType,

        BigDecimal amount,

        LocalDateTime createdAt

) {
    public static PaymentAllocationResponse from(PaymentAllocation allocation) {
        var payment = allocation.getPayment();
        var installment = allocation.getEnrollmentInstallment();

        return new PaymentAllocationResponse(
                allocation.getId(),
                payment.getId(),
                payment.getReceiptNumber(),
                installment.getId(),
                installment.getSequenceNumber(),
                installment.getType(),
                allocation.getAmount(),
                allocation.getCreatedAt()
        );
    }
}
