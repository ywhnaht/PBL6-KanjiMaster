package com.kanjimaster.backend.model.dto.notification;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationWebSocketMessage {
    String type; // "NEW_NOTIFICATION", "MARK_READ", "MARK_ALL_READ"
    Object payload;
}