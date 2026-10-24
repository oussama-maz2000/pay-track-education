package com.payTrackEdu.application.dtos.enrollmentInstallment;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdateEnrollmentInstallmentDueDateRequest(
        @NotNull LocalDate dueDate
) {
}
