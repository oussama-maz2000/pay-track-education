package com.payTrackEdu.application.dtos.enrollment;

import com.payTrackEdu.application.domain.Enrollment;
import com.payTrackEdu.application.enums.EnrollmentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record EnrollmentDto(
        UUID id,
        String studentFirstName,
        String studentLastName,
        String academicYearCode,
        String paymentPlanCode,
        BigDecimal registrationFeeAmount,
        BigDecimal tuitionAmount,
        BigDecimal discountAmount,
        EnrollmentStatus status,
        BigDecimal totalAmount,
        BigDecimal finalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount
) {
    public static EnrollmentDto from(Enrollment enrollment,
                                     BigDecimal totalAmount,
                                     BigDecimal finalAmount,
                                     BigDecimal paidAmount,
                                     BigDecimal remainingAmount){

        var student = enrollment.getStudent();
        var promotionSession = enrollment.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();
        var paymentPlan = enrollment.getPaymentPlan();

        return new EnrollmentDto(
                enrollment.getId(),
                student.getFirstName(),
                student.getLastName(),
                academicYear.getCode(),
                paymentPlan.getCode(),
                enrollment.getRegistrationFeeAmount(),
                enrollment.getTuitionAmount(),
                enrollment.getDiscountAmount(),
                enrollment.getStatus(),
                totalAmount,
                finalAmount,
                paidAmount,
                remainingAmount
        );
    }
}
