package com.payTrackEdu.application.dtos.user;

import com.payTrackEdu.application.enums.Role;

public record RequestUser(
        String fullName,
        String userName,
        String email,
        String password,
        Role role,
        String phone
) {
}
