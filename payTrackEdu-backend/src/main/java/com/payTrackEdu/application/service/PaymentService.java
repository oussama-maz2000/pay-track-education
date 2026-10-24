package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.Enrollment;
import com.payTrackEdu.application.domain.Payment;
import com.payTrackEdu.application.dtos.payment.CancelPaymentRequest;
import com.payTrackEdu.application.dtos.payment.CreatePaymentRequest;
import com.payTrackEdu.application.dtos.payment.PaymentDto;
import com.payTrackEdu.application.dtos.payment.PaymentResponse;
import com.payTrackEdu.application.enums.EnrollmentStatus;
import com.payTrackEdu.application.enums.PaymentStatus;
import com.payTrackEdu.application.repository.EnrollmentRepository;
import com.payTrackEdu.application.repository.PaymentRepository;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final DateTimeFormatter RECEIPT_DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentAllocationService paymentAllocationService;

    @Transactional
    public PaymentResponse create(CreatePaymentRequest request) {
        Enrollment enrollment = findEnrollment(request.enrollmentId());
        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment cannot be created for a cancelled enrollment");
        }

        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount must be greater than zero");
        }
        BigDecimal remainingPayableAmount = paymentAllocationService.calculateEnrollmentRemainingPayableAmount(enrollment.getId());
        if (request.amount().compareTo(remainingPayableAmount) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount exceeds remaining enrollment balance"
            );
        }

        Payment payment = new Payment();
        payment.setEnrollment(enrollment);
        payment.setReceiptNumber(generateReceiptNumber());
        payment.setPaymentDate(request.paymentDate() == null ? LocalDate.now() : request.paymentDate());
        payment.setAmount(request.amount());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setReference(normalizeText(request.reference()));
        payment.setNotes(normalizeText(request.notes()));
        payment.setStatus(PaymentStatus.ACTIVE);

        Payment savedPayment = paymentRepository.save(payment);
        paymentAllocationService.allocatePayment(savedPayment.getId());
        return PaymentResponse.from(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse findById(UUID id) {
        return PaymentResponse.from(findPayment(id));
    }

    @Transactional(readOnly = true)
    public Page<PaymentDto> findByEnrollmentId(UUID enrollmentId, Pageable pageable) {
        findEnrollment(enrollmentId);
        return paymentRepository.findByEnrollmentId(enrollmentId,pageable)
                .map(PaymentDto::from);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        return paymentRepository.findAllWithDetails()
                .stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal calculatePaidAmount(UUID enrollmentId) {
        findEnrollment(enrollmentId);
        return paymentAllocationService.calculateEnrollmentPaidAmount(enrollmentId);
    }

    @Transactional
    public PaymentResponse cancel(UUID paymentId, CancelPaymentRequest request, UUID cancelledBy) {
        Payment payment = findPayment(paymentId);
        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment is already cancelled");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setCancelledBy(cancelledBy);
        payment.setCancelledAt(LocalDateTime.now());
        payment.setCancellationReason(request.cancellationReason().trim());

        Payment savedPayment = paymentRepository.save(payment);
        paymentAllocationService.refreshInstallmentStatusesForPayment(savedPayment.getId());
        return PaymentResponse.from(savedPayment);
    }

    private Payment findPayment(UUID id) {
        return paymentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    private Enrollment findEnrollment(UUID id) {
        return enrollmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
    }

    private String generateReceiptNumber() {
        String datePart = LocalDate.now().format(RECEIPT_DATE_FORMAT);
        String receiptNumber;
        do {
            receiptNumber = "RCPT-" + datePart + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (paymentRepository.existsByReceiptNumber(receiptNumber));
        return receiptNumber;
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
