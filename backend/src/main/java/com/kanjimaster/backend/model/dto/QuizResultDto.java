package com.kanjimaster.backend.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizResultDto {
    String level;
    int totalQuestions;
    int totalCorrects;
    String quizType;

    List<Integer> incorrectKanjiIds;
    List<Integer> incorrectCompoundIds;

    List<Integer> correctReviewKanjiIds;
    List<Integer> correctReviewCompoundIds;
}
