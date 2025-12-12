package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.enums.NotebookEntryType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotebookEntryRequest {
    NotebookEntryType entityType;
    Integer entityId;
}
