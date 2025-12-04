package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.entity.NotebookEntryType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchHistoryDto {
    Long id;
    String searchTerm;

    NotebookEntryType resultType;
    Integer entityId;

    String meaning;
    LocalDateTime searchTimestamp;
}