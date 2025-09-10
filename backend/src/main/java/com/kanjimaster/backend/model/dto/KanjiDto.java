package com.kanjimaster.backend.model.dto;

import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiDto {
    String id;
    String kanji;
    String hanViet;
    String joyoReading;
    String kunyomi;
    String onyomi;
    String radical;
}
