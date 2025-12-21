package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.notification.NotificationRequest;
import com.kanjimaster.backend.model.entity.Notification;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.enums.NotificationType;
import com.kanjimaster.backend.repository.NotificationRepository;
import com.kanjimaster.backend.repository.UserRepository;
import com.kanjimaster.backend.websocket.NotificationWebSocketHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for NotificationService
 * Tests notification creation and management
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationWebSocketHandler webSocketHandler;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user123")
                .email("test@example.com")
                .password("password")
                .build();

        testNotification = Notification.builder()
                .id(1)
                .user(testUser)
                .title("Test Notification")
                .message("Test message")
                .type(NotificationType.INFO)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createNotification_Success() {
        // Given
        NotificationRequest request = new NotificationRequest();
        request.setUserId("user123");
        request.setTitle("New Notification");
        request.setMessage("Test message");
        request.setType(NotificationType.INFO);

        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When & Then
        assertDoesNotThrow(() -> notificationService.createNotification(request));
        
        verify(userRepository).findById("user123");
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createNotification_UserNotFound_ThrowsException() {
        // Given
        NotificationRequest request = new NotificationRequest();
        request.setUserId("nonexistent");
        request.setTitle("Test");
        request.setMessage("Test");
        request.setType(NotificationType.INFO);

        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> notificationService.createNotification(request));
        
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createQuickNotification_Success() {
        // Given
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When & Then
        assertDoesNotThrow(() -> notificationService.createQuickNotification(
                "user123", "Title", "Message", NotificationType.ACHIEVEMENT));
        
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAsRead_Success() {
        // Given
        when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When & Then
        assertDoesNotThrow(() -> notificationService.markAsRead("user123", 1));
        
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAllAsRead_Success() {
        // Given
        doNothing().when(notificationRepository).markAllAsReadByUserId(anyString());

        // When & Then
        assertDoesNotThrow(() -> notificationService.markAllAsRead("user123"));
        
        verify(notificationRepository).markAllAsReadByUserId("user123");
    }

    @Test
    void deleteNotification_Success() {
        // Given
        when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));
        doNothing().when(notificationRepository).delete(any(Notification.class));

        // When & Then
        assertDoesNotThrow(() -> notificationService.deleteNotification("user123", 1));
        
        verify(notificationRepository).delete(testNotification);
    }

    @Test
    void deleteNotification_NotFound_ThrowsException() {
        // Given
        when(notificationRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> notificationService.deleteNotification("user123", 999));
        
        assertEquals(ErrorCode.NOTIFICATION_NOT_FOUND, exception.getErrorCode());
    }
}
