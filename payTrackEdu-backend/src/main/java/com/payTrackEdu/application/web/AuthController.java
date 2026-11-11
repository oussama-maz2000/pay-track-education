package com.payTrackEdu.application.web;


import com.payTrackEdu.application.config.Ratelimited;
import com.payTrackEdu.application.dtos.auth.AuthResponse;
import com.payTrackEdu.application.dtos.auth.ForgotPasswordRequest;
import com.payTrackEdu.application.dtos.auth.LoginRequest;
import com.payTrackEdu.application.dtos.auth.RefreshRequest;
import com.payTrackEdu.application.dtos.auth.ResetPasswordRequest;
import com.payTrackEdu.application.dtos.auth.UserProfileResponse;
import com.payTrackEdu.application.service.AuthService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Ratelimited(name = "login-ip", capacity = 100, window = 20, unit = TimeUnit.MINUTES,key = Ratelimited.KeyType.IP)
    @Ratelimited(name = "login-email", capacity = 10, window = 20, unit = TimeUnit.MINUTES,key = Ratelimited.KeyType.EXPRESSION,expression = "#request.email().trim().toLowerCase()")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/refresh")
    @Ratelimited(name = "refresh-ip",capacity = 60,window = 15)
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(request)));
    }

    @PostMapping("/forgot-password")
    @Ratelimited(name = "forgot-password-id", capacity = 30, window = 1, unit = TimeUnit.HOURS,key = Ratelimited.KeyType.IP)
    @Ratelimited(name = "forgot-password-email", capacity = 3, window = 1, unit = TimeUnit.HOURS,key = Ratelimited.KeyType.EXPRESSION,expression = "#request.email().trim().toLowerCase()")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If an active account exists for this email, an OTP has been sent.",
                null
        ));
    }

    @PostMapping("/reset-password")
    @Ratelimited(name = "reset-password-id", capacity = 30, window = 15)
    @Ratelimited(name = "reset-password-email", capacity = 10, window = 15, unit = TimeUnit.HOURS,key = Ratelimited.KeyType.EXPRESSION,expression = "#request.email().trim().toLowerCase()")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully.", null));
    }


    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(authService.me(userDetails.getUsername())));
    }
}
