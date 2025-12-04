package com.kanjimaster.backend.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudySessionDto {
    Integer entityId;
    String entityType;
    String display;
    String meaning;
    String level;
    String studyType;  // "REVIEW" (Ôn tập), "HISTORY" (Từ lịch sử), "NEW" (Từ mới)

    Integer reviewCount;
}