package com.payTrackEdu.application.dtos.academicYear;

import com.payTrackEdu.application.enums.YearStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AcademicYearRequest(
        @NotBlank @Size(max = 150) String code,
        YearStatus status,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate
) {
}
