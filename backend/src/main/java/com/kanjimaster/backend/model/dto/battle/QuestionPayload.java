package com.kanjimaster.backend.model.dto.battle;

import com.kanjimaster.backend.model.dto.QuizItem;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionPayload {
    int questionIndex;
    QuizItem question;
    long startTime;  // timestamp when question starts
}
