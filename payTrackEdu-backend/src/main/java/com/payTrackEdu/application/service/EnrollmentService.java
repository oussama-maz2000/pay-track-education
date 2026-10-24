package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.Enrollment;
import com.payTrackEdu.application.domain.PaymentPlan;
import com.payTrackEdu.application.domain.PromotionSession;
import com.payTrackEdu.application.domain.Student;
import com.payTrackEdu.application.dtos.enrollment.EnrollmentDto;
import com.payTrackEdu.application.dtos.enrollment.EnrollmentRequest;
import com.payTrackEdu.application.dtos.enrollment.EnrollmentResponse;
import com.payTrackEdu.application.enums.EnrollmentStatus;
import com.payTrackEdu.application.repository.EnrollmentRepository;
import com.payTrackEdu.application.repository.PromotionSessionRepository;
import com.payTrackEdu.application.repository.PaymentPlanRepository;
import com.payTrackEdu.application.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final PromotionSessionRepository promotionSessionRepository;
    private final PaymentPlanRepository paymentPlanRepository;
    private final PaymentAllocationService paymentAllocationService;
    private final EnrollmentInstallmentService enrollmentInstallmentService;

    @Transactional
    public EnrollmentResponse create(EnrollmentRequest request) {
        Student student = findStudent(request.studentId());
        PromotionSession promotionSession = findPromotionSession(request.promotionSessionId());
        PaymentPlan paymentPlan = findPaymentPlan(request.paymentPlanId());

        validatePaymentPlanBelongsToSession(paymentPlan, promotionSession.getId());
        validateUniqueEnrollment(student.getId(), promotionSession.getId(), null);

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setPromotionSession(promotionSession);
        enrollment.setPaymentPlan(paymentPlan);
        enrollment.setRegistrationFeeAmount(promotionSession.getRegistrationFee());
        enrollment.setTuitionAmount(paymentPlan.getTotalAmount());
        enrollment.setDiscountAmount(normalizeAmount(request.discountAmount()));
        enrollment.setDiscountReason(normalizeText(request.discountReason()));
        enrollment.setStatus(EnrollmentStatus.DRAFT);
        validateDiscountDoesNotExceedTotal(enrollment);

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        enrollmentInstallmentService.generateForEnrollment(savedEnrollment.getId());
        return toResponse(savedEnrollment);
    }

    @Transactional(readOnly = true)
    public EnrollmentResponse findById(UUID id) {
        return toResponse(findActiveEnrollment(id));
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentDto> findAll(String studentName, Pageable pageable) {
        String normalizedStudentName = normalizeText(studentName);
        Page<Enrollment> enrollments = normalizedStudentName == null
                ? enrollmentRepository.findAllWithDetails(pageable)
                : enrollmentRepository.findAllWithDetailsAndStudentNameContaining(normalizedStudentName, pageable);
        return enrollments
                .map(this::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByStudentId(UUID studentId) {
        findStudent(studentId);
        return enrollmentRepository.findByStudentIdWithDetails(studentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByPromotionSessionId(UUID promotionSessionId) {
        findPromotionSession(promotionSessionId);
        return enrollmentRepository.findByPromotionSessionIdWithDetails(promotionSessionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EnrollmentResponse update(UUID id, EnrollmentRequest request) {
        Enrollment enrollment = findActiveEnrollment(id);

        Student student = request.studentId() == null ? enrollment.getStudent() : findStudent(request.studentId());
        PromotionSession promotionSession = request.promotionSessionId() == null
                ? enrollment.getPromotionSession()
                : findPromotionSession(request.promotionSessionId());
        PaymentPlan paymentPlan = request.paymentPlanId() == null
                ? enrollment.getPaymentPlan()
                : findPaymentPlan(request.paymentPlanId());
        boolean paymentPlanChanged = !enrollment.getPaymentPlan().getId().equals(paymentPlan.getId());

        validatePaymentPlanBelongsToSession(paymentPlan, promotionSession.getId());
        validateUniqueEnrollment(student.getId(), promotionSession.getId(), enrollment.getId());

        enrollment.setStudent(student);
        enrollment.setPromotionSession(promotionSession);
        enrollment.setPaymentPlan(paymentPlan);
        enrollment.setRegistrationFeeAmount(promotionSession.getRegistrationFee());
        enrollment.setTuitionAmount(paymentPlan.getTotalAmount());
        if (request.discountAmount() != null) {
            enrollment.setDiscountAmount(normalizeAmount(request.discountAmount()));
        }
        if (request.discountReason() != null) {
            enrollment.setDiscountReason(normalizeText(request.discountReason()));
        }
        validateDiscountDoesNotExceedTotal(enrollment);

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        if (paymentPlanChanged) {
            enrollmentInstallmentService.synchronizeEnrollmentInstallments(savedEnrollment.getId());
        }
        return toResponse(savedEnrollment);
    }

    @Transactional
    public EnrollmentResponse activate(UUID id) {
        Enrollment enrollment = findActiveEnrollment(id);
        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED || enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Enrollment cannot be activated from status " + enrollment.getStatus());
        }
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public EnrollmentResponse suspend(UUID id) {
        Enrollment enrollment = findActiveEnrollment(id);
        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED || enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Enrollment cannot be suspended from status " + enrollment.getStatus());
        }
        enrollment.setStatus(EnrollmentStatus.SUSPENDED);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public EnrollmentResponse cancel(UUID id) {
        Enrollment enrollment = findActiveEnrollment(id);
        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Completed enrollment cannot be cancelled");
        }
        enrollment.setStatus(EnrollmentStatus.CANCELLED);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateTuitionAmount(UUID enrollmentId) {
        return normalizeAmount(findActiveEnrollment(enrollmentId).getTuitionAmount());
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateTotalAmount(UUID enrollmentId) {
        return calculateTotalAmount(findActiveEnrollment(enrollmentId));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateFinalAmount(UUID enrollmentId) {
        return calculateFinalAmount(findActiveEnrollment(enrollmentId));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculatePaidAmount(UUID enrollmentId) {
        findActiveEnrollment(enrollmentId);
        return paymentAllocationService.calculateEnrollmentPaidAmount(enrollmentId);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateRemainingAmount(UUID enrollmentId) {
        Enrollment enrollment = findActiveEnrollment(enrollmentId);
        return calculateRemainingAmount(enrollment);
    }

    private Enrollment findActiveEnrollment(UUID id) {
        return enrollmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
    }

    private Student findStudent(UUID id) {
        return studentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private PromotionSession findPromotionSession(UUID id) {
        return promotionSessionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion session not found"));
    }

    private PaymentPlan findPaymentPlan(UUID id) {
        return paymentPlanRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment plan not found"));
    }

    private void validatePaymentPlanBelongsToSession(PaymentPlan paymentPlan, UUID promotionSessionId) {
        if (!paymentPlan.getPromotionSession().getId().equals(promotionSessionId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment plan does not belong to the selected promotion session"
            );
        }
    }

    private void validateUniqueEnrollment(UUID studentId, UUID promotionSessionId, UUID ignoredId) {
        boolean enrollmentExists = ignoredId == null
                ? enrollmentRepository.existsActiveEnrollment(studentId, promotionSessionId)
                : enrollmentRepository.existsActiveEnrollmentForAnotherId(studentId, promotionSessionId, ignoredId);
        if (enrollmentExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Student already has an active enrollment for this promotion session"
            );
        }
    }

    private void validateDiscountDoesNotExceedTotal(Enrollment enrollment) {
        if (normalizeAmount(enrollment.getDiscountAmount()).compareTo(calculateTotalAmount(enrollment)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount amount cannot exceed total amount");
        }
    }

    private EnrollmentDto toResponseDto(Enrollment enrollment) {
        BigDecimal totalAmount = calculateTotalAmount(enrollment);
        BigDecimal finalAmount = calculateFinalAmount(enrollment);
        BigDecimal paidAmount = calculatePaidAmount(enrollment);
        BigDecimal remainingAmount = finalAmount.subtract(paidAmount);

        return EnrollmentDto.from(enrollment, totalAmount, finalAmount, paidAmount, remainingAmount);
    }


    private EnrollmentResponse toResponse(Enrollment enrollment) {
        BigDecimal totalAmount = calculateTotalAmount(enrollment);
        BigDecimal finalAmount = calculateFinalAmount(enrollment);
        BigDecimal paidAmount = calculatePaidAmount(enrollment);
        BigDecimal remainingAmount = finalAmount.subtract(paidAmount);

        return EnrollmentResponse.from(enrollment, totalAmount, finalAmount, paidAmount, remainingAmount);
    }

    private BigDecimal calculateTotalAmount(Enrollment enrollment) {
        return normalizeAmount(enrollment.getRegistrationFeeAmount()).add(normalizeAmount(enrollment.getTuitionAmount()));
    }

    private BigDecimal calculateFinalAmount(Enrollment enrollment) {
        return calculateTotalAmount(enrollment).subtract(normalizeAmount(enrollment.getDiscountAmount()));
    }

    private BigDecimal calculatePaidAmount(Enrollment enrollment) {
        return paymentAllocationService.calculateEnrollmentPaidAmount(enrollment.getId());
    }

    private BigDecimal calculateRemainingAmount(Enrollment enrollment) {
        return calculateFinalAmount(enrollment).subtract(calculatePaidAmount(enrollment));
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? ZERO : amount;
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
