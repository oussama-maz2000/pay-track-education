package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.payment.CancelPaymentRequest;
import com.payTrackEdu.application.dtos.payment.CreatePaymentRequest;
import com.payTrackEdu.application.dtos.payment.PaymentDto;
import com.payTrackEdu.application.dtos.payment.PaymentResponse;
import com.payTrackEdu.application.security.UserPrincipal;
import com.payTrackEdu.application.service.PaymentService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> create(
            @Valid @RequestBody CreatePaymentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created", paymentService.create(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.findById(id)));
    }

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<ApiResponse<Page<PaymentDto>>> findByEnrollmentId(@PathVariable UUID enrollmentId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.findByEnrollmentId(enrollmentId,pageable)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.findAll()));
    }

    @GetMapping("/enrollment/{enrollmentId}/paid-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculatePaidAmount(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.calculatePaidAmount(enrollmentId)));
    }

    @PatchMapping("/{paymentId}/cancel")
    public ResponseEntity<ApiResponse<PaymentResponse>> cancel(
            @PathVariable UUID paymentId,
            @Valid @RequestBody CancelPaymentRequest request,
            @AuthenticationPrincipal UserPrincipal authenticatedUser
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment cancelled",
                paymentService.cancel(paymentId, request, authenticatedUser.getId())
        ));
    }
}
