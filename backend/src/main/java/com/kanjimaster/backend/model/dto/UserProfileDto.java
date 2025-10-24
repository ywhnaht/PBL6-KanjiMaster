package com.kanjimaster.backend.model.dto;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileDto {
    String id;
    String email;
    String fullName;
    String avatarUrl;
    Integer totalKanjiLearned;
    Integer streakDays;
}
