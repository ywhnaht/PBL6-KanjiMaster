package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MatchFoundPayload {
    String opponentName;
    String opponentEmail;
    String roomId;
    int numberOfQuestions;
    String level;
}