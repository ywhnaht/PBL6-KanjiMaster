package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.enums.NotificationType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StreakService {

    NotificationService notificationService;

    /**
     * Kiểm tra và gửi thông báo milestone
     */
    public void checkAndNotifyStreakMilestone(String userId, int streakDays) {
        // Milestone: 7, 30, 100, 365 ngày
        if (streakDays == 3 || streakDays == 7 || streakDays == 30 || streakDays == 100 || streakDays == 365) {
            String title = String.format("🔥 Chuỗi %d ngày!", streakDays);
            String message = String.format(
                    "Tuyệt vời! Bạn đã duy trì streak %d ngày liên tục. Tiếp tục phát huy nhé!",
                    streakDays
            );

            notificationService.createQuickNotification(
                    userId, title, message, NotificationType.STREAK_MILESTONE
            );
        }
    }
}
