package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GameEndPayload {
    String winnerId;
    String winnerName;
    String player1Name;
    String player2Name;
    int player1Score;
    int player2Score;
    String reason;
}
