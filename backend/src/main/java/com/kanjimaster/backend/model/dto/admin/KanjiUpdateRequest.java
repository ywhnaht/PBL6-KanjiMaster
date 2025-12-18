package com.kanjimaster.backend.model.dto.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiUpdateRequest {
    String kanji;
    String hanViet;
    String joyoReading;
    String kunyomi;
    String onyomi;
    String level;
    String radical;
    String strokes;
    String svgLink;
}
