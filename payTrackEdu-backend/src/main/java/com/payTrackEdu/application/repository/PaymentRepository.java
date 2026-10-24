package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.Payment;
import com.payTrackEdu.application.enums.PaymentStatus;
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
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE p.id = :id
            """)
    Optional<Payment> findByIdWithDetails(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE p.id = :id
            """)
    Optional<Payment> findByIdWithDetailsForUpdate(@Param("id") UUID id);

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE e.id = :enrollmentId
            ORDER BY p.paymentDate DESC, p.createdAt DESC
            """)
    List<Payment> findByEnrollmentIdWithDetails(@Param("enrollmentId") UUID enrollmentId);


    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.enrollment e
            WHERE e.id = :enrollmentId
            ORDER BY p.paymentDate DESC, p.createdAt DESC
            """)
    Page<Payment> findByEnrollmentId(@Param("enrollmentId") UUID enrollmentId, Pageable pageable);

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.enrollment e
            JOIN FETCH e.student
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            ORDER BY p.paymentDate DESC, p.createdAt DESC
            """)
    List<Payment> findAllWithDetails();

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.enrollment.id = :enrollmentId
              AND p.status = :status
            """)
    BigDecimal sumAmountByEnrollmentIdAndStatus(
            @Param("enrollmentId") UUID enrollmentId,
            @Param("status") PaymentStatus status
    );

    boolean existsByReceiptNumber(String receiptNumber);
}
