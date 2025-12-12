package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LeaderboardEntry {
    int rank;
    String userId;
    String userName;
    String email;
    long totalWins;
    long totalBattles;
    double winRate;
    int totalScore;
}
