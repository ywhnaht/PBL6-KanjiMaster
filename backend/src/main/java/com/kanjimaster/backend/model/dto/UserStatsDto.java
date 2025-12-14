package com.kanjimaster.backend.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserStatsDto {
    // Thống kê cơ bản
    Integer totalKanjiLearned;
    Integer streakDays;
    LocalDateTime lastStudyDate;

    // Thống kê theo level
    Map<String, Integer> kanjiLearnedByLevel; // N5: 10, N4: 5, ...
    Map<String, Integer> totalKanjiByLevel;   // N5: 80, N4: 166, ...
    Map<String, Double> progressPercentByLevel; // N5: 12.5%, N4: 3.0%, ...

    // Thống kê quiz
    Integer totalQuizzesTaken;
    Double averageQuizScore;
    Integer highestQuizScore;
    Integer lowestQuizScore;

    // Thống kê battle (nếu có)
    Integer totalBattlesPlayed;
    Integer battlesWon;
    Integer battlesLost;
    Double winRate;
}