package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.paymentAllocation.CreatePaymentAllocationRequest;
import com.payTrackEdu.application.dtos.paymentAllocation.PaymentAllocationResponse;
import com.payTrackEdu.application.enums.InstallmentStatus;
import com.payTrackEdu.application.service.PaymentAllocationService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment-allocations")
@RequiredArgsConstructor
public class PaymentAllocationController {

    private final PaymentAllocationService paymentAllocationService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentAllocationResponse>> allocate(
            @Valid @RequestBody CreatePaymentAllocationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Payment allocation created", paymentAllocationService.allocate(request)));
    }

    @PostMapping("/payment/{paymentId}/allocate")
    public ResponseEntity<ApiResponse<List<PaymentAllocationResponse>>> allocatePayment(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(ApiResponse.success("Payment allocated", paymentAllocationService.allocatePayment(paymentId)));
    }

    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<ApiResponse<List<PaymentAllocationResponse>>> findByPaymentId(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(ApiResponse.success(paymentAllocationService.findByPaymentId(paymentId)));
    }

    @GetMapping("/installment/{installmentId}")
    public ResponseEntity<ApiResponse<List<PaymentAllocationResponse>>> findByInstallmentId(
            @PathVariable UUID installmentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(paymentAllocationService.findByInstallmentId(installmentId)));
    }

    @GetMapping("/payment/{paymentId}/allocated-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateAllocatedAmount(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(ApiResponse.success(paymentAllocationService.calculateAllocatedAmount(paymentId)));
    }

    @GetMapping("/installment/{installmentId}/paid-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateInstallmentPaidAmount(@PathVariable UUID installmentId) {
        return ResponseEntity.ok(ApiResponse.success(paymentAllocationService.calculateInstallmentPaidAmount(installmentId)));
    }

    @GetMapping("/installment/{installmentId}/remaining-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateInstallmentRemainingAmount(@PathVariable UUID installmentId) {
        return ResponseEntity.ok(ApiResponse.success(paymentAllocationService.calculateInstallmentRemainingAmount(installmentId)));
    }

    @GetMapping("/installment/{installmentId}/status")
    public ResponseEntity<ApiResponse<InstallmentStatus>> calculateInstallmentStatus(@PathVariable UUID installmentId) {
        return ResponseEntity.ok(ApiResponse.success(paymentAllocationService.calculateInstallmentStatus(installmentId)));
    }
}
