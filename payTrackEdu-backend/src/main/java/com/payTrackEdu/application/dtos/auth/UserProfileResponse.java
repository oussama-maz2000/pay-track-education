package com.payTrackEdu.application.dtos.auth;


import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.enums.Role;

import java.util.UUID;

public record UserProfileResponse(UUID id, String fullName, String userName, String email, Role role, String phone,
                                  boolean isActive) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(user.getId(), user.getFullName(), user.getUserName(), user.getEmail(),
                user.getRole(), user.getPhone(), user.isActive());
    }
}
