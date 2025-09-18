package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.entity.CompoundWords;
import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiDto {
    Integer id;
    String kanji;
    String hanViet;
    String level;
    String joyoReading;
    String kunyomi;
    String onyomi;
    String radical;
    String strokes;
    String svgLink;
    List<CompoundWords> compoundWords;
}
