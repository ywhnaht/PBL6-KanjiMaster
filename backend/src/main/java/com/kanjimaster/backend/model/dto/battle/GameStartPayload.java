package com.kanjimaster.backend.model.dto.battle;

import com.kanjimaster.backend.model.dto.QuizItem;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GameStartPayload {
    List<QuizItem> questions;
    int timePerQuestion;  // seconds (10s)
}
