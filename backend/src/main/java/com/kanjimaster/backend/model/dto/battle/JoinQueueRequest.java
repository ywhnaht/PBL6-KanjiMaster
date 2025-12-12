package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JoinQueueRequest {
    String level;              // N5, N4, N3, N2, N1
    int numberOfQuestions;     // Số câu hỏi (mặc định 10)
}
