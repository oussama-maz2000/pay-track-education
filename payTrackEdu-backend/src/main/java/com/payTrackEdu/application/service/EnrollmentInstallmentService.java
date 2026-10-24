package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.Enrollment;
import com.payTrackEdu.application.domain.EnrollmentInstallment;
import com.payTrackEdu.application.domain.PaymentPlanInstallment;
import com.payTrackEdu.application.dtos.enrollmentInstallment.EnrollmentInstallmentDto;
import com.payTrackEdu.application.dtos.enrollmentInstallment.EnrollmentInstallmentResponse;
import com.payTrackEdu.application.enums.EnrollmentInstallmentType;
import com.payTrackEdu.application.enums.InstallmentStatus;
import com.payTrackEdu.application.enums.PaymentStatus;
import com.payTrackEdu.application.repository.EnrollmentInstallmentRepository;
import com.payTrackEdu.application.repository.EnrollmentRepository;
import com.payTrackEdu.application.repository.PaymentAllocationRepository;
import com.payTrackEdu.application.repository.PaymentPlanInstallmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentInstallmentService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final EnrollmentInstallmentRepository enrollmentInstallmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentPlanInstallmentRepository paymentPlanInstallmentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final PaymentAllocationService paymentAllocationService;

    @Transactional
    public void generateForEnrollment(UUID enrollmentId) {
        Enrollment enrollment = findEnrollment(enrollmentId);
        if (enrollmentInstallmentRepository.existsNonCancelledByEnrollmentId(enrollmentId, InstallmentStatus.CANCELLED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Enrollment installments already generated");
        }

        List<EnrollmentInstallment> installments = buildInstallments(enrollment);
        applyDiscount(installments, normalizeAmount(enrollment.getDiscountAmount()));
        enrollmentInstallmentRepository.saveAll(installments);
    }

    /**
     * Replaces a student's schedule with the current templates of its payment plan.
     * A schedule with an active payment allocation is financial history and cannot be replaced.
     */
    @Transactional
    public void synchronizeEnrollmentInstallments(UUID enrollmentId) {
        Enrollment enrollment = findEnrollment(enrollmentId);
        synchronizeEnrollmentInstallments(enrollment);
    }

    /**
     * Synchronizes every unpaid enrollment using a payment plan. Enrollments with payments are
     * deliberately left unchanged so a plan-template edit never changes financial history.
     */
    @Transactional
    public void synchronizeUnpaidEnrollmentsForPaymentPlan(UUID paymentPlanId) {
        enrollmentRepository.findActiveByPaymentPlanIdWithDetails(paymentPlanId)
                .forEach(enrollment -> {
                    if (!hasActivePaymentAllocations(enrollment.getId())) {
                        synchronizeEnrollmentInstallments(enrollment);
                    }
                });
    }

    @Transactional(readOnly = true)
    public EnrollmentInstallmentResponse findById(UUID id) {
        return toResponse(findInstallment(id));
    }

    @Transactional(readOnly = true)
    public List<EnrollmentInstallmentResponse> findByEnrollmentId(UUID enrollmentId) {
        findEnrollment(enrollmentId);
        return enrollmentInstallmentRepository.findByEnrollmentIdWithDetails(enrollmentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentInstallmentDto> findByEnrollmentId(UUID enrollmentId,Pageable pageable) {
        findEnrollment(enrollmentId);
        return enrollmentInstallmentRepository.findByEnrollmentIdWithDetails(enrollmentId,pageable)
                .map(this::toResponseDto)
                ;
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateTuitionAmount(UUID enrollmentId) {
        Enrollment enrollment = findEnrollment(enrollmentId);
        List<EnrollmentInstallment> installments = enrollmentInstallmentRepository.findByEnrollmentIdWithDetails(enrollmentId);
        if (!installments.isEmpty()) {
            return installments.stream()
                    .filter(installment -> installment.getStatus() != InstallmentStatus.CANCELLED)
                    .filter(installment -> installment.getType() != EnrollmentInstallmentType.REGISTRATION)
                    .map(EnrollmentInstallment::getExpectedAmount)
                    .map(this::normalizeAmount)
                    .reduce(ZERO, BigDecimal::add);
        }

        BigDecimal tuitionAfterDiscount = normalizeAmount(enrollment.getTuitionAmount()).subtract(normalizeAmount(enrollment.getDiscountAmount()));
        return tuitionAfterDiscount.max(ZERO);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateTotalExpectedAmount(UUID enrollmentId) {
        Enrollment enrollment = findEnrollment(enrollmentId);
        List<EnrollmentInstallment> installments = enrollmentInstallmentRepository.findByEnrollmentIdWithDetails(enrollmentId);
        if (!installments.isEmpty()) {
            return installments.stream()
                    .filter(installment -> installment.getStatus() != InstallmentStatus.CANCELLED)
                    .map(EnrollmentInstallment::getExpectedAmount)
                    .map(this::normalizeAmount)
                    .reduce(ZERO, BigDecimal::add);
        }

        return normalizeAmount(enrollment.getRegistrationFeeAmount())
                .add(normalizeAmount(enrollment.getTuitionAmount()))
                .subtract(normalizeAmount(enrollment.getDiscountAmount()));
    }

    @Transactional
    public EnrollmentInstallmentResponse updateDueDate(UUID installmentId, LocalDate dueDate) {
        if (dueDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Due date is required");
        }
        EnrollmentInstallment installment = findInstallment(installmentId);
        if (installment.getStatus() == InstallmentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cancelled installment due date cannot be updated");
        }
        installment.setDueDate(dueDate);
        EnrollmentInstallment saved = enrollmentInstallmentRepository.save(installment);
        return toResponse(saved);
    }

    @Transactional
    public EnrollmentInstallmentResponse cancel(UUID installmentId) {
        EnrollmentInstallment installment = findInstallment(installmentId);
        if (installment.getStatus() == InstallmentStatus.CANCELLED) {
            return toResponse(installment);
        }
        installment.setStatus(InstallmentStatus.CANCELLED);
        EnrollmentInstallment saved = enrollmentInstallmentRepository.save(installment);
        return toResponse(saved);
    }

    private void synchronizeEnrollmentInstallments(Enrollment enrollment) {
        UUID enrollmentId = enrollment.getId();
        if (hasActivePaymentAllocations(enrollmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Enrollment installments cannot be synchronized because payments have already been allocated"
            );
        }

        List<EnrollmentInstallment> existingInstallments = enrollmentInstallmentRepository
                .findByEnrollmentIdWithDetailsForUpdate(enrollmentId);
        LocalDateTime deletedAt = LocalDateTime.now();
        existingInstallments.forEach(installment -> {
            installment.setDeleted(true);
            installment.setDeletedAt(deletedAt);
        });
        enrollmentInstallmentRepository.saveAll(existingInstallments);

        List<EnrollmentInstallment> installments = buildInstallments(enrollment);
        applyDiscount(installments, normalizeAmount(enrollment.getDiscountAmount()));
        enrollmentInstallmentRepository.saveAll(installments);
    }

    private boolean hasActivePaymentAllocations(UUID enrollmentId) {
        return paymentAllocationRepository.existsByEnrollmentIdAndPaymentStatus(enrollmentId, PaymentStatus.ACTIVE);
    }


    private EnrollmentInstallmentDto toResponseDto(EnrollmentInstallment installment) {
        BigDecimal paidAmount = normalizeAmount(paymentAllocationService.calculateInstallmentPaidAmount(installment.getId()));
        BigDecimal remainingAmount = normalizeAmount(installment.getExpectedAmount())
                .subtract(paidAmount)
                .max(ZERO);
        InstallmentStatus status = paymentAllocationService.calculateInstallmentStatus(installment.getId());

        return EnrollmentInstallmentDto.from(
                installment,
                paidAmount,
                remainingAmount,
                status
        );
    }
    private EnrollmentInstallmentResponse toResponse(EnrollmentInstallment installment) {
        BigDecimal paidAmount = normalizeAmount(paymentAllocationService.calculateInstallmentPaidAmount(installment.getId()));
        BigDecimal remainingAmount = normalizeAmount(installment.getExpectedAmount())
                .subtract(paidAmount)
                .max(ZERO);
        InstallmentStatus status = paymentAllocationService.calculateInstallmentStatus(installment.getId());

        return EnrollmentInstallmentResponse.from(
                installment,
                paidAmount,
                remainingAmount,
                status
        );
    }

    private Enrollment findEnrollment(UUID enrollmentId) {
        return enrollmentRepository.findByIdWithDetails(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
    }

    private EnrollmentInstallment findInstallment(UUID id) {
        return enrollmentInstallmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment installment not found"));
    }

    private List<EnrollmentInstallment> buildInstallments(Enrollment enrollment) {
        List<EnrollmentInstallment> installments = new ArrayList<>();

        EnrollmentInstallment registration = new EnrollmentInstallment();
        registration.setEnrollment(enrollment);
        registration.setSequenceNumber(1);
        registration.setType(EnrollmentInstallmentType.REGISTRATION);
        registration.setLabel("Registration fee");
        registration.setExpectedAmount(normalizeAmount(enrollment.getRegistrationFeeAmount()));
        registration.setDueDate(LocalDate.now());
        registration.setStatus(InstallmentStatus.PENDING);
        installments.add(registration);

        List<PaymentPlanInstallment> planInstallments = paymentPlanInstallmentRepository
                .findByPaymentPlanIdOrderBySequenceNumber(enrollment.getPaymentPlan().getId());
        int tuitionCounter = 1;
        for (PaymentPlanInstallment planInstallment : planInstallments) {
            EnrollmentInstallmentType type = toEnrollmentInstallmentType(planInstallment);
            EnrollmentInstallment installment = new EnrollmentInstallment();
            installment.setEnrollment(enrollment);
            installment.setSequenceNumber(planInstallment.getSequenceNumber() + 1);
            installment.setType(type);
            if (type == EnrollmentInstallmentType.TUITION) {
                installment.setLabel("Tuition " + tuitionCounter);
                tuitionCounter++;
            } else {
                installment.setLabel("Deposit");
            }
            installment.setExpectedAmount(normalizeAmount(planInstallment.getAmount()));
            installment.setDueDate(planInstallment.getDueDate());
            installment.setStatus(InstallmentStatus.PENDING);
            installments.add(installment);
        }

        return installments;
    }

    private EnrollmentInstallmentType toEnrollmentInstallmentType(PaymentPlanInstallment planInstallment) {
        return switch (planInstallment.getType()) {
            case DEPOSIT -> EnrollmentInstallmentType.DEPOSIT;
            case TUITION -> EnrollmentInstallmentType.TUITION;
        };
    }

    private void applyDiscount(List<EnrollmentInstallment> installments, BigDecimal discountAmount) {
        BigDecimal remainingDiscount = normalizeAmount(discountAmount);
        if (remainingDiscount.compareTo(ZERO) <= 0) {
            return;
        }

        remainingDiscount = reduceInstallments(installments, remainingDiscount, false);
        reduceInstallments(installments, remainingDiscount, true);
    }

    private BigDecimal reduceInstallments(
            List<EnrollmentInstallment> installments,
            BigDecimal discountAmount,
            boolean includeRegistration
    ) {
        BigDecimal remainingDiscount = discountAmount;
        for (int i = installments.size() - 1; i >= 0 && remainingDiscount.compareTo(ZERO) > 0; i--) {
            EnrollmentInstallment installment = installments.get(i);
            boolean isRegistration = installment.getType() == EnrollmentInstallmentType.REGISTRATION;
            if (isRegistration != includeRegistration) {
                continue;
            }

            BigDecimal expectedAmount = normalizeAmount(installment.getExpectedAmount());
            BigDecimal reduction = expectedAmount.min(remainingDiscount);
            installment.setExpectedAmount(expectedAmount.subtract(reduction));
            remainingDiscount = remainingDiscount.subtract(reduction);
        }
        return remainingDiscount;
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? ZERO : amount;
    }
}
