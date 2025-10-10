package com.kanjimaster.backend.model.dto;

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
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiBasicDto {
    Integer id;
    String kanji;
    String hanViet;
    String level;
    String joyoReading;
}
