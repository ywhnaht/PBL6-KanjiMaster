package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.enums.NotebookEntryType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotebookEntryResponse {
    Integer entryId;
    NotebookEntryType entityType;
    Integer entityId;
    String entityReading;
    String text;
    String meaning;
    Integer reviewCount;
    LocalDateTime createdAt;
}
