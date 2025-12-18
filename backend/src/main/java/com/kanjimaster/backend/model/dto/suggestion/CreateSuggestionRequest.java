package com.kanjimaster.backend.model.dto.suggestion;

import com.kanjimaster.backend.model.entity.WordSuggestion;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateSuggestionRequest {
    
    @NotNull(message = "Loại yêu cầu không được để trống")
    WordSuggestion.SuggestionType type;
    
    // Kanji fields
    String kanji;
    String hanViet;
    String onyomi;
    String kunyomi;
    String joyoReading;
    
    // Compound fields
    String word;
    String reading;
    String hiragana;
    
    // Common fields
    String meaning;
    String reason;
}
