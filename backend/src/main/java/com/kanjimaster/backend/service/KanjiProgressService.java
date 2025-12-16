package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.exception.KanjiNotFoundException;
import com.kanjimaster.backend.model.dto.KanjiCountByLevelDto;
import com.kanjimaster.backend.model.entity.*;
import com.kanjimaster.backend.model.enums.LearnStatus;
import com.kanjimaster.backend.repository.KanjiProgressRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import com.kanjimaster.backend.repository.UserProfileRepository;
import com.kanjimaster.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KanjiProgressService {
    KanjiProgressRepository kanjiProgressRepository;
    UserRepository userRepository;
    KanjiRepository kanjiRepository;
    UserProfileRepository userProfileRepository;

    public Map<String, Long> getProgressSummary(String userId) {
        Map<String, Long> summary;

        if (userId != null) {
            List<KanjiCountByLevelDto> progress = kanjiProgressRepository.getLearnedKanjiCountGroupByLevel(userId);

            summary = progress.stream()
                    .collect(Collectors.toMap(
                            KanjiCountByLevelDto::getLevel,
                            KanjiCountByLevelDto::getCount
                    ));
        } else {
            summary = new HashMap<>();
        }

        List.of("N5", "N4", "N3", "N2", "N1").forEach(level -> {
            summary.putIfAbsent(level, 0L);
        });

        return summary;
    }

    // KanjiProgressService.java - Fix streak logic
@Transactional
public Map<String, Serializable> masterKanji(String userId, Integer kanjiId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    UserProfile userProfile = user.getUserProfile();
    if (userProfile == null) {
        throw new AppException(ErrorCode.USER_NOT_FOUND);
    }

    KanjiProgressId kanjiProgressId = new KanjiProgressId(userId, kanjiId);
    KanjiProgress kanjiProgress = kanjiProgressRepository.findById(kanjiProgressId).orElseGet(() -> {
        Kanji kanji = kanjiRepository.findById(kanjiId)
                .orElseThrow(() -> new AppException(ErrorCode.KANJI_NOT_FOUND));
        return new KanjiProgress(kanjiProgressId, user, kanji, LearnStatus.LEARNING, null, null);
    });

    boolean isNewlyMastered = kanjiProgress.getStatus() != LearnStatus.MASTERED;

    // Lấy lastReviewAt của chính kanji này (trước khi update)
    LocalDateTime currentKanjiLastReview = kanjiProgress.getLastReviewAt();
    
    // Lấy lastReviewAt của các kanji khác
    LocalDateTime otherKanjiLastReview = kanjiProgressRepository
            .findLastStudyDateByUserIdExcludingKanji(userId, kanjiId)
            .orElse(null);
    
    // Chọn ngày gần nhất
    LocalDateTime previousLastStudyDate;
    if (currentKanjiLastReview == null && otherKanjiLastReview == null) {
        previousLastStudyDate = null;
    } else if (currentKanjiLastReview == null) {
        previousLastStudyDate = otherKanjiLastReview;
    } else if (otherKanjiLastReview == null) {
        previousLastStudyDate = currentKanjiLastReview;
    } else {
        previousLastStudyDate = currentKanjiLastReview.isAfter(otherKanjiLastReview) 
            ? currentKanjiLastReview : otherKanjiLastReview;
    }

    kanjiProgress.setStatus(LearnStatus.MASTERED);
    kanjiProgress.setLastReviewAt(LocalDateTime.now());
    KanjiProgress savedProgress = kanjiProgressRepository.save(kanjiProgress);

    if (isNewlyMastered) {
        Integer currentTotal = userProfile.getTotalKanjiLearned();
        if (currentTotal == null) currentTotal = 0;
        userProfile.setTotalKanjiLearned(currentTotal + 1);
    }

    updateStreakDays(userProfile, previousLastStudyDate);
    userProfileRepository.save(userProfile);

    String levelOfMasteredKanji = savedProgress.getKanji().getLevel();
    Long newCountForLevel = kanjiProgressRepository.countLearnedByLevel(levelOfMasteredKanji, userId);

    return Map.of(
            "updatedLevel", "N" + levelOfMasteredKanji,
            "newCount", newCountForLevel,
            "totalKanjiLearned", userProfile.getTotalKanjiLearned(),
            "streakDays", userProfile.getStreakDays()
    );
}

    private void updateStreakDays(UserProfile userProfile, LocalDateTime previousLastStudyDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        if (previousLastStudyDate == null) {
            userProfile.setStreakDays(1);
            return;
        }

        LocalDate lastStudyDate = previousLastStudyDate.toLocalDate();

        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(lastStudyDate, today);

        if (daysBetween == 0) {
            // Học cùng ngày, giữ nguyên streak
        } else if (daysBetween == 1) {
            // Học liên tiếp, tăng streak
            Integer currentStreak = userProfile.getStreakDays();
            if (currentStreak == null) currentStreak = 0;
            userProfile.setStreakDays(currentStreak + 1);
        } else {
            // Gián đoạn, reset streak về 1
            userProfile.setStreakDays(1);
        }
    }
}
