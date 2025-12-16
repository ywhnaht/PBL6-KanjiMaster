package com.kanjimaster.backend.model.dto.notification;

import com.kanjimaster.backend.model.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationDTO {
    Integer id;
    String title;
    String message;
    NotificationType type;
    String relatedEntityType;
    String relatedEntityId;
    Boolean isRead;
    LocalDateTime createdAt;
    LocalDateTime readAt;
}