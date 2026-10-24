# All DTOs

Documentation-only reference generated from `src/main/java/com/payTrackEdu/application/dtos`.

## academicYear/AcademicYearRequest.java

```java
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
```

## academicYear/AcademicYearResponse.java

```java
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
        LocalDate endDate
) {
    public static AcademicYearResponse from(AcademicYear academicYear) {
        return new AcademicYearResponse(
                academicYear.getId(),
                academicYear.getCode(),
                academicYear.getStatus(),
                academicYear.getStartDate(),
                academicYear.getEndDate()
        );
    }
}
```

## auth/AuthResponse.java

```java
package com.payTrackEdu.application.dtos.auth;


import com.payTrackEdu.application.enums.Role;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UUID userId,
        String fullName,
        String email,
        String userName,
        Role role
) {}
```

## auth/LoginRequest.java

```java
package com.payTrackEdu.application.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
```

## auth/RefreshRequest.java

```java
package com.payTrackEdu.application.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank String refreshToken) {}
```

## auth/UserProfileResponse.java

```java
package com.payTrackEdu.application.dtos.auth;


import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.enums.Role;

import java.util.UUID;

public record UserProfileResponse(UUID id, String fullName, String userName, String email, Role role, String phone,
                                  boolean isActive) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(user.getId(), user.getFullName(), user.getUserName(), user.getEmail(),
                user.getRole(), user.getPhone(), user.isActive());
    }
}
```

## enrollment/CreateEnrollmentRequest.java

```java
package com.payTrackEdu.application.dtos.enrollment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateEnrollmentRequest(
        @NotNull UUID studentId,
        @NotNull UUID promotionSessionId,
        @NotNull UUID paymentPlanId,
        @DecimalMin(value = "0.00") BigDecimal discountAmount,
        @Size(max = 255) String discountReason
) {
}
```

## enrollment/EnrollmentResponse.java

```java
package com.payTrackEdu.application.dtos.enrollment;

import com.payTrackEdu.application.domain.Enrollment;
import com.payTrackEdu.application.enums.EnrollmentStatus;
import com.payTrackEdu.application.enums.PaymentPlanType;

import java.math.BigDecimal;
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
        BigDecimal remainingAmount
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
                remainingAmount
        );
    }
}
```

## enrollment/UpdateEnrollmentRequest.java

```java
package com.payTrackEdu.application.dtos.enrollment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateEnrollmentRequest(
        UUID studentId,
        UUID promotionSessionId,
        UUID paymentPlanId,
        @DecimalMin(value = "0.00") BigDecimal discountAmount,
        @Size(max = 255) String discountReason
) {
}
```

## enrollmentInstallment/EnrollmentInstallmentResponse.java

```java
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
        LocalDate dueDate,
        InstallmentStatus status
) {
    public static EnrollmentInstallmentResponse from(EnrollmentInstallment installment) {
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
                installment.getDueDate(),
                installment.getStatus()
        );
    }
}
```

## enrollmentInstallment/UpdateEnrollmentInstallmentDueDateRequest.java

```java
package com.payTrackEdu.application.dtos.enrollmentInstallment;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdateEnrollmentInstallmentDueDateRequest(
        @NotNull LocalDate dueDate
) {
}
```

## payment/CancelPaymentRequest.java

```java
package com.payTrackEdu.application.dtos.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelPaymentRequest(
        @NotBlank @Size(max = 500) String cancellationReason
) {
}
```

## payment/CreatePaymentRequest.java

```java
package com.payTrackEdu.application.dtos.payment;

import com.payTrackEdu.application.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull UUID enrollmentId,
        LocalDate paymentDate,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull PaymentMethod paymentMethod,
        @Size(max = 150) String reference,
        @Size(max = 500) String notes
) {
}
```

## payment/PaymentResponse.java

