package com.kanjimaster.backend.model.dto.notification;

import com.kanjimaster.backend.model.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationRequest {

    @NotBlank(message = "User ID is required")
    String userId;

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Message is required")
    String message;

    @NotNull(message = "Type is required")
    NotificationType type;

    String relatedEntityType;
    String relatedEntityId;
}