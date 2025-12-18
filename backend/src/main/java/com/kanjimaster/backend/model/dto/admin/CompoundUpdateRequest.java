package com.kanjimaster.backend.model.dto.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompoundUpdateRequest {
    String word;
    String meaning;
    String reading;
    Integer frequency;
    String hiragana;
    String example;
    String exampleMeaning;
}
