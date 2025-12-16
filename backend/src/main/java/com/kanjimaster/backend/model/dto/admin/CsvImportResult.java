package com.kanjimaster.backend.model.dto.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CsvImportResult {
    int totalRows;
    int successCount;
    int skipCount;
    int errorCount;
    List<String> errors;
    List<String> skipped;
    String message;
}
