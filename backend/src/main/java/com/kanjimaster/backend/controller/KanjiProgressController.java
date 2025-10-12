package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.service.KanjiProgressService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/progress")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KanjiProgressController {
    KanjiProgressService kanjiProgressService;

    @GetMapping("/summary")
    @Operation(summary = "Lấy số từ kanji đã học của user theo level")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getProgressSummary(@RequestParam String userId) {
        Map<String, Long> result = kanjiProgressService.getProgressSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(result, "Successfully retrieved progress summary."));
    }

    @PostMapping("/master")
    @Operation(summary = "Đánh dấu từ kanji đã học")
    public ResponseEntity<ApiResponse<Map<String, Serializable>>> masterKanji(
            @RequestParam String userId,
            @RequestParam Integer kanjiId
    ) {
        Map<String, Serializable> results = kanjiProgressService.masterKanji(userId, kanjiId);
        return  ResponseEntity.ok(ApiResponse.success(results, "Successfully mastered kanji."));
    }
}
