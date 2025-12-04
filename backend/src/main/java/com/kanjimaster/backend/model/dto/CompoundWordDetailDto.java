package com.kanjimaster.backend.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompoundWordDetailDto {
    Integer id;
    String word;
    String hiragana;
    String meaning;
    String example;
    String exampleMeaning;

    List<Integer> saveNotebookIds;
    List<CompoundWordDto> relatedWords;
}
