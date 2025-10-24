package com.kanjimaster.backend.util;

import com.kanjimaster.backend.model.entity.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SecurityUtils {
    public static Optional<String> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        try {
            CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
            return Optional.of(customUserDetails.getId());
        } catch (ClassCastException e) {
            return Optional.empty();
        }
    }
}
