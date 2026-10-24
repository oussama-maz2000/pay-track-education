package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.PaymentPlan;
import com.payTrackEdu.application.domain.PaymentPlanInstallment;
import com.payTrackEdu.application.dtos.paymentPlanInstallment.PaymentPlanInstallmentDto;
import com.payTrackEdu.application.dtos.paymentPlanInstallment.PaymentPlanInstallmentRequest;
import com.payTrackEdu.application.dtos.paymentPlanInstallment.PaymentPlanInstallmentResponse;
import com.payTrackEdu.application.repository.PaymentPlanInstallmentRepository;
import com.payTrackEdu.application.repository.PaymentPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentPlanInstallmentService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final PaymentPlanInstallmentRepository paymentPlanInstallmentRepository;
    private final PaymentPlanRepository paymentPlanRepository;
    private final EnrollmentInstallmentService enrollmentInstallmentService;

    @Transactional(readOnly = true)
    public Page<PaymentPlanInstallmentDto> getAll(Pageable pageable) {
        return paymentPlanInstallmentRepository.findAllWithDetails(pageable)
                .map(PaymentPlanInstallmentDto::from);
    }

    @Transactional(readOnly = true)
    public PaymentPlanInstallmentResponse getById(UUID id) {
        return PaymentPlanInstallmentResponse.from(findActiveInstallment(id));
    }

    @Transactional
    public PaymentPlanInstallmentResponse create(PaymentPlanInstallmentRequest request) {
        validateUniqueInstallment(request.paymentPlanId(), request.sequenceNumber(), null);
        validateInstallmentTotal(request.paymentPlanId(), request.amount(), null);

        PaymentPlanInstallment installment = new PaymentPlanInstallment();
        applyRequest(installment, request);
        PaymentPlanInstallment saved = paymentPlanInstallmentRepository.save(installment);
        enrollmentInstallmentService.synchronizeUnpaidEnrollmentsForPaymentPlan(request.paymentPlanId());
        return PaymentPlanInstallmentResponse.from(saved);
    }

    @Transactional
    public PaymentPlanInstallmentResponse update(UUID id, PaymentPlanInstallmentRequest request) {
        PaymentPlanInstallment installment = findActiveInstallment(id);
        UUID previousPaymentPlanId = installment.getPaymentPlan().getId();
        validateUniqueInstallment(request.paymentPlanId(), request.sequenceNumber(), id);
        validateInstallmentTotal(request.paymentPlanId(), request.amount(), id);

        applyRequest(installment, request);
        PaymentPlanInstallment saved = paymentPlanInstallmentRepository.save(installment);
        enrollmentInstallmentService.synchronizeUnpaidEnrollmentsForPaymentPlan(previousPaymentPlanId);
        if (!previousPaymentPlanId.equals(request.paymentPlanId())) {
            enrollmentInstallmentService.synchronizeUnpaidEnrollmentsForPaymentPlan(request.paymentPlanId());
        }
        return PaymentPlanInstallmentResponse.from(saved);
    }

    @Transactional
    public void delete(UUID id) {
        PaymentPlanInstallment installment = findActiveInstallment(id);
        UUID paymentPlanId = installment.getPaymentPlan().getId();
        installment.setDeleted(true);
        installment.setDeletedAt(LocalDateTime.now());
        paymentPlanInstallmentRepository.save(installment);
        enrollmentInstallmentService.synchronizeUnpaidEnrollmentsForPaymentPlan(paymentPlanId);
    }

    @Transactional
    public PaymentPlanInstallmentResponse restore(UUID id) {
        PaymentPlanInstallment installment = paymentPlanInstallmentRepository.findDeletedByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment plan installment not found"));
        validateUniqueInstallment(installment.getPaymentPlan().getId(), installment.getSequenceNumber(), installment.getId());
        validateInstallmentTotal(installment.getPaymentPlan().getId(), installment.getAmount(), installment.getId());
        installment.setDeleted(false);
        installment.setDeletedAt(null);
        PaymentPlanInstallment saved = paymentPlanInstallmentRepository.save(installment);
        enrollmentInstallmentService.synchronizeUnpaidEnrollmentsForPaymentPlan(installment.getPaymentPlan().getId());
        return PaymentPlanInstallmentResponse.from(saved);
    }

    private PaymentPlanInstallment findActiveInstallment(UUID id) {
        return paymentPlanInstallmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment plan installment not found"));
    }

    private void applyRequest(PaymentPlanInstallment installment, PaymentPlanInstallmentRequest request) {
        PaymentPlan paymentPlan = paymentPlanRepository.findByIdWithDetails(request.paymentPlanId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment plan not found"));

        installment.setPaymentPlan(paymentPlan);
        installment.setSequenceNumber(request.sequenceNumber());
        installment.setType(request.type());
        installment.setAmount(request.amount());
        installment.setDueDate(request.dueDate());
    }

    private void validateUniqueInstallment(UUID paymentPlanId, Integer sequenceNumber, UUID ignoredId) {
        boolean installmentExists = ignoredId == null
                ? paymentPlanInstallmentRepository.existsActiveInstallment(paymentPlanId, sequenceNumber)
                : paymentPlanInstallmentRepository.existsActiveInstallmentForAnotherId(paymentPlanId, sequenceNumber, ignoredId);
        if (installmentExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payment plan installment sequence already exists for this payment plan"
            );
        }
    }

    private void validateInstallmentTotal(UUID paymentPlanId, BigDecimal installmentAmount, UUID ignoredInstallmentId) {
        PaymentPlan paymentPlan = paymentPlanRepository.findByIdWithDetails(paymentPlanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment plan not found"));
        BigDecimal activeInstallmentsTotal = ignoredInstallmentId == null
                ? paymentPlanInstallmentRepository.sumActiveAmountsByPaymentPlanId(paymentPlanId)
                : paymentPlanInstallmentRepository.sumActiveAmountsByPaymentPlanIdExcludingInstallment(
                        paymentPlanId,
                        ignoredInstallmentId
                );
        BigDecimal projectedTotal = normalizeAmount(activeInstallmentsTotal).add(normalizeAmount(installmentAmount));

        if (projectedTotal.compareTo(normalizeAmount(paymentPlan.getTotalAmount())) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment plan installment total cannot exceed the payment plan total amount"
            );
        }
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? ZERO : amount;
    }
}
