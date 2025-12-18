package com.kanjimaster.backend.model.dto.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminDashboardDto {
    Long totalUsers;
    Long totalKanji;
    Long totalCompoundWords;
    Long totalQuizzes;
    Long totalBattles;
    Long activeUsersToday;
    Long newUsersThisWeek;
    Long newUsersThisMonth;
    Long bannedUsers;
    Long verifiedUsers;
    Long unverifiedUsers;
    Long adminUsers;
    Long regularUsers;
}
