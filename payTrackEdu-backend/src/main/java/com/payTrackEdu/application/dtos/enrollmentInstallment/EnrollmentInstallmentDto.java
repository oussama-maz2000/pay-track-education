package com.payTrackEdu.application.dtos.enrollmentInstallment;

import com.payTrackEdu.application.domain.EnrollmentInstallment;
import com.payTrackEdu.application.enums.EnrollmentInstallmentType;
import com.payTrackEdu.application.enums.InstallmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EnrollmentInstallmentDto(
        UUID id,
        Integer sequenceNumber,
        EnrollmentInstallmentType type,
        String label,
        BigDecimal expectedAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        LocalDate dueDate,
        InstallmentStatus status


) {

    public static EnrollmentInstallmentDto from(
            EnrollmentInstallment installment,
            BigDecimal paidAmount,
            BigDecimal remainingAmount,
            InstallmentStatus status
    ) {


        return new EnrollmentInstallmentDto(
                installment.getId(),
                installment.getSequenceNumber(),
                installment.getType(),
                installment.getLabel(),
                installment.getExpectedAmount(),
                paidAmount,
                remainingAmount,
                installment.getDueDate(),
                status
        );
    }
}
