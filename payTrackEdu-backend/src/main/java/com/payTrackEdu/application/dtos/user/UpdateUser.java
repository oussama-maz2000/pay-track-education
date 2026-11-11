package com.payTrackEdu.application.dtos.user;

import com.payTrackEdu.application.enums.Role;

public record UpdateUser(
        String fullName,
        String userName,
        String email,
        Role role,
        String phone,
        boolean isActive
) {
}
