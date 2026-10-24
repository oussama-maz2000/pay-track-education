package com.payTrackEdu.application.dtos.enrollmentInstallment;

import com.payTrackEdu.application.domain.EnrollmentInstallment;
import com.payTrackEdu.application.enums.EnrollmentInstallmentType;
import com.payTrackEdu.application.enums.InstallmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EnrollmentInstallmentResponse(
        UUID id,
        UUID enrollmentId,
        UUID studentId,
        String studentFirstName,
        String studentLastName,
        UUID paymentPlanId,
        String paymentPlanCode,
        Integer sequenceNumber,
        EnrollmentInstallmentType type,
        String label,
        BigDecimal expectedAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        LocalDate dueDate,
        InstallmentStatus status,
        String createdBy,
        LocalDate createdAt
) {
    public static EnrollmentInstallmentResponse from(
            EnrollmentInstallment installment,
            BigDecimal paidAmount,
            BigDecimal remainingAmount,
            InstallmentStatus status
    ) {
        var enrollment = installment.getEnrollment();
        var student = enrollment.getStudent();
        var paymentPlan = enrollment.getPaymentPlan();

        return new EnrollmentInstallmentResponse(
                installment.getId(),
                enrollment.getId(),
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                paymentPlan.getId(),
                paymentPlan.getCode(),
                installment.getSequenceNumber(),
                installment.getType(),
                installment.getLabel(),
                installment.getExpectedAmount(),
                paidAmount,
                remainingAmount,
                installment.getDueDate(),
                status,
                installment.getCreatedBy(),
                installment.getCreatedAt().toLocalDate()
        );
    }
}
