package com.payTrackEdu.application.repository;

import com.payTrackEdu.application.domain.Otp;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<Otp, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select otp from Otp otp where otp.userId = :userId")
    Optional<Otp> findByUserIdForUpdate(@Param("userId") UUID userId);

    long deleteByUserId(UUID userId);
    @Modifying
    @Query("delete from Otp o where o.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
