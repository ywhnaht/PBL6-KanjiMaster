package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.BulkDeleteRequest;
import com.kanjimaster.backend.service.NotebookService;
import com.kanjimaster.backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notebook-entries")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotebookEntryController {
    NotebookService notebookService;

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa 1 các entry (kanji, compound) khỏi 1 notebook")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(@PathVariable Integer id) {
        String userId = SecurityUtils.getCurrentUserId()
                .orElse(null);

        notebookService.deleteEntry(id, userId);

        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa từ vựng khỏi sổ tay"));
    }

    @DeleteMapping("/bulk")
    @Operation(summary = "Xóa hàng loạt các entry (kanji, compound) khỏi 1 notebook")
    public ResponseEntity<ApiResponse<Void>> deleteBulk(@RequestBody BulkDeleteRequest request) {
        String userId = SecurityUtils.getCurrentUserId()
                .orElse(null);

        notebookService.deleteBulkEntries(request.getEntryIds(), userId);

        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa các từ vựng đã chọn"));
    }
}
