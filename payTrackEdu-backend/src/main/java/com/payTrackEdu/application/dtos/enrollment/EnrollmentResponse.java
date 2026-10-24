package com.payTrackEdu.application.dtos.enrollment;

import com.payTrackEdu.application.domain.Enrollment;
import com.payTrackEdu.application.enums.EnrollmentStatus;
import com.payTrackEdu.application.enums.PaymentPlanType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EnrollmentResponse(
        UUID id,
        UUID studentId,
        String studentFirstName,
        String studentLastName,
        String studentEmail,
        UUID promotionSessionId,
        UUID academicYearId,
        String academicYearCode,
        UUID promotionId,
        String promotionCode,
        String promotionName,
        UUID paymentPlanId,
        String paymentPlanCode,
        PaymentPlanType paymentPlanType,
        BigDecimal registrationFeeAmount,
        BigDecimal tuitionAmount,
        BigDecimal discountAmount,
        String discountReason,
        EnrollmentStatus status,
        BigDecimal totalAmount,
        BigDecimal finalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        LocalDate createdAt,
        String createdBy
) {
    public static EnrollmentResponse from(
            Enrollment enrollment,
            BigDecimal totalAmount,
            BigDecimal finalAmount,
            BigDecimal paidAmount,
            BigDecimal remainingAmount
    ) {
        var student = enrollment.getStudent();
        var promotionSession = enrollment.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();
        var promotion = promotionSession.getPromotion();
        var paymentPlan = enrollment.getPaymentPlan();

        return new EnrollmentResponse(
                enrollment.getId(),
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                promotionSession.getId(),
                academicYear.getId(),
                academicYear.getCode(),
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                paymentPlan.getId(),
                paymentPlan.getCode(),
                paymentPlan.getPlan(),
                enrollment.getRegistrationFeeAmount(),
                enrollment.getTuitionAmount(),
                enrollment.getDiscountAmount(),
                enrollment.getDiscountReason(),
                enrollment.getStatus(),
                totalAmount,
                finalAmount,
                paidAmount,
                remainingAmount,
                enrollment.getCreatedAt()
                        .toLocalDate() ,
                enrollment.getCreatedBy());
    }
}
