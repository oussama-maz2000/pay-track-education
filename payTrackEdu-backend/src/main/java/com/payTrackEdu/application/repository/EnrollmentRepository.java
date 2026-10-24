package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.Enrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.student s
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            JOIN FETCH e.paymentPlan pp
            WHERE e.deleted = false
            ORDER BY ps.academicYear.startDate DESC, ps.promotion.name ASC, s.lastName ASC, s.firstName ASC
            """)
    Page<Enrollment> findAllWithDetails(Pageable pageable);

    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.student s
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            JOIN FETCH e.paymentPlan pp
            WHERE e.deleted = false
              AND (LOWER(s.firstName) LIKE LOWER(CONCAT('%', :studentName, '%'))
                   OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :studentName, '%'))
                   OR LOWER(CONCAT(s.firstName, ' ', s.lastName)) LIKE LOWER(CONCAT('%', :studentName, '%')))
            ORDER BY ps.academicYear.startDate DESC, ps.promotion.name ASC, s.lastName ASC, s.firstName ASC
            """)
    Page<Enrollment> findAllWithDetailsAndStudentNameContaining(
            @Param("studentName") String studentName,
            Pageable pageable
    );

    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.student s
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            JOIN FETCH e.paymentPlan pp
            WHERE e.id = :id AND e.deleted = false
            """)
    Optional<Enrollment> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.student s
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            JOIN FETCH e.paymentPlan pp
            WHERE s.id = :studentId AND e.deleted = false
            ORDER BY ps.academicYear.startDate DESC, ps.promotion.name ASC
            """)
    List<Enrollment> findByStudentIdWithDetails(@Param("studentId") UUID studentId);

    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.student s
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            JOIN FETCH e.paymentPlan pp
            WHERE ps.id = :promotionSessionId AND e.deleted = false
            ORDER BY s.lastName ASC, s.firstName ASC
            """)
    List<Enrollment> findByPromotionSessionIdWithDetails(@Param("promotionSessionId") UUID promotionSessionId);

    @Query("""
            SELECT e FROM Enrollment e
            JOIN FETCH e.student s
            JOIN FETCH e.promotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            JOIN FETCH e.paymentPlan pp
            WHERE pp.id = :paymentPlanId
              AND e.deleted = false
              AND e.status <> com.payTrackEdu.application.enums.EnrollmentStatus.CANCELLED
            ORDER BY s.lastName ASC, s.firstName ASC
            """)
    List<Enrollment> findActiveByPaymentPlanIdWithDetails(@Param("paymentPlanId") UUID paymentPlanId);

    @Query("""
            SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END
            FROM Enrollment e
            WHERE e.student.id = :studentId
              AND e.promotionSession.id = :promotionSessionId
              AND e.status <> com.payTrackEdu.application.enums.EnrollmentStatus.CANCELLED
              AND e.deleted = false
            """)
    boolean existsActiveEnrollment(
            @Param("studentId") UUID studentId,
            @Param("promotionSessionId") UUID promotionSessionId
    );

    @Query("""
            SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END
            FROM Enrollment e
            WHERE e.student.id = :studentId
              AND e.promotionSession.id = :promotionSessionId
              AND e.id <> :id
              AND e.status <> com.payTrackEdu.application.enums.EnrollmentStatus.CANCELLED
              AND e.deleted = false
            """)
    boolean existsActiveEnrollmentForAnotherId(
            @Param("studentId") UUID studentId,
            @Param("promotionSessionId") UUID promotionSessionId,
            @Param("id") UUID id
    );
}
