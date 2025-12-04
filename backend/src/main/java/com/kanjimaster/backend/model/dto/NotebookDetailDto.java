package com.kanjimaster.backend.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotebookDetailDto {
    Integer id;
    String name;
    String description;
    Integer totalEntries;
    List<NotebookEntryResponse> entries;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
