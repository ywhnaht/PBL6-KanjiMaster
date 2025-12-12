package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AnswerResultPayload {
    int questionIndex;
    boolean correct;
    int correctAnswerIndex;
    int scoreGained;
    int totalScore;
    String explanation;
    @Builder.Default
    boolean timeout = false; // True if player didn't answer in time
}
