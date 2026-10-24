package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.enrollmentInstallment.EnrollmentInstallmentDto;
import com.payTrackEdu.application.dtos.enrollmentInstallment.EnrollmentInstallmentResponse;
import com.payTrackEdu.application.dtos.enrollmentInstallment.UpdateEnrollmentInstallmentDueDateRequest;
import com.payTrackEdu.application.service.EnrollmentInstallmentService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollment-installments")
@RequiredArgsConstructor
public class EnrollmentInstallmentController {

    private final EnrollmentInstallmentService enrollmentInstallmentService;

    @PostMapping("/enrollment/{receivedEnrollmentId}/generate")
    public ResponseEntity<ApiResponse<Void>> generateForEnrollment(@PathVariable String receivedEnrollmentId) {
        UUID enrollmentId=UUID.fromString(receivedEnrollmentId);
        enrollmentInstallmentService.generateForEnrollment(enrollmentId);
        return ResponseEntity.ok(ApiResponse.success("Enrollment installments generated", null));
    }

    @PostMapping("/enrollment/{enrollmentId}/synchronize")
    public ResponseEntity<ApiResponse<Void>> synchronizeEnrollmentInstallments(@PathVariable UUID enrollmentId) {
        enrollmentInstallmentService.synchronizeEnrollmentInstallments(enrollmentId);
        return ResponseEntity.ok(ApiResponse.success("Enrollment installments synchronized", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentInstallmentResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentInstallmentService.findById(id)));
    }

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<ApiResponse<Page<EnrollmentInstallmentDto>>> findByEnrollmentId(
            @PathVariable UUID enrollmentId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentInstallmentService.findByEnrollmentId(enrollmentId,pageable)));
    }

    @GetMapping("/enrollment/{enrollmentId}/tuition-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateTuitionAmount(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentInstallmentService.calculateTuitionAmount(enrollmentId)));
    }

    @GetMapping("/enrollment/{enrollmentId}/total-expected-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateTotalExpectedAmount(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentInstallmentService.calculateTotalExpectedAmount(enrollmentId)));
    }

    @PatchMapping("/{installmentId}/due-date")
    public ResponseEntity<ApiResponse<EnrollmentInstallmentResponse>> updateDueDate(
            @PathVariable UUID installmentId,
            @Valid @RequestBody UpdateEnrollmentInstallmentDueDateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Enrollment installment due date updated",
                enrollmentInstallmentService.updateDueDate(installmentId, request.dueDate())
        ));
    }

    @PatchMapping("/{installmentId}/cancel")
    public ResponseEntity<ApiResponse<EnrollmentInstallmentResponse>> cancel(@PathVariable UUID installmentId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Enrollment installment cancelled",
                enrollmentInstallmentService.cancel(installmentId)
        ));
    }
}
