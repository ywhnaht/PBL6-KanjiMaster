package com.kanjimaster.backend.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.KanjiExamples;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
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
    List<CompoundWordDto> compoundWords;
    List<KanjiExampleDto> kanjiExamples;
}
