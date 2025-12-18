package com.kanjimaster.backend.model.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiCreateRequest {
    @NotBlank(message = "Kanji character không được để trống")
    String kanji;
    
    @NotBlank(message = "Âm Hán Việt không được để trống")
    String hanViet;
    
    @NotBlank(message = "Joyo reading không được để trống")
    String joyoReading;
    
    String kunyomi;
    String onyomi;
    String level;
    String radical;
    String strokes;
    
    @NotBlank(message = "SVG link không được để trống")
    String svgLink;
}