```java
package com.payTrackEdu.application.dtos.payment;

import com.payTrackEdu.application.domain.Payment;
import com.payTrackEdu.application.enums.PaymentMethod;
import com.payTrackEdu.application.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(

        UUID id,

        UUID enrollmentId,

        UUID studentId,
        String studentFirstName,
        String studentLastName,

        String promotionCode,
        String academicYearCode,

        String receiptNumber,

        LocalDate paymentDate,

        BigDecimal amount,

        PaymentMethod paymentMethod,

        String reference,

        String notes,

        PaymentStatus status,

        LocalDateTime createdAt,

        LocalDateTime cancelledAt,

        String cancellationReason

) {
    public static PaymentResponse from(Payment payment) {
        var enrollment = payment.getEnrollment();
        var student = enrollment.getStudent();
        var promotionSession = enrollment.getPromotionSession();

        return new PaymentResponse(
                payment.getId(),
                enrollment.getId(),
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                promotionSession.getPromotion().getCode(),
                promotionSession.getAcademicYear().getCode(),
                payment.getReceiptNumber(),
                payment.getPaymentDate(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getReference(),
                payment.getNotes(),
                payment.getStatus(),
                payment.getCreatedAt(),
                payment.getCancelledAt(),
                payment.getCancellationReason()
        );
    }
}
```

## paymentAllocation/CreatePaymentAllocationRequest.java

```java
package com.payTrackEdu.application.dtos.paymentAllocation;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentAllocationRequest(

        @NotNull
        UUID paymentId,

        @NotNull
        UUID installmentId,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amount

) {
}
```

## paymentAllocation/PaymentAllocationResponse.java

```java
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
```

## paymentPlan/PaymentPlanRequest.java

```java
package com.payTrackEdu.application.dtos.paymentPlan;

import com.payTrackEdu.application.enums.PaymentPlanType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentPlanRequest(
        @NotNull UUID promotionSessionId,
        @NotBlank @Size(max = 150) String code,
        @NotNull PaymentPlanType plan,

        @NotNull @DecimalMin(value = "0.00") BigDecimal totalAmount
) {
}
```

## paymentPlan/PaymentPlanResponse.java

```java
package com.payTrackEdu.application.dtos.paymentPlan;

import com.payTrackEdu.application.domain.PaymentPlan;
import com.payTrackEdu.application.enums.PaymentPlanType;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentPlanResponse(
        UUID id,
        UUID promotionSessionId,
        UUID academicYearId,
        String academicYearCode,
        UUID promotionId,
        String promotionCode,
        String promotionName,
        String code,
        PaymentPlanType plan,

        BigDecimal totalAmount
) {
    public static PaymentPlanResponse from(PaymentPlan paymentPlan) {
        var promotionSession = paymentPlan.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();
        var promotion = promotionSession.getPromotion();

        return new PaymentPlanResponse(
                paymentPlan.getId(),
                promotionSession.getId(),
                academicYear.getId(),
                academicYear.getCode(),
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                paymentPlan.getCode(),
                paymentPlan.getPlan(),

                paymentPlan.getTotalAmount()
        );
    }
}
```

## paymentPlanInstallment/PaymentPlanInstallmentRequest.java

```java
package com.payTrackEdu.application.dtos.paymentPlanInstallment;

import com.payTrackEdu.application.enums.PaymentPlanInstallment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentPlanInstallmentRequest(
        @NotNull UUID paymentPlanId,
        @NotNull @Min(1) Integer sequenceNumber,
        @NotNull PaymentPlanInstallment type,
        @NotNull @DecimalMin(value = "0.00") BigDecimal amount,
        @NotNull LocalDate dueDate
) {
}
```

## paymentPlanInstallment/PaymentPlanInstallmentResponse.java

