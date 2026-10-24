package com.payTrackEdu.application.service;


import com.payTrackEdu.application.domain.RefreshToken;
import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.dtos.auth.AuthResponse;
import com.payTrackEdu.application.dtos.auth.LoginRequest;
import com.payTrackEdu.application.dtos.auth.RefreshRequest;
import com.payTrackEdu.application.dtos.auth.UserProfileResponse;
import com.payTrackEdu.application.repository.RefreshTokenRep;
import com.payTrackEdu.application.repository.UserRepository;
import com.payTrackEdu.application.security.JwtProperties;
import com.payTrackEdu.application.security.JwtTokenProvider;
import com.payTrackEdu.application.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRep refreshTokenRepository;
    private final JwtProperties jwtProperties;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        var user = ((UserPrincipal) authentication.getPrincipal()).getUser();
        refreshTokenRepository.deleteByUserId(user.getId());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        var stored = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (!jwtTokenProvider.isValid(token)) {
            refreshTokenRepository.deleteByToken(token);
            throw new IllegalArgumentException("Invalid refresh token");
        }
        var user = userRepository.findByEmailAndIsActiveTrue(jwtTokenProvider.extractEmail(token))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
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
        User user=userRepository.findByEmail(email).orElseThrow();
        return UserProfileResponse.from(user);


    }

}
