package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    Page<Promotion> findAllByDeletedFalseOrderByNameAsc(Pageable pageable);

    Optional<Promotion> findByIdAndDeletedFalse(UUID id);

    Optional<Promotion> findByIdAndDeletedTrue(UUID id);

    boolean existsByCodeIgnoreCaseAndDeletedFalse(String code);

    boolean existsByCodeIgnoreCaseAndDeletedFalseAndIdNot(String code, UUID id);

    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);

    boolean existsByNameIgnoreCaseAndDeletedFalseAndIdNot(String name, UUID id);




}
