package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.EnrollmentInstallment;
import com.payTrackEdu.application.enums.EnrollmentInstallmentType;
import com.payTrackEdu.application.enums.InstallmentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentInstallmentRepository extends JpaRepository<EnrollmentInstallment, UUID> {

    @Query("""
            SELECT ei FROM EnrollmentInstallment ei
            JOIN FETCH ei.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.paymentPlan
            WHERE ei.id = :id AND ei.deleted = false
            """)
    Optional<EnrollmentInstallment> findByIdWithDetails(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT ei FROM EnrollmentInstallment ei
            JOIN FETCH ei.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.paymentPlan
            WHERE ei.id = :id AND ei.deleted = false
            """)
    Optional<EnrollmentInstallment> findByIdWithDetailsForUpdate(@Param("id") UUID id);

    @Query("""
            SELECT ei FROM EnrollmentInstallment ei
            JOIN FETCH ei.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.paymentPlan
            WHERE e.id = :enrollmentId AND ei.deleted = false
            ORDER BY ei.sequenceNumber ASC
            """)
    List<EnrollmentInstallment> findByEnrollmentIdWithDetails(@Param("enrollmentId") UUID enrollmentId);

    @Query("""
            SELECT ei FROM EnrollmentInstallment ei
            JOIN FETCH ei.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.paymentPlan
            WHERE e.id = :enrollmentId AND ei.deleted = false
            ORDER BY ei.sequenceNumber ASC
            """)
    Page<EnrollmentInstallment> findByEnrollmentIdWithDetails(@Param("enrollmentId") UUID enrollmentId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT ei FROM EnrollmentInstallment ei
            JOIN FETCH ei.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.paymentPlan
            WHERE e.id = :enrollmentId AND ei.deleted = false
            ORDER BY ei.sequenceNumber ASC
            """)
    List<EnrollmentInstallment> findByEnrollmentIdWithDetailsForUpdate(@Param("enrollmentId") UUID enrollmentId);

    @Query("""
            SELECT COALESCE(SUM(ei.expectedAmount), 0)
            FROM EnrollmentInstallment ei
            WHERE ei.enrollment.id = :enrollmentId
              AND ei.deleted = false
              AND ei.status <> :cancelledStatus
            """)
    BigDecimal sumExpectedAmountByEnrollmentId(
            @Param("enrollmentId") UUID enrollmentId,
            @Param("cancelledStatus") InstallmentStatus cancelledStatus
    );

    @Query("""
            SELECT COALESCE(SUM(ei.expectedAmount), 0)
            FROM EnrollmentInstallment ei
            WHERE ei.enrollment.id = :enrollmentId
              AND ei.type <> :registrationType
              AND ei.deleted = false
              AND ei.status <> :cancelledStatus
            """)
    BigDecimal sumTuitionAmountByEnrollmentId(
            @Param("enrollmentId") UUID enrollmentId,
            @Param("registrationType") EnrollmentInstallmentType registrationType,
            @Param("cancelledStatus") InstallmentStatus cancelledStatus
    );

    @Query("""
            SELECT CASE WHEN COUNT(ei) > 0 THEN true ELSE false END
            FROM EnrollmentInstallment ei
            WHERE ei.enrollment.id = :enrollmentId
              AND ei.deleted = false
              AND ei.status <> :cancelledStatus
            """)
    boolean existsNonCancelledByEnrollmentId(
            @Param("enrollmentId") UUID enrollmentId,
            @Param("cancelledStatus") InstallmentStatus cancelledStatus
    );
}
