package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.PaymentPlan;
import com.payTrackEdu.application.domain.PromotionSession;
import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanDto;
import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanForInstallment;
import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanRequest;
import com.payTrackEdu.application.dtos.paymentPlan.PaymentPlanResponse;
import com.payTrackEdu.application.repository.PaymentPlanRepository;
import com.payTrackEdu.application.repository.PaymentPlanInstallmentRepository;
import com.payTrackEdu.application.repository.PromotionSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentPlanService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final PaymentPlanRepository paymentPlanRepository;
    private final PromotionSessionRepository promotionSessionRepository;
    private final PaymentPlanInstallmentRepository paymentPlanInstallmentRepository;

    @Transactional(readOnly = true)
    public Page<PaymentPlanDto> getAll(Pageable pageable) {
        return paymentPlanRepository.findAllWithoutDetails(pageable)

                .map(PaymentPlanDto::from);
    }

    @Transactional(readOnly = true)
    public Page<PaymentPlanForInstallment> getAllForInstallment(Pageable pageable) {
        return paymentPlanRepository.findAllWithoutDetails(pageable)
                .map(PaymentPlanForInstallment::from);
    }

    @Transactional(readOnly = true)
    public PaymentPlanResponse getById(UUID id) {
        return PaymentPlanResponse.from(findActivePaymentPlan(id));
    }

    @Transactional
    public PaymentPlanResponse create(PaymentPlanRequest request) {
        validateUniquePlan(request.promotionSessionId(), request.code(), null);

        PaymentPlan paymentPlan = new PaymentPlan();
        applyRequest(paymentPlan, request);
        return PaymentPlanResponse.from(paymentPlanRepository.save(paymentPlan));
    }

    @Transactional
    public PaymentPlanResponse update(UUID id, PaymentPlanRequest request) {
        PaymentPlan paymentPlan = findActivePaymentPlan(id);
        validateUniquePlan(request.promotionSessionId(), request.code(), id);
        validateTotalAmountCoversInstallments(id, request.totalAmount());

        applyRequest(paymentPlan, request);
        return PaymentPlanResponse.from(paymentPlanRepository.save(paymentPlan));
    }

    @Transactional
    public void delete(UUID id) {
        PaymentPlan paymentPlan = findActivePaymentPlan(id);
        paymentPlan.setDeleted(true);
        paymentPlan.setDeletedAt(LocalDateTime.now());
        paymentPlanRepository.save(paymentPlan);
    }

    @Transactional
    public PaymentPlanResponse restore(UUID id) {
        PaymentPlan paymentPlan = paymentPlanRepository.findDeletedByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment plan not found"));
        validateUniquePlan(paymentPlan.getPromotionSession().getId(), paymentPlan.getCode(), paymentPlan.getId());
        paymentPlan.setDeleted(false);
        paymentPlan.setDeletedAt(null);
        return PaymentPlanResponse.from(paymentPlanRepository.save(paymentPlan));
    }

    private PaymentPlan findActivePaymentPlan(UUID id) {
        return paymentPlanRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment plan not found"));
    }

    private void applyRequest(PaymentPlan paymentPlan, PaymentPlanRequest request) {
        PromotionSession promotionSession = promotionSessionRepository.findByIdWithDetails(request.promotionSessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion session not found"));

        paymentPlan.setPromotionSession(promotionSession);
        paymentPlan.setCode(request.code().trim());
        paymentPlan.setPlan(request.plan());

        paymentPlan.setTotalAmount(request.totalAmount());
    }

    private void validateUniquePlan(UUID promotionSessionId, String code, UUID ignoredId) {
        String normalizedCode = code.trim();
        boolean planExists = ignoredId == null
                ? paymentPlanRepository.existsActivePlan(promotionSessionId, normalizedCode)
                : paymentPlanRepository.existsActivePlanForAnotherId(promotionSessionId, normalizedCode, ignoredId);
        if (planExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payment plan code already exists for this promotion session"
            );
        }
    }

    private void validateTotalAmountCoversInstallments(UUID paymentPlanId, BigDecimal totalAmount) {
        BigDecimal installmentsTotal = paymentPlanInstallmentRepository.sumActiveAmountsByPaymentPlanId(paymentPlanId);
        if (normalizeAmount(totalAmount).compareTo(normalizeAmount(installmentsTotal)) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment plan total amount cannot be less than its active installment total"
            );
        }
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? ZERO : amount;
    }
}
