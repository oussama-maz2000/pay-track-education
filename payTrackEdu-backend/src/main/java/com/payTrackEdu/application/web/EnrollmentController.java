package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.enrollment.EnrollmentDto;
import com.payTrackEdu.application.dtos.enrollment.EnrollmentRequest;
import com.payTrackEdu.application.dtos.enrollment.EnrollmentResponse;
import com.payTrackEdu.application.service.EnrollmentService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EnrollmentDto>>> findAll(
            @RequestParam(required = false) String studentName,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.findAll(studentName, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.findById(id)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> findByStudentId(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.findByStudentId(studentId)));
    }

    @GetMapping("/promotion-session/{promotionSessionId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> findByPromotionSessionId(
            @PathVariable UUID promotionSessionId
    ) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.findByPromotionSessionId(promotionSessionId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> create(
            @Valid @RequestBody EnrollmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Enrollment created", enrollmentService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody EnrollmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Enrollment updated", enrollmentService.update(id, request)));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Enrollment activated", enrollmentService.activate(id)));
    }

    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> suspend(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Enrollment suspended", enrollmentService.suspend(id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Enrollment cancelled", enrollmentService.cancel(id)));
    }

    @GetMapping("/{id}/tuition-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateTuitionAmount(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.calculateTuitionAmount(id)));
    }

    @GetMapping("/{id}/total-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateTotalAmount(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.calculateTotalAmount(id)));
    }

    @GetMapping("/{id}/final-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateFinalAmount(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.calculateFinalAmount(id)));
    }

    @GetMapping("/{id}/paid-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculatePaidAmount(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.calculatePaidAmount(id)));
    }

    @GetMapping("/{id}/remaining-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateRemainingAmount(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.calculateRemainingAmount(id)));
    }
}