```java
package com.payTrackEdu.application.dtos.paymentPlanInstallment;

import com.payTrackEdu.application.enums.PaymentPlanInstallment;
import com.payTrackEdu.application.enums.PaymentPlanType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentPlanInstallmentResponse(
        UUID id,
        UUID paymentPlanId,
        String paymentPlanCode,
        PaymentPlanType paymentPlanType,
        UUID promotionSessionId,
        UUID academicYearId,
        String academicYearCode,
        UUID promotionId,
        String promotionCode,
        String promotionName,
        Integer sequenceNumber,
        PaymentPlanInstallment type,
        BigDecimal amount,
        LocalDate dueDate
) {
    public static PaymentPlanInstallmentResponse from(com.payTrackEdu.application.domain.PaymentPlanInstallment installment) {
        var paymentPlan = installment.getPaymentPlan();
        var promotionSession = paymentPlan.getPromotionSession();
        var academicYear = promotionSession.getAcademicYear();
        var promotion = promotionSession.getPromotion();

        return new PaymentPlanInstallmentResponse(
                installment.getId(),
                paymentPlan.getId(),
                paymentPlan.getCode(),
                paymentPlan.getPlan(),
                promotionSession.getId(),
                academicYear.getId(),
                academicYear.getCode(),
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                installment.getSequenceNumber(),
                installment.getType(),
                installment.getAmount(),
                installment.getDueDate()
        );
    }
}
```

## promotion/PromotionRequest.java

```java
package com.payTrackEdu.application.dtos.promotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PromotionRequest(
        @NotBlank @Size(max = 150) String code,
        @NotBlank @Size(max = 150) String name,
        Boolean active
) {
}
```

## promotion/PromotionResponse.java

```java
package com.payTrackEdu.application.dtos.promotion;

import com.payTrackEdu.application.domain.Promotion;

import java.util.UUID;

public record PromotionResponse(
        UUID id,
        String code,
        String name,
        boolean active
) {
    public static PromotionResponse from(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                promotion.isActive()
        );
    }
}
```

## promotionSession/PromotionSessionRequest.java

```java
package com.payTrackEdu.application.dtos.promotionSession;

import com.payTrackEdu.application.enums.PromotionSessionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record PromotionSessionRequest(
        @NotNull UUID academicYearId,
        @NotNull UUID promotionId,
        @NotNull @DecimalMin(value = "0.00") BigDecimal registrationFee,
        PromotionSessionStatus status
) {
}
```

## promotionSession/PromotionSessionResponse.java

```java
package com.payTrackEdu.application.dtos.promotionSession;

import com.payTrackEdu.application.domain.PromotionSession;
import com.payTrackEdu.application.enums.PromotionSessionStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PromotionSessionResponse(
        UUID id,
        UUID academicYearId,
        String academicYearCode,
        UUID promotionId,
        String promotionCode,
        String promotionName,
        BigDecimal registrationFee,
        PromotionSessionStatus status
) {
    public static PromotionSessionResponse from(PromotionSession promotionSession) {
        return new PromotionSessionResponse(
                promotionSession.getId(),
                promotionSession.getAcademicYear().getId(),
                promotionSession.getAcademicYear().getCode(),
                promotionSession.getPromotion().getId(),
                promotionSession.getPromotion().getCode(),
                promotionSession.getPromotion().getName(),
                promotionSession.getRegistrationFee(),
                promotionSession.getStatus()
        );
    }
}
```

## student/StudentRequest.java

```java
package com.payTrackEdu.application.dtos.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudentRequest(
        @NotBlank @Size(max = 150) String firstName,
        @NotBlank @Size(max = 150) String lastName,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(max = 150) String phoneNumber1,
        @NotBlank @Size(max = 150) String phoneNumber2,
        @NotNull LocalDate birthDay,
        @NotBlank @Email @Size(max = 150) String parentEmail,
        @NotBlank @Size(max = 150) String parentPhone,
        Boolean active
) {
}
```

## student/StudentResponse.java

```java
package com.payTrackEdu.application.dtos.student;

import com.payTrackEdu.application.domain.Student;

import java.time.LocalDate;
import java.util.UUID;

public record StudentResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber1,
        String phoneNumber2,
        LocalDate birthDay,
        String parentEmail,
        String parentPhone,
        boolean active
) {
    public static StudentResponse from(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getPhoneNumber_1(),
                student.getPhoneNumber_2(),
                student.getBirthDay(),
                student.getParentEmail(),
                student.getParentPhone(),
                student.isActive()
        );
    }
}
```
