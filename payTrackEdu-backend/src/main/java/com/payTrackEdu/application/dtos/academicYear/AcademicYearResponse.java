package com.payTrackEdu.application.dtos.academicYear;

import com.payTrackEdu.application.domain.AcademicYear;
import com.payTrackEdu.application.enums.YearStatus;

import java.time.LocalDate;
import java.util.UUID;

public record AcademicYearResponse(
        UUID id,
        String code,
        YearStatus status,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate createdAt,
        String createdBy
) {
    public static AcademicYearResponse from(AcademicYear academicYear) {
        return new AcademicYearResponse(
                academicYear.getId(),
                academicYear.getCode(),
                academicYear.getStatus(),
                academicYear.getStartDate(),
                academicYear.getEndDate(),
                academicYear.getCreatedAt().toLocalDate(),
                academicYear.getCreatedBy()
        );
    }
}
