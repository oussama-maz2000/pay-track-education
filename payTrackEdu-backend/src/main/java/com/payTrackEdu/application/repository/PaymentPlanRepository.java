package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.PaymentPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentPlanRepository extends JpaRepository<PaymentPlan, UUID> {

    @Query("""
            SELECT pp FROM PaymentPlan pp
            JOIN FETCH pp.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE pp.deleted = false
            ORDER BY ps.academicYear.startDate DESC, ps.promotion.name ASC, pp.code ASC
            """)
    Page<PaymentPlan> findAllWithoutDetails(Pageable pageable);

    @Query("""
            SELECT pp FROM PaymentPlan pp
            JOIN FETCH pp.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE pp.id = :id AND pp.deleted = false
            """)
    Optional<PaymentPlan> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
            SELECT pp FROM PaymentPlan pp
            JOIN FETCH pp.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE pp.id = :id AND pp.deleted = true
            """)
    Optional<PaymentPlan> findDeletedByIdWithDetails(@Param("id") UUID id);

    @Query("""
            SELECT CASE WHEN COUNT(pp) > 0 THEN true ELSE false END
            FROM PaymentPlan pp
            WHERE pp.promotionSession.id = :promotionSessionId
              AND LOWER(pp.code) = LOWER(:code)
              AND pp.deleted = false
            """)
    boolean existsActivePlan(
            @Param("promotionSessionId") UUID promotionSessionId,
            @Param("code") String code
    );

    @Query("""
            SELECT CASE WHEN COUNT(pp) > 0 THEN true ELSE false END
            FROM PaymentPlan pp
            WHERE pp.promotionSession.id = :promotionSessionId
              AND LOWER(pp.code) = LOWER(:code)
              AND pp.id <> :id
              AND pp.deleted = false
            """)
    boolean existsActivePlanForAnotherId(
            @Param("promotionSessionId") UUID promotionSessionId,
            @Param("code") String code,
            @Param("id") UUID id
    );
}
