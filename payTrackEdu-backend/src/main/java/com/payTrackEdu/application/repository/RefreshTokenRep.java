package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRep  extends JpaRepository<RefreshToken,UUID> {
    Optional<RefreshToken> findByToken(String token);


    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.token = :token")
    long deleteByToken(@Param("token") String token);

    @Transactional
    long deleteByUserId(UUID userId);
}
