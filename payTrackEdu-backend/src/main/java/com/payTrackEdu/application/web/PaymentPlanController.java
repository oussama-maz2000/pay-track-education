package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanDto;
import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanForInstallment;
import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanRequest;
import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanResponse;
import com.payTrackEdu.application.service.PaymentPlanService;
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
@RequestMapping("/api/payment-plans")
@RequiredArgsConstructor
public class PaymentPlanController {

    private final PaymentPlanService paymentPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaymentPlanDto>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(paymentPlanService.getAll(pageable)));
    }


    @GetMapping("/for-installment")
    public ResponseEntity<ApiResponse<Page<PaymentPlanForInstallment>>> getPaymentPlanOptionsForInstallment(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(paymentPlanService.getAllForInstallment(pageable)));
    }



    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentPlanResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(paymentPlanService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentPlanResponse>> create(@Valid @RequestBody PaymentPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment plan created", paymentPlanService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentPlanResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentPlanRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Payment plan updated", paymentPlanService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        paymentPlanService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Payment plan deleted", null));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentPlanResponse>> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Payment plan restored", paymentPlanService.restore(id)));
    }
}
