package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.enums.LearnStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiBasicDto {
    Integer id;
    String kanji;
    String hanViet;
    String level;
    String joyoReading;

    @Enumerated(EnumType.STRING)
    LearnStatus status;
}
