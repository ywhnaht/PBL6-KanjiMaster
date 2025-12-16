package com.kanjimaster.backend.model.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompoundCreateRequest {
    @NotBlank(message = "Word không được để trống")
    String word;
    
    String meaning;
    String reading;
    Integer frequency;
    String hiragana;
    String example;
    String exampleMeaning;
}
