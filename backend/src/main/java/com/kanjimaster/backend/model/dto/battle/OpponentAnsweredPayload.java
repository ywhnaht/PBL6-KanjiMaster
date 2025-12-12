package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OpponentAnsweredPayload {
    int questionIndex;
    int opponentScore;
}
