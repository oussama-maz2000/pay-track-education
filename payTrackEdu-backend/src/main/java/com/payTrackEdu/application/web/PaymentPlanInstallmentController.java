package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.paymentPlanInstallment.PaymentPlanInstallmentDto;
import com.payTrackEdu.application.dtos.paymentPlanInstallment.PaymentPlanInstallmentRequest;
import com.payTrackEdu.application.dtos.paymentPlanInstallment.PaymentPlanInstallmentResponse;
import com.payTrackEdu.application.service.PaymentPlanInstallmentService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment-plan-installments")
@RequiredArgsConstructor
public class PaymentPlanInstallmentController {

    private final PaymentPlanInstallmentService paymentPlanInstallmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaymentPlanInstallmentDto>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(paymentPlanInstallmentService.getAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentPlanInstallmentResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(paymentPlanInstallmentService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentPlanInstallmentResponse>> create(
            @Valid @RequestBody PaymentPlanInstallmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment plan installment created", paymentPlanInstallmentService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentPlanInstallmentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentPlanInstallmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Payment plan installment updated", paymentPlanInstallmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        paymentPlanInstallmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Payment plan installment deleted", null));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentPlanInstallmentResponse>> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Payment plan installment restored", paymentPlanInstallmentService.restore(id)));
    }
}
