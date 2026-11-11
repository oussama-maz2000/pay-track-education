package com.payTrackEdu.application.service;


import com.payTrackEdu.application.domain.Otp;
import com.payTrackEdu.application.domain.RefreshToken;
import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.dtos.auth.AuthResponse;
import com.payTrackEdu.application.dtos.auth.ForgotPasswordRequest;
import com.payTrackEdu.application.dtos.auth.LoginRequest;
import com.payTrackEdu.application.dtos.auth.RefreshRequest;
import com.payTrackEdu.application.dtos.auth.ResetPasswordRequest;
import com.payTrackEdu.application.dtos.auth.UserProfileResponse;
import com.payTrackEdu.application.dtos.user.PasswordResetOtpIssued;
import com.payTrackEdu.application.exception.BadRequestException;
import com.payTrackEdu.application.exception.InvalidAuthenticationException;
import com.payTrackEdu.application.exception.ResourceNotFoundException;
import com.payTrackEdu.application.repository.OtpRepository;
import com.payTrackEdu.application.repository.RefreshTokenRep;
import com.payTrackEdu.application.repository.UserRepository;
import com.payTrackEdu.application.security.JwtProperties;
import com.payTrackEdu.application.security.JwtTokenProvider;
import com.payTrackEdu.application.security.UserPrincipal;
import com.payTrackEdu.application.utils.OtpUtils;
import com.payTrackEdu.application.utils.SenderMail;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final int MAX_OTP_ATTEMPTS = 5;
    @Value("${app.otp.expiry-minutes:10}")
    private long passwordResetOtpExpiryMinutes;


    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRep refreshTokenRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;
    private final OtpUtils otpHasher;
    private final ApplicationEventPublisher eventPublisher; // provided by Spring, no config needed
    private final Clock clock;

    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(120);

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email =request.email().trim().toLowerCase();
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        var user = ((UserPrincipal) authentication.getPrincipal()).getUser();
        refreshTokenRepository.deleteByUserId(user.getId());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        var stored = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidAuthenticationException("Jeton de rafraîchissement invalide"));
        if (!jwtTokenProvider.isValid(token)) {
            refreshTokenRepository.deleteByToken(token);
            throw new InvalidAuthenticationException("Jeton de rafraîchissement invalide");
        }
        var user = userRepository.findByEmailAndActiveTrue(jwtTokenProvider.extractEmail(token))
                .orElseThrow(() -> new InvalidAuthenticationException("Utilisateur introuvable"));
        // Rotate: delete the presented token, issue a fresh pair.
        refreshTokenRepository.deleteByToken(stored.getToken());
        return issueTokens(user);
    }



    private AuthResponse issueTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        RefreshToken entity = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshToken)
                .expiresAt(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpiry()))
                .build();
        refreshTokenRepository.save(entity);
        return new AuthResponse(accessToken, refreshToken, user.getId(),
                user.getFullName(), user.getEmail(), user.getUserName(), user.getRole());
    }

    public UserProfileResponse me(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return UserProfileResponse.from(user);


    }

    @Transactional()
    public void requestPasswordReset(ForgotPasswordRequest request) {
        userRepository.findByEmailAndActiveTrue(normalizeEmail(request.email()))
                .ifPresent(this::issueResetOtp);
    }

    private void issueResetOtp(User user){
        Instant now = clock.instant();
        Otp otp = otpRepository.findByUserIdForUpdate(user.getId()).orElseGet(Otp::new);
        if (otp.getCreatedAt() != null && otp.getCreatedAt().plus(RESEND_COOLDOWN).isAfter(now)) {
            return;
        }
        String rawOtp = otpHasher.generateOtp();
        otp.setUserId(user.getId());
        otp.setOtpHash(otpHasher.hash(rawOtp));
        otp.setCreatedAt(now);
        otp.setExpiresAt(now.plus(passwordResetOtpExpiryMinutes, ChronoUnit.MINUTES));
        otp.setFailedAttempts(0);
        otpRepository.save(otp);

        eventPublisher.publishEvent(new PasswordResetOtpIssued(user.getEmail(), rawOtp));
    }

    @Transactional(noRollbackFor = BadRequestException.class)
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailAndActiveTrue(normalizeEmail(request.email()))
                .orElseThrow(this::invalidResetToken);

        Otp otp = otpRepository.findByUserIdForUpdate(user.getId())
                .orElseThrow(this::invalidResetToken);

        if (!otp.getExpiresAt().isAfter(clock.instant())
                || otp.getFailedAttempts() >= MAX_OTP_ATTEMPTS) {
            throw invalidResetToken();
        }

        if (!otpHasher.matches(request.otp(), otp.getOtpHash())) {
            otp.setFailedAttempts(otp.getFailedAttempts() + 1);

            throw invalidResetToken();
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        otpRepository.delete(otp);
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private BadRequestException invalidResetToken() {
        return new BadRequestException("Ce lien de réinitialisation est invalide ou a expiré");
    }

}
