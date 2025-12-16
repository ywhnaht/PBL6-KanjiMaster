package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.notification.NotificationDTO;
import com.kanjimaster.backend.model.dto.notification.NotificationRequest;
import com.kanjimaster.backend.model.enums.NotificationType;
import com.kanjimaster.backend.service.JwtService;
import com.kanjimaster.backend.service.NotificationService;
import com.kanjimaster.backend.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    /**
     * Lấy tất cả thông báo của user (có phân trang)
     */
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, pageable));
    }

    /**
     * Lấy thông báo chưa đọc
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications() {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Integer id) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok().build();
    }

    /**
     * Đánh dấu tất cả là đã đọc
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa thông báo
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Integer id) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        notificationService.deleteNotification(userId, id);
        return ResponseEntity.ok().build();
    }
}