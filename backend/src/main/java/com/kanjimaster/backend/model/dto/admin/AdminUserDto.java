package com.kanjimaster.backend.model.dto.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserDto {
    String id;
    String email;
    boolean isVerified;
    boolean isBanned;
    LocalDateTime bannedAt;
    String banReason;
    LocalDateTime createdAt;
    List<String> roles;
    
    // UserProfile info
    String username;
    String avatarUrl;
    Integer totalPoints;
    Integer battleWins;
    Integer battleLosses;
}
