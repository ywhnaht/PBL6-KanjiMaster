package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.entity.CompoundWords;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompoundWordDto {
    Integer id;
    String word;
    String hiragana;
    String meaning;
//    String example;
//    String exampleMeaning;
    List<CompoundWordDto> relatedWords;
}