package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.admin.AdminDashboardDto;
import com.kanjimaster.backend.model.dto.admin.AdminUserDto;
import com.kanjimaster.backend.model.dto.admin.RoleUpdateRequest;
import com.kanjimaster.backend.model.entity.Role;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.UserProfile;
import com.kanjimaster.backend.model.enums.RoleType;
import com.kanjimaster.backend.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminService {
    static Logger logger = LoggerFactory.getLogger(AdminService.class);
    
    UserRepository userRepository;
    RoleRepository roleRepository;
    KanjiRepository kanjiRepository;
    CompoundWordRepository compoundWordRepository;
    QuizHistoryRepository quizHistoryRepository;
    BattleHistoryRepository battleHistoryRepository;

    /**
     * Get dashboard statistics
     */
    public AdminDashboardDto getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusWeeks(1);
        LocalDateTime monthAgo = now.minusMonths(1);
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();

        long totalUsers = userRepository.count();
        long bannedUsers = userRepository.countByIsBannedIsTrue();
        long verifiedUsers = userRepository.countByIsVerifiedIsTrue();
        long adminUsers = userRepository.countByRoles_Name("ADMIN");

        return AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .totalKanji(kanjiRepository.count())
                .totalCompoundWords(compoundWordRepository.count())
                .totalQuizzes(quizHistoryRepository.count())
                .totalBattles(battleHistoryRepository.count())
                .activeUsersToday(userRepository.countUsersCreatedAfter(todayStart))
                .newUsersThisWeek(userRepository.countUsersCreatedAfter(weekAgo))
                .newUsersThisMonth(userRepository.countUsersCreatedAfter(monthAgo))
                .bannedUsers(bannedUsers)
                .verifiedUsers(verifiedUsers)
                .unverifiedUsers(totalUsers - verifiedUsers)
                .adminUsers(adminUsers)
                .regularUsers(totalUsers - adminUsers)
                .build();
    }

    /**
     * Get all users with pagination
     */
    public PagedResponse<AdminUserDto> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return PagedMapper.map(users.map(this::convertToAdminUserDto));
    }

    /**
     * Search users by keyword
     */
    public PagedResponse<AdminUserDto> searchUsers(String keyword, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(keyword, pageable);
        return PagedMapper.map(users.map(this::convertToAdminUserDto));
    }

    /**
     * Get user by ID
     */
    public AdminUserDto getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return convertToAdminUserDto(user);
    }

    /**
     * Update user roles
     */
    @Transactional
    public AdminUserDto updateUserRoles(String userId, RoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Role> newRoles = new ArrayList<>();
        for (String roleName : request.getRoles()) {
            try {
                RoleType.fromString(roleName); // Validate role name
                Role role = roleRepository.findByName(roleName)
                        .orElseGet(() -> {
                            Role newRole = Role.builder()
                                    .name(roleName)
                                    .build();
                            return roleRepository.save(newRole);
                        });
                newRoles.add(role);
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.ROLE_NOT_FOUND);
            }
        }

        user.setRoles(newRoles);
        User updatedUser = userRepository.save(user);
        
        logger.info("Updated roles for user {}: {}", userId, request.getRoles());
        return convertToAdminUserDto(updatedUser);
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        userRepository.delete(user);
        logger.info("Deleted user: {}", userId);
    }

    /**
     * Convert User entity to AdminUserDto
     */
    private AdminUserDto convertToAdminUserDto(User user) {
        UserProfile profile = user.getUserProfile();
        
        return AdminUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .isVerified(user.isVerified())
                .isBanned(user.isBanned())
                .bannedAt(user.getBannedAt())
                .banReason(user.getBanReason())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toList()))
                .username(profile != null ? profile.getFullName() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .totalPoints(profile != null ? profile.getTotalKanjiLearned() : 0)
                .battleWins(0) // TODO: Add battle stats
                .battleLosses(0) // TODO: Add battle stats
                .build();
    }

    /**
     * Verify if user has admin role
     */
    public boolean isUserAdmin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return user.getRoles().stream()
                .anyMatch(role -> RoleType.ADMIN.getName().equals(role.getName()));
    }

    /**
     * Grant admin role to user
     */
    @Transactional
    public AdminUserDto grantAdminRole(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Role adminRole = roleRepository.findByName(RoleType.ADMIN.getName())
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .name(RoleType.ADMIN.getName())
                            .build();
                    return roleRepository.save(newRole);
                });

        if (!user.getRoles().contains(adminRole)) {
            user.getRoles().add(adminRole);
            user = userRepository.save(user);
            logger.info("Granted ADMIN role to user: {}", userId);
        }

        return convertToAdminUserDto(user);
    }

    /**
     * Revoke admin role from user
     */
    @Transactional
    public AdminUserDto revokeAdminRole(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.getRoles().removeIf(role -> RoleType.ADMIN.getName().equals(role.getName()));
        user = userRepository.save(user);
        
        logger.info("Revoked ADMIN role from user: {}", userId);
        return convertToAdminUserDto(user);
    }

    /**
     * Ban user
     */
    @Transactional
    public AdminUserDto banUser(String userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setBanned(true);
        user.setBannedAt(LocalDateTime.now());
        user.setBanReason(reason);
        user = userRepository.save(user);
        
        logger.info("Banned user: {} with reason: {}", userId, reason);
        return convertToAdminUserDto(user);
    }

    /**
     * Unban user
     */
    @Transactional
    public AdminUserDto unbanUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setBanned(false);
        user.setBannedAt(null);
        user.setBanReason(null);
        user = userRepository.save(user);
        
        logger.info("Unbanned user: {}", userId);
        return convertToAdminUserDto(user);
    }
}
