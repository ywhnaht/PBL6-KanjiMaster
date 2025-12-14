package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.mapper.UserProfileMapper;
import com.kanjimaster.backend.model.dto.UpdatePasswordRequest;
import com.kanjimaster.backend.model.dto.UpdateProfileRequest;
import com.kanjimaster.backend.model.dto.UserProfileDto;
import com.kanjimaster.backend.model.dto.UserStatsDto;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.UserProfile;
import com.kanjimaster.backend.repository.*;
import com.kanjimaster.backend.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileService {
    UserRepository userRepository;
    UserProfileRepository userProfileRepository;
    FileStorageService fileStorageService;
    PasswordEncoder passwordEncoder;
    KanjiProgressRepository kanjiProgressRepository;
    QuizHistoryRepository quizHistoryRepository;
    BattleHistoryRepository battleHistoryRepository;
    KanjiRepository kanjiRepository;
    UserProfileMapper userProfileMapper;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    /**
     * Lấy profile của user hiện tại
     */
    public UserProfileDto getCurrentUserProfile() {
        String userId = getCurrentUserId();
        return getUserProfileById(userId);
    }

    /**
     * Lấy profile của user theo ID
     */
    public UserProfileDto getUserProfileById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return userProfileMapper.toUserProfileDto(profile);
    }

    /**
     * Cập nhật profile (fullName, bio)
     */
    @Transactional
    public UserProfileDto updateProfile(UpdateProfileRequest request) {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // Cập nhật thông tin
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            profile.setFullName(request.getFullName().trim());
        }

        if (request.getBio() != null) {
            profile.setBio(request.getBio().trim());
        }

        userProfileRepository.save(profile);
        log.info("User {} đã cập nhật profile", userId);

        return userProfileMapper.toUserProfileDto(profile);
    }

    /**
     * Upload avatar mới
     */
    @Transactional
    public UserProfileDto updateAvatar(MultipartFile file) {
        // Validate file
        validateImageFile(file);

        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // Xóa avatar cũ trên Cloudinary (nếu không phải default)
        String oldAvatarUrl = profile.getAvatarUrl();
        if (oldAvatarUrl != null && !oldAvatarUrl.contains("ui-avatars.com")) {
            try {
                fileStorageService.deleteFile(oldAvatarUrl);
            } catch (Exception e) {
                log.warn("Failed to delete old avatar: {}", e.getMessage());
            }
        }

        // Upload file mới lên Cloudinary
        String newAvatarUrl = fileStorageService.uploadFile(file, "kanjimaster/avatars");

        // Cập nhật database
        profile.setAvatarUrl(newAvatarUrl);
        userProfileRepository.save(profile);

        log.info("User {} đã upload avatar mới: {}", userId, newAvatarUrl);

        return userProfileMapper.toUserProfileDto(profile);
    }

    /**
     * Xóa avatar (reset về default)
     */
    @Transactional
    public UserProfileDto deleteAvatar() {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // Xóa avatar cũ trên Cloudinary
        String oldAvatarUrl = profile.getAvatarUrl();
        if (oldAvatarUrl != null && !oldAvatarUrl.contains("ui-avatars.com")) {
            try {
                fileStorageService.deleteFile(oldAvatarUrl);
            } catch (Exception e) {
                log.warn("Failed to delete old avatar: {}", e.getMessage());
            }
        }

        // Reset về default avatar
        String defaultAvatarUrl = "https://ui-avatars.com/api/?name="
                + profile.getFullName().replace(" ", "+")
                + "&background=random&size=500";

        profile.setAvatarUrl(defaultAvatarUrl);
        userProfileRepository.save(profile);

        log.info("User {} đã xóa avatar", userId);

        return userProfileMapper.toUserProfileDto(profile);
    }

    /**
     * Đổi mật khẩu
     */
    @Transactional
    public void changePassword(UpdatePasswordRequest request) {
        // Validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        }

        // Check new password is different from old
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new AppException(ErrorCode.SAME_PASSWORD);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("User {} đã đổi mật khẩu thành công", userId);
    }

    public UserStatsDto getUserStats() {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // 1. Thống kê Kanji theo level
        Map<String, Integer> kanjiLearnedByLevel = new HashMap<>();
        Map<String, Integer> totalKanjiByLevel = new HashMap<>();
        Map<String, Double> progressPercentByLevel = new HashMap<>();

        Map<String, String> levelMapping = Map.of(
                "N5", "5",
                "N4", "4",
                "N3", "3",
                "N2", "2",
                "N1", "1"
        );

        String[] displayLevels = {"N5", "N4", "N3", "N2", "N1"};

        for (String displayLevel : displayLevels) {
            String dbLevel = levelMapping.get(displayLevel); // "5", "4", "3", "2", "1"

            Integer learned = kanjiProgressRepository.countByUserIdAndKanjiLevel(userId, dbLevel);
            long total = kanjiRepository.countByLevel(dbLevel);

            kanjiLearnedByLevel.put(displayLevel, learned);
            totalKanjiByLevel.put(displayLevel, (int) total);

            if (total > 0) {
                double percent = (learned * 100.0) / total;
                progressPercentByLevel.put(displayLevel, Math.round(percent * 100.0) / 100.0);
            } else {
                progressPercentByLevel.put(displayLevel, 0.0);
            }
        }

        // 2. Ngày học gần nhất
        LocalDateTime lastStudyDate = kanjiProgressRepository
                .findLastStudyDateByUserId(userId)
                .orElse(null);

        // 3. Thống kê Quiz
        Integer totalQuizzes = quizHistoryRepository.countByUserId(userId);
        Double avgScore = quizHistoryRepository.findAverageScoreByUserId(userId).orElse(0.0);
        Integer highestScore = quizHistoryRepository.findHighestScoreByUserId(userId).orElse(0);
        Integer lowestScore = quizHistoryRepository.findLowestScoreByUserId(userId).orElse(0);

        // 4. Thống kê Battle
        long totalBattles = 0;
        long battlesWon = 0;
        long battlesLost = 0;
        double winRate = 0.0;

        try {
            totalBattles = battleHistoryRepository.countTotalBattlesByUserId(userId);
            battlesWon = battleHistoryRepository.countWinsByUserId(userId);
            battlesLost = battleHistoryRepository.countLossesByUserId(userId);

            if (totalBattles > 0) {
                winRate = (battlesWon * 100.0) / totalBattles;
                winRate = Math.round(winRate * 100.0) / 100.0;
            }
        } catch (Exception e) {
            log.warn("Battle statistics not available: {}", e.getMessage());
        }

        return UserStatsDto.builder()
                // Basic stats
                .totalKanjiLearned(profile.getTotalKanjiLearned())
                .streakDays(profile.getStreakDays())
                .lastStudyDate(lastStudyDate)
                // Kanji stats
                .kanjiLearnedByLevel(kanjiLearnedByLevel)
                .totalKanjiByLevel(totalKanjiByLevel)
                .progressPercentByLevel(progressPercentByLevel)
                // Quiz stats
                .totalQuizzesTaken(totalQuizzes)
                .averageQuizScore(avgScore)
                .highestQuizScore(highestScore)
                .lowestQuizScore(lowestScore)
                // Battle stats
                .totalBattlesPlayed((int) totalBattles)
                .battlesWon((int) battlesWon)
                .battlesLost((int) battlesLost)
                .winRate(winRate)
                .build();
    }

    // ========== HELPER METHODS ==========

    private String getCurrentUserId() {
        return SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    private void validateImageFile(MultipartFile file) {
        // Check empty
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        // Check size (max 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        // Validate filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }
    }
}