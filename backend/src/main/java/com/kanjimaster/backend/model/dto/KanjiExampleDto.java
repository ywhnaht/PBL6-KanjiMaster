package com.kanjimaster.backend.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiExampleDto {
    Integer id;
    String sentence;
    String reading;
    String meaning;
}

