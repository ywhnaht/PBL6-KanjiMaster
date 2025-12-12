package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.service.NotebookService;
import com.kanjimaster.backend.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/notebooks")
public class NotebookController {
    NotebookService notebookService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotebookDto>>> getNotebooks() {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        List<NotebookDto> notebooks = notebookService.findAllByUserId(userId);

        return ResponseEntity.ok(ApiResponse.success(notebooks, "OK"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotebookDetailDto>> getNotebook(@PathVariable Integer id) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        NotebookDetailDto notebookDetailDto = notebookService.getNotebookDetail(id, userId);

        return ResponseEntity.ok(ApiResponse.success(notebookDetailDto, "OK"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotebookDto>> createNotebook(@RequestBody NotebookCreateRequest notebookCreateRequest) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        NotebookDto notebook = notebookService.createNotebook(notebookCreateRequest, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(notebook, "OK"));
    }

    @PostMapping("/{id}/entries")
    public ResponseEntity<ApiResponse<Void>> addEntryToNotebook(@RequestBody NotebookEntryRequest notebookEntryRequest, @PathVariable Integer id) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        notebookService.addEntryToNotebook(notebookEntryRequest, userId, id);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "OK"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotebook(@PathVariable Integer id) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        notebookService.deleteNotebook(userId, id);

        return ResponseEntity.ok(ApiResponse.success(null, "Xóa notebook thành công"));
    }
}
