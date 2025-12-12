package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BattleHistoryDto {
    Integer id;
    String opponentName;
    String opponentEmail;
    int myScore;
    int opponentScore;
    boolean isWinner;
    boolean isDraw;
    String level;
    int totalQuestions;
    LocalDateTime completedAt;
}
