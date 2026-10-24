package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.AcademicYear;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {
    Page<AcademicYear> findAllByDeletedFalseOrderByStartDateDesc(Pageable pageable);
    Optional<AcademicYear> findByIdAndDeletedFalse(UUID id);
    Optional<AcademicYear> findByIdAndDeletedTrue(UUID id);
    boolean existsByCodeIgnoreCaseAndDeletedFalse(String code);
    boolean existsByCodeIgnoreCaseAndDeletedFalseAndIdNot(String code, UUID id);
}
