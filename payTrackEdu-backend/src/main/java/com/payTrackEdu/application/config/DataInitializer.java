package com.payTrackEdu.application.config;


import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.enums.Role;
import com.payTrackEdu.application.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email}")
    private String adminEmail;
    @Value("${app.bootstrap.admin-password}")
    private String adminPassword;
    @Value("${app.bootstrap.admin-name}")
    private String adminName;
    @Value("${app.bootstrap.admin-user-name}")
    private String adminUserName;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }
        User admin = new User();
        admin.setFullName(adminName);
        admin.setUserName(adminUserName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Bootstrap ADMIN created: {}", adminEmail);
    }
}
