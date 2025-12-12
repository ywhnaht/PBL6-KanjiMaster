package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.enums.NotebookEntryType;
import lombok.Data;

@Data
public class SearchLogRequest {
    String searchTerm;
    NotebookEntryType type;
    Integer entityId;
}