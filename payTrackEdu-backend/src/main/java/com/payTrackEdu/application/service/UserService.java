package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.dtos.user.*;
import com.payTrackEdu.application.enums.Role;
import com.payTrackEdu.application.exception.BadRequestException;
import com.payTrackEdu.application.exception.ConflictException;
import com.payTrackEdu.application.exception.DuplicateResourceException;
import com.payTrackEdu.application.exception.ResourceNotFoundException;
import com.payTrackEdu.application.repository.RefreshTokenRep;
import com.payTrackEdu.application.repository.UserRepository;
import com.payTrackEdu.application.utils.OwnMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RefreshTokenRep refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<ResponseUser> getAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(OwnMapper.INSTANCE_MAPPER::fromUserToResponse);
    }

    public ResponseUser createUser(RequestUser requestUser) {
        String email= requestUser.email().trim().toLowerCase();
        if (userRepository.existsByEmailOrUserName(email, requestUser.userName())) {
            throw new DuplicateResourceException("L'adresse e-mail ou le nom d'utilisateur est déjà utilisé");
        }
        User user = OwnMapper.INSTANCE_MAPPER.fromUserDto(requestUser);
        user.setPassword(passwordEncoder.encode(requestUser.password()));
        user.setActive(true);
        try {
            return OwnMapper.INSTANCE_MAPPER.fromUserToResponse(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateResourceException("L'adresse e-mail ou le nom d'utilisateur est déjà utilisé");
        }
    }

    @Transactional
    public ResponseUser updateUser(UUID id, UpdateUser updateUser) {
        User user = findUser(id);
        OwnMapper.INSTANCE_MAPPER.fromRequestUserToEntity(updateUser, user);
        return OwnMapper.INSTANCE_MAPPER.fromUserToResponse(user);
    }

    @Transactional
    public ResponseUser deactivateUser(UUID id, UUID currentAdminId) {
        if(id.equals(currentAdminId)){
            throw new BadRequestException("Vous ne pouvez pas désactiver votre propre compte");
        }

        User user = findUser(id);
        if (user.getRole() == Role.ADMIN && user.isActive()
                && userRepository.countByRoleAndActiveTrue(Role.ADMIN) <= 1) {
            throw new ConflictException("Impossible de désactiver le dernier administrateur");
        }
        user.setActive(false);
        refreshTokenRepository.deleteByUserId(user.getId());
        return OwnMapper.INSTANCE_MAPPER.fromUserToResponse(user);
    }

    @Transactional
    public ResponseUser updatePasswordByAdmin(UUID id, UpdatePasswordRequest request) {
        User user = findUser(id);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        refreshTokenRepository.deleteByUserId(user.getId());
        return OwnMapper.INSTANCE_MAPPER.fromUserToResponse(user);
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    @Transactional
    public void updatePassword(UUID id, UpdateUserPassword userPassword) {
        User user = findUser(id);
        if (!passwordEncoder.matches(userPassword.oldPassword(), user.getPassword())) {
            throw new BadRequestException("Le mot de passe actuel est incorrect");
        }
        if (passwordEncoder.matches(userPassword.newPassword(), user.getPassword())) {
            throw new BadRequestException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        user.setPassword(passwordEncoder.encode(userPassword.newPassword()));

    }

}
