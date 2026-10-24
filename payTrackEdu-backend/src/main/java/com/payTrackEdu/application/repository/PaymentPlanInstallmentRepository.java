package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.PaymentPlanInstallment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentPlanInstallmentRepository extends JpaRepository<PaymentPlanInstallment, UUID> {

    @Query("""
            SELECT ppi FROM PaymentPlanInstallment ppi
            JOIN FETCH ppi.paymentPlan pp
            JOIN FETCH pp.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE ppi.deleted = false
            ORDER BY ps.academicYear.startDate DESC, ps.promotion.name ASC, pp.code ASC, ppi.sequenceNumber ASC
            """)
    Page<PaymentPlanInstallment> findAllWithDetails(Pageable pageable);

    @Query("""
            SELECT ppi FROM PaymentPlanInstallment ppi
            JOIN FETCH ppi.paymentPlan pp
            JOIN FETCH pp.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE ppi.id = :id AND ppi.deleted = false
            """)
    Optional<PaymentPlanInstallment> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
            SELECT ppi FROM PaymentPlanInstallment ppi
            JOIN FETCH ppi.paymentPlan pp
            JOIN FETCH pp.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE ppi.id = :id AND ppi.deleted = true
            """)
    Optional<PaymentPlanInstallment> findDeletedByIdWithDetails(@Param("id") UUID id);

    @Query("""
            SELECT ppi FROM PaymentPlanInstallment ppi
            WHERE ppi.paymentPlan.id = :paymentPlanId
              AND ppi.deleted = false
            ORDER BY ppi.sequenceNumber ASC
            """)
    List<PaymentPlanInstallment> findByPaymentPlanIdOrderBySequenceNumber(
            @Param("paymentPlanId") UUID paymentPlanId
    );

    @Query("""
            SELECT COALESCE(SUM(ppi.amount), 0)
            FROM PaymentPlanInstallment ppi
            WHERE ppi.paymentPlan.id = :paymentPlanId
              AND ppi.deleted = false
            """)
    BigDecimal sumActiveAmountsByPaymentPlanId(@Param("paymentPlanId") UUID paymentPlanId);

    @Query("""
            SELECT COALESCE(SUM(ppi.amount), 0)
            FROM PaymentPlanInstallment ppi
            WHERE ppi.paymentPlan.id = :paymentPlanId
              AND ppi.id <> :installmentId
              AND ppi.deleted = false
            """)
    BigDecimal sumActiveAmountsByPaymentPlanIdExcludingInstallment(
            @Param("paymentPlanId") UUID paymentPlanId,
            @Param("installmentId") UUID installmentId
    );

    @Query("""
            SELECT CASE WHEN COUNT(ppi) > 0 THEN true ELSE false END
            FROM PaymentPlanInstallment ppi
            WHERE ppi.paymentPlan.id = :paymentPlanId
              AND ppi.sequenceNumber = :sequenceNumber
              AND ppi.deleted = false
            """)
    boolean existsActiveInstallment(
            @Param("paymentPlanId") UUID paymentPlanId,
            @Param("sequenceNumber") Integer sequenceNumber
    );

    @Query("""
            SELECT CASE WHEN COUNT(ppi) > 0 THEN true ELSE false END
            FROM PaymentPlanInstallment ppi
            WHERE ppi.paymentPlan.id = :paymentPlanId
              AND ppi.sequenceNumber = :sequenceNumber
              AND ppi.id <> :id
              AND ppi.deleted = false
            """)
    boolean existsActiveInstallmentForAnotherId(
            @Param("paymentPlanId") UUID paymentPlanId,
            @Param("sequenceNumber") Integer sequenceNumber,
            @Param("id") UUID id
    );
}
