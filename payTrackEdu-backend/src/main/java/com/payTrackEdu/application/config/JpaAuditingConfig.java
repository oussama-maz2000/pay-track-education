package com.payTrackEdu.application.config;


import com.payTrackEdu.application.security.UserPrincipal;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()
                    || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
                return Optional.empty();
            }
            return Optional.of(principal.getUser().getUserName());
        };
    }
}
