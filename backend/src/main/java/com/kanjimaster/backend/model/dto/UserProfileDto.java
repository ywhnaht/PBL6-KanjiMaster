package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.entity.Role;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

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
    String bio;
    Integer totalKanjiLearned;
    Integer streakDays;
    List<Role> roles;
}
