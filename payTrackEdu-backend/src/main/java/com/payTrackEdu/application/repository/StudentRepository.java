package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.Student;
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
public interface StudentRepository extends JpaRepository<Student, UUID> {

    Page<Student> findAllByDeletedFalse(Pageable pageable);

    @Query("""
            SELECT s FROM Student s
            WHERE s.deleted = false
              AND (LOWER(s.firstName) LIKE LOWER(CONCAT('%', :studentName, '%'))
                   OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :studentName, '%'))
                   OR LOWER(CONCAT(s.firstName, ' ', s.lastName)) LIKE LOWER(CONCAT('%', :studentName, '%')))
            """)
    Page<Student> findAllByDeletedFalseAndNameContaining(@Param("studentName") String studentName, Pageable pageable);

    Optional<Student> findByIdAndDeletedFalse(UUID id);

    Optional<Student> findByIdAndDeletedTrue(UUID id);

    boolean existsByEmailIgnoreCaseAndDeletedFalse(String email);

    boolean existsByEmailIgnoreCaseAndDeletedFalseAndIdNot(String email, UUID id);
}
