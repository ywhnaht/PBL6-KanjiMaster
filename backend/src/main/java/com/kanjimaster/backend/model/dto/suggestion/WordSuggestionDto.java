package com.kanjimaster.backend.model.dto.suggestion;

import com.kanjimaster.backend.model.entity.WordSuggestion;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WordSuggestionDto {
    Integer id;
    String userId;
    String username;
    String userEmail;
    WordSuggestion.SuggestionType type;
    WordSuggestion.SuggestionStatus status;
    
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
    
    // Admin response
    String adminId;
    String adminUsername;
    String adminNote;
    LocalDateTime reviewedAt;
    
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
