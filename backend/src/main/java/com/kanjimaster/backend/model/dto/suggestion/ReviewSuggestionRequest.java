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
public class ReviewSuggestionRequest {
    
    @NotNull(message = "Trạng thái không được để trống")
    WordSuggestion.SuggestionStatus status;
    
    String adminNote;
}
