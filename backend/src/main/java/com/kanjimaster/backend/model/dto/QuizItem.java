package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.entity.QuestionType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizItem {
    Integer id;
    String questionText;
    QuestionType type;
    String sentence;
    String targetWord;
    List<String> options;
    int correctAnswerIndex;
    String explanation;
}
