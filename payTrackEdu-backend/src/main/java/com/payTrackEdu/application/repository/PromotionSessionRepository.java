package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.PromotionSession;
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
public interface PromotionSessionRepository extends JpaRepository<PromotionSession, UUID> {

    @Query("""
            SELECT CASE WHEN COUNT(ps) > 0 THEN true ELSE false END
            FROM PromotionSession ps
            WHERE ps.academicYear.id = :academicYearId
              AND ps.promotion.id = :promotionId
              AND ps.deleted = false
            """)
    boolean existsActiveSession(
            @Param("academicYearId") UUID academicYearId,
            @Param("promotionId") UUID promotionId
    );

    @Query("""
            SELECT CASE WHEN COUNT(ps) > 0 THEN true ELSE false END
            FROM PromotionSession ps
            WHERE ps.academicYear.id = :academicYearId
              AND ps.promotion.id = :promotionId
              AND ps.id <> :id
              AND ps.deleted = false
            """)
    boolean existsActiveSessionForAnotherId(
            @Param("academicYearId") UUID academicYearId,
            @Param("promotionId") UUID promotionId,
            @Param("id") UUID id
    );

    @Query("""
            SELECT ps FROM PromotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE ps.deleted = false
            ORDER BY ps.academicYear.startDate DESC, ps.promotion.name ASC
            """)
    Page<PromotionSession> findAllWithDetails(Pageable pageable);

    @Query("""
            SELECT ps FROM PromotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE ps.id = :id AND ps.deleted = false
            """)
    Optional<PromotionSession> findByIdWithDetails(@Param("id") UUID id);


    @Query("""
            SELECT ps FROM PromotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE ps.id = :id AND ps.deleted = true
            """)
    Optional<PromotionSession> findByIdAndDeletedTrue(UUID id);

    @Query("""
            SELECT ps FROM PromotionSession ps
            JOIN FETCH ps.promotion
            JOIN FETCH ps.academicYear
            WHERE ps.code IS NULL
            """)
    List<PromotionSession> findAllWithoutCodeWithDetails();
}
