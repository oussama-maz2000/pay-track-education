package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.EnrollmentInstallment;
import com.payTrackEdu.application.domain.Payment;
import com.payTrackEdu.application.domain.PaymentAllocation;
import com.payTrackEdu.application.dtos.paymentAllocation.CreatePaymentAllocationRequest;
import com.payTrackEdu.application.dtos.paymentAllocation.PaymentAllocationResponse;
import com.payTrackEdu.application.enums.InstallmentStatus;
import com.payTrackEdu.application.enums.PaymentStatus;
import com.payTrackEdu.application.repository.EnrollmentInstallmentRepository;
import com.payTrackEdu.application.repository.PaymentAllocationRepository;
import com.payTrackEdu.application.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentAllocationService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final PaymentAllocationRepository paymentAllocationRepository;
    private final PaymentRepository paymentRepository;
    private final EnrollmentInstallmentRepository enrollmentInstallmentRepository;

    @Transactional
    public PaymentAllocationResponse allocate(CreatePaymentAllocationRequest request) {
        validatePositiveAmount(request.amount());

        Payment payment = findPaymentForUpdate(request.paymentId());
        validatePaymentCanBeAllocated(payment);

        EnrollmentInstallment installment = findInstallmentForUpdate(request.installmentId());
        validateInstallmentCanBeAllocated(installment);
        validateSameEnrollment(payment, installment);

        BigDecimal allocationAmount = request.amount();
        BigDecimal paymentRemaining = calculatePaymentRemainingAmount(payment);
        if (paymentRemaining.compareTo(ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment is already fully allocated");
        }
        if (allocationAmount.compareTo(paymentRemaining) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Allocation amount exceeds payment remaining amount");
        }

        BigDecimal installmentRemaining = calculateInstallmentRemainingAmount(installment);
        if (installmentRemaining.compareTo(ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Installment is already fully paid");
        }
        if (allocationAmount.compareTo(installmentRemaining) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Allocation amount exceeds installment remaining amount");
        }

        PaymentAllocation allocation = createAllocation(payment, installment, allocationAmount);
        PaymentAllocation savedAllocation = paymentAllocationRepository.save(allocation);
        refreshInstallmentStatus(installment);
        return PaymentAllocationResponse.from(savedAllocation);
    }

    @Transactional
    public List<PaymentAllocationResponse> allocatePayment(UUID paymentId) {
        Payment payment = findPaymentForUpdate(paymentId);
        validatePaymentCanBeAllocated(payment);

        BigDecimal paymentRemaining = calculatePaymentRemainingAmount(payment);
        if (paymentRemaining.compareTo(ZERO) <= 0) {
            return Collections.emptyList();
        }

        List<PaymentAllocation> allocations = new ArrayList<>();
        List<EnrollmentInstallment> affectedInstallments = new ArrayList<>();
        List<EnrollmentInstallment> installments = enrollmentInstallmentRepository.findByEnrollmentIdWithDetailsForUpdate(
                payment.getEnrollment().getId()
        );

        for (EnrollmentInstallment installment : installments) {
            if (paymentRemaining.compareTo(ZERO) <= 0) {
                break;
            }
            if (installment.getStatus() == InstallmentStatus.CANCELLED) {
                continue;
            }

            BigDecimal installmentRemaining = calculateInstallmentRemainingAmount(installment);
            if (installmentRemaining.compareTo(ZERO) <= 0) {
                continue;
            }

            BigDecimal allocationAmount = paymentRemaining.min(installmentRemaining);
            PaymentAllocation allocation = createAllocation(payment, installment, allocationAmount);
            allocations.add(allocation);
            affectedInstallments.add(installment);
            paymentRemaining = paymentRemaining.subtract(allocationAmount);
        }

        List<PaymentAllocation> savedAllocations = paymentAllocationRepository.saveAll(allocations);
        affectedInstallments.forEach(this::refreshInstallmentStatus);

        return savedAllocations
                .stream()
                .map(PaymentAllocationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentAllocationResponse> findByPaymentId(UUID paymentId) {
        findPayment(paymentId);
        return paymentAllocationRepository.findByPaymentId(paymentId)
                .stream()
                .map(PaymentAllocationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentAllocationResponse> findByInstallmentId(UUID installmentId) {
        findInstallment(installmentId);
        return paymentAllocationRepository.findByEnrollmentInstallmentId(installmentId)
                .stream()
                .map(PaymentAllocationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateAllocatedAmount(UUID paymentId) {
        findPayment(paymentId);
        return normalizeAmount(paymentAllocationRepository.sumAllocatedAmount(paymentId));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateInstallmentPaidAmount(UUID installmentId) {
        findInstallment(installmentId);
        return normalizeAmount(paymentAllocationRepository.sumPaidAmountByInstallmentId(installmentId, PaymentStatus.ACTIVE));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateEnrollmentPaidAmount(UUID enrollmentId) {
        return normalizeAmount(paymentAllocationRepository.sumPaidAmountByEnrollmentId(enrollmentId, PaymentStatus.ACTIVE));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateInstallmentRemainingAmount(UUID installmentId) {
        EnrollmentInstallment installment = findInstallment(installmentId);
        return calculateInstallmentRemainingAmount(installment);
    }

    @Transactional(readOnly = true)
    public InstallmentStatus calculateInstallmentStatus(UUID installmentId) {
        EnrollmentInstallment installment = findInstallment(installmentId);
        return calculateInstallmentStatus(installment);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateEnrollmentRemainingPayableAmount(UUID enrollmentId) {
        BigDecimal expectedAmount = normalizeAmount(enrollmentInstallmentRepository.sumExpectedAmountByEnrollmentId(
                enrollmentId,
                InstallmentStatus.CANCELLED
        ));
        BigDecimal paidAmount = normalizeAmount(paymentAllocationRepository.sumPaidAmountByEnrollmentId(
                enrollmentId,
                PaymentStatus.ACTIVE
        ));
        BigDecimal remaining = expectedAmount.subtract(paidAmount);
        return remaining.compareTo(ZERO) < 0 ? ZERO : remaining;
    }

    @Transactional
    public void refreshInstallmentStatusesForPayment(UUID paymentId) {
        Payment payment = findPaymentForUpdate(paymentId);
        paymentAllocationRepository.findByPaymentId(payment.getId())
                .stream()
                .map(PaymentAllocation::getEnrollmentInstallment)
                .distinct()
                .forEach(this::refreshInstallmentStatus);
    }

    private Payment findPayment(UUID id) {
        return paymentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    private Payment findPaymentForUpdate(UUID id) {
        return paymentRepository.findByIdWithDetailsForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    private EnrollmentInstallment findInstallment(UUID id) {
        return enrollmentInstallmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment installment not found"));
    }

    private EnrollmentInstallment findInstallmentForUpdate(UUID id) {
        return enrollmentInstallmentRepository.findByIdWithDetailsForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment installment not found"));
    }

    private void validatePaymentCanBeAllocated(Payment payment) {
        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot allocate a cancelled payment");
        }
    }

    private void validateInstallmentCanBeAllocated(EnrollmentInstallment installment) {
        if (installment.getStatus() == InstallmentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot allocate a cancelled installment");
        }
    }

    private void validateSameEnrollment(Payment payment, EnrollmentInstallment installment) {
        if (!payment.getEnrollment().getId().equals(installment.getEnrollment().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment and installment belong to different enrollments"
            );
        }
    }

    private void validatePositiveAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Allocation amount must be greater than zero");
        }
    }

    private BigDecimal calculatePaymentRemainingAmount(Payment payment) {
        BigDecimal alreadyAllocated = normalizeAmount(paymentAllocationRepository.sumAllocatedAmount(payment.getId()));
        return normalizeAmount(payment.getAmount()).subtract(alreadyAllocated);
    }

    private BigDecimal calculateInstallmentRemainingAmount(EnrollmentInstallment installment) {
        BigDecimal paidAmount = normalizeAmount(paymentAllocationRepository.sumPaidAmountByInstallmentId(
                installment.getId(),
                PaymentStatus.ACTIVE
        ));
        BigDecimal remaining = normalizeAmount(installment.getExpectedAmount()).subtract(paidAmount);
        return remaining.compareTo(ZERO) < 0 ? ZERO : remaining;
    }

    private InstallmentStatus calculateInstallmentStatus(EnrollmentInstallment installment) {
        if (installment.getStatus() == InstallmentStatus.CANCELLED) {
            return InstallmentStatus.CANCELLED;
        }

        BigDecimal paidAmount = normalizeAmount(paymentAllocationRepository.sumPaidAmountByInstallmentId(
                installment.getId(),
                PaymentStatus.ACTIVE
        ));
        BigDecimal expectedAmount = normalizeAmount(installment.getExpectedAmount());

        if (paidAmount.compareTo(expectedAmount) >= 0) {
            return InstallmentStatus.PAID;
        }

        BigDecimal remainingAmount = expectedAmount.subtract(paidAmount);
        if (installment.getDueDate() != null
                && installment.getDueDate().isBefore(LocalDate.now())
                && remainingAmount.compareTo(ZERO) > 0) {
            return InstallmentStatus.OVERDUE;
        }

        if (paidAmount.compareTo(ZERO) > 0 && paidAmount.compareTo(expectedAmount) < 0) {
            return InstallmentStatus.PARTIALLY_PAID;
        }

        return InstallmentStatus.PENDING;
    }

    private void refreshInstallmentStatus(EnrollmentInstallment installment) {
        if (installment.getStatus() != InstallmentStatus.CANCELLED) {
            installment.setStatus(calculateInstallmentStatus(installment));
        }
    }

    private PaymentAllocation createAllocation(
            Payment payment,
            EnrollmentInstallment installment,
            BigDecimal amount
    ) {
        PaymentAllocation allocation = new PaymentAllocation();
        allocation.setPayment(payment);
        allocation.setEnrollmentInstallment(installment);
        allocation.setAmount(amount);
        return allocation;
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? ZERO : amount;
    }
}
