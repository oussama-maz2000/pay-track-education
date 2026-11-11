package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailAndActiveTrue(String email);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailOrUserName(String email,String username);
    boolean existsByRole(Role role);
    long countByRoleAndActiveTrue(Role role);
}
