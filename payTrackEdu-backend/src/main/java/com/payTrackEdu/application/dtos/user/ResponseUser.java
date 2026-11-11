package com.payTrackEdu.application.dtos.user;

import com.payTrackEdu.application.enums.Role;

import java.time.LocalDate;
import java.util.UUID;

public record ResponseUser(
        UUID id,
        String fullName,
        String userName,
        String email,
        Role role,
        String phone,
        boolean isActive,
        LocalDate createdAt,
        String createdBy) {
}
