package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.enums.NotificationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for StreakService
 * Tests streak milestone notifications
 */
@ExtendWith(MockitoExtension.class)
class StreakServiceTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private StreakService streakService;

    @Test
    void checkAndNotifyStreakMilestone_3Days_SendsNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 3);

        // Then
        verify(notificationService, times(1)).createQuickNotification(
                eq("user123"),
                contains("3 ngày"),
                contains("3 ngày"),
                eq(NotificationType.STREAK_MILESTONE)
        );
    }

    @Test
    void checkAndNotifyStreakMilestone_7Days_SendsNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 7);

        // Then
        verify(notificationService, times(1)).createQuickNotification(
                eq("user123"),
                contains("7 ngày"),
                contains("7 ngày"),
                eq(NotificationType.STREAK_MILESTONE)
        );
    }

    @Test
    void checkAndNotifyStreakMilestone_30Days_SendsNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 30);

        // Then
        verify(notificationService, times(1)).createQuickNotification(
                eq("user123"),
                contains("30 ngày"),
                contains("30 ngày"),
                eq(NotificationType.STREAK_MILESTONE)
        );
    }

    @Test
    void checkAndNotifyStreakMilestone_100Days_SendsNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 100);

        // Then
        verify(notificationService, times(1)).createQuickNotification(
                eq("user123"),
                contains("100 ngày"),
                contains("100 ngày"),
                eq(NotificationType.STREAK_MILESTONE)
        );
    }

    @Test
    void checkAndNotifyStreakMilestone_365Days_SendsNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 365);

        // Then
        verify(notificationService, times(1)).createQuickNotification(
                eq("user123"),
                contains("365 ngày"),
                contains("365 ngày"),
                eq(NotificationType.STREAK_MILESTONE)
        );
    }

    @Test
    void checkAndNotifyStreakMilestone_NonMilestoneDay_DoesNotSendNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 5);

        // Then
        verify(notificationService, never()).createQuickNotification(
                anyString(), anyString(), anyString(), any(NotificationType.class));
    }

    @Test
    void checkAndNotifyStreakMilestone_1Day_DoesNotSendNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 1);

        // Then
        verify(notificationService, never()).createQuickNotification(
                anyString(), anyString(), anyString(), any(NotificationType.class));
    }

    @Test
    void checkAndNotifyStreakMilestone_50Days_DoesNotSendNotification() {
        // When
        streakService.checkAndNotifyStreakMilestone("user123", 50);

        // Then
        verify(notificationService, never()).createQuickNotification(
                anyString(), anyString(), anyString(), any(NotificationType.class));
    }
}
