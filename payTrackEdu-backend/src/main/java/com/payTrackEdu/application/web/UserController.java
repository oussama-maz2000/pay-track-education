package com.payTrackEdu.application.web;


import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.dtos.user.*;
import com.payTrackEdu.application.exception.InvalidAuthenticationException;
import com.payTrackEdu.application.security.UserPrincipal;
import com.payTrackEdu.application.service.UserService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ResponseUser>>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll(pageable)));
    }

    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseUser> createUser( @Valid @RequestBody RequestUser request) {

        ResponseUser created = userService.createUser(request);
        URI location = URI.create("/api/users/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")

    public ResponseEntity<ResponseUser> updateUser(@PathVariable String id,@Valid @RequestBody UpdateUser user) {
        return ResponseEntity.ok(userService.updateUser(UUID.fromString(id),user));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseUser> deactivateUser(@PathVariable UUID id,@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.deactivateUser(id,principal.getUser().getId()));
    }

    @PatchMapping("/{id}/password-by-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseUser> updatePasswordByAdmin(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePasswordRequest request
    ) {
        return ResponseEntity.ok(userService.updatePasswordByAdmin(id, request));
    }

    @PutMapping("/change-password")
    public void updatePasswordByUser(
            @AuthenticationPrincipal UserPrincipal principal,
           @Valid @RequestBody UpdateUserPassword updateUserPassword)
    {
        if (principal == null || principal.getUser() == null) {
            throw new InvalidAuthenticationException("Une authentification est requise");
        }

       userService.updatePassword(principal.getUser().getId(),updateUserPassword);
    }
}
