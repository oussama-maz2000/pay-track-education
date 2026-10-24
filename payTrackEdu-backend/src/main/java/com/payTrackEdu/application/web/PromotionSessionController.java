package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.promotionSession.PromotionSessionDto;
import com.payTrackEdu.application.dtos.promotionSession.PromotionSessionRequest;
import com.payTrackEdu.application.dtos.promotionSession.PromotionSessionResponse;
import com.payTrackEdu.application.service.PromotionSessionService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/promotion-sessions")
@RequiredArgsConstructor
public class PromotionSessionController {

    private final PromotionSessionService promotionSessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PromotionSessionResponse>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(promotionSessionService.getAll(pageable)));
    }

    @GetMapping("/payment-plan-options")
    public ResponseEntity<ApiResponse<Page<PromotionSessionDto>>> getPaymentPlanOptions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(promotionSessionService.getPaymentPlanOptions(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionSessionResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(promotionSessionService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionSessionResponse>> create(
            @Valid @RequestBody PromotionSessionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Promotion session created", promotionSessionService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionSessionResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PromotionSessionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Promotion session updated", promotionSessionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        promotionSessionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Promotion session deleted", null));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionSessionResponse>> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Promotion session restored", promotionSessionService.restore(id)));
    }
}
