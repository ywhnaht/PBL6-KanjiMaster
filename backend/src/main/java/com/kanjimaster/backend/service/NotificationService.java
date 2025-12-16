package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.notification.NotificationDTO;
import com.kanjimaster.backend.model.dto.notification.NotificationRequest;
import com.kanjimaster.backend.model.entity.Notification;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.enums.NotificationType;
import com.kanjimaster.backend.repository.NotificationRepository;
import com.kanjimaster.backend.repository.UserRepository;
import com.kanjimaster.backend.websocket.NotificationWebSocketHandler;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    static Logger logger = LoggerFactory.getLogger(NotificationService.class);

    NotificationRepository notificationRepository;
    UserRepository userRepository;
    NotificationWebSocketHandler webSocketHandler;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               @Lazy NotificationWebSocketHandler webSocketHandler) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.webSocketHandler = webSocketHandler;
    }

    /**
     * Tạo thông báo mới và gửi realtime
     */
    @Transactional
    public void createNotification(NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notification notification = Notification.builder()
                .user(user)
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .relatedEntityType(request.getRelatedEntityType())
                .relatedEntityId(request.getRelatedEntityId())
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        logger.info("✅ Created notification {} for user {}", notification.getId(), user.getId());

        // Gửi qua WebSocket ngay lập tức
        try {
            NotificationDTO dto = mapToDTO(notification);
            webSocketHandler.sendNotificationToUser(user.getId(), dto);
            logger.info("📤 Sent notification via WebSocket to user {}", user.getId());
        } catch (Exception e) {
            logger.error("❌ Failed to send notification via WebSocket", e);
        }
    }

    /**
     * Tạo thông báo nhanh (async)
     */
    @Async
    public void createQuickNotification(String userId, String title, String message, NotificationType type) {
        try {
            NotificationRequest request = NotificationRequest.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .build();
            createNotification(request);
        } catch (Exception e) {
            logger.error("❌ Failed to create quick notification for user {}", userId, e);
        }
    }

    /**
     * Tạo thông báo với entity liên quan
     */
    @Async
    public void createNotificationWithEntity(String userId, String title, String message,
                                             NotificationType type, String entityType, String entityId) {
        try {
            NotificationRequest request = NotificationRequest.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .relatedEntityType(entityType)
                    .relatedEntityId(entityId)
                    .build();
            createNotification(request);
        } catch (Exception e) {
            logger.error("❌ Failed to create notification with entity for user {}", userId, e);
        }
    }

    /**
     * Lấy tất cả thông báo của user (có phân trang)
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Lấy thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(String userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        logger.info("📋 Found {} unread notifications for user {}", notifications.size(), userId);
        return notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả thông báo của user (không phân trang, giới hạn 50 gần nhất)
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getAllNotifications(String userId) {
        List<Notification> notifications = notificationRepository
                .findTop50ByUserIdOrderByCreatedAtDesc(userId);
        logger.info("📋 Found {} total notifications for user {}", notifications.size(), userId);
        return notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(String userId) {
        Long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        logger.info("🔢 Unread count for user {}: {}", userId, count);
        return count;
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    @Transactional
    public void markAsRead(String userId, Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
            logger.info("✓ Marked notification {} as read", notificationId);
        }
    }

    /**
     * Đánh dấu tất cả là đã đọc
     */
    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsReadByUserId(userId);
        logger.info("✓ Marked all notifications as read for user {}", userId);
    }

    /**
     * Xóa thông báo
     */
    @Transactional
    public void deleteNotification(String userId, Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        notificationRepository.delete(notification);
        logger.info("🗑️ Deleted notification {}", notificationId);
    }

    /**
     * Xóa thông báo cũ (hơn 30 ngày)
     */
    @Transactional
    public void deleteOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteOldNotifications(cutoffDate);
        logger.info("🗑️ Deleted notifications older than {}", cutoffDate);
    }

    // Helper Methods

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}