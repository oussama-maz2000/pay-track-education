package com.payTrackEdu.application.dtos.auth;


import com.payTrackEdu.application.enums.Role;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UUID userId,
        String fullName,
        String email,
        String userName,
        Role role
) {}
