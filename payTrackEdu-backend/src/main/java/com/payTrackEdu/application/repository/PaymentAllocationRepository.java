package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.PaymentAllocation;
import com.payTrackEdu.application.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, UUID> {

    @Query("""
            SELECT pa FROM PaymentAllocation pa
            JOIN FETCH pa.payment p
            JOIN FETCH pa.enrollmentInstallment ei
            WHERE p.id = :paymentId
            ORDER BY ei.sequenceNumber ASC, pa.createdAt ASC
            """)
    List<PaymentAllocation> findByPaymentId(@Param("paymentId") UUID paymentId);

    @Query("""
            SELECT pa FROM PaymentAllocation pa
            JOIN FETCH pa.payment p
            JOIN FETCH pa.enrollmentInstallment ei
            WHERE ei.id = :installmentId
            ORDER BY p.paymentDate ASC, pa.createdAt ASC
            """)
    List<PaymentAllocation> findByEnrollmentInstallmentId(@Param("installmentId") UUID installmentId);

    @Query("""
            SELECT COALESCE(SUM(pa.amount), 0)
            FROM PaymentAllocation pa
            WHERE pa.payment.id = :paymentId
            """)
    BigDecimal sumAllocatedAmount(@Param("paymentId") UUID paymentId);

    @Query("""
            SELECT COALESCE(SUM(pa.amount), 0)
            FROM PaymentAllocation pa
            WHERE pa.enrollmentInstallment.id = :installmentId
              AND pa.payment.status = :status
            """)
    BigDecimal sumPaidAmountByInstallmentId(
            @Param("installmentId") UUID installmentId,
            @Param("status") PaymentStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(pa.amount), 0)
            FROM PaymentAllocation pa
            WHERE pa.enrollmentInstallment.enrollment.id = :enrollmentId
              AND pa.enrollmentInstallment.status <> com.payTrackEdu.application.enums.InstallmentStatus.CANCELLED
              AND pa.payment.status = :status
            """)
    BigDecimal sumPaidAmountByEnrollmentId(
            @Param("enrollmentId") UUID enrollmentId,
            @Param("status") PaymentStatus status
    );

    @Query("""
            SELECT CASE WHEN COUNT(pa) > 0 THEN true ELSE false END
            FROM PaymentAllocation pa
            WHERE pa.enrollmentInstallment.enrollment.id = :enrollmentId
              AND pa.payment.status = :status
            """)
    boolean existsByEnrollmentIdAndPaymentStatus(
            @Param("enrollmentId") UUID enrollmentId,
            @Param("status") PaymentStatus status
    );
}
