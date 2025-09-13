package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.service.CompoundWordService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/compound")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CompoundWordController {
    CompoundWordService compoundWordService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompoundWords>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(compoundWordService.getById(id), "Compound found!"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<CompoundWords>> getCompoundWordByWord(@RequestParam String word) {
        return ResponseEntity.ok(ApiResponse.success(compoundWordService.getCompoundWordByWord(word), "Compound word found!"));
    }

    @GetMapping("/translate")
    public ResponseEntity<ApiResponse<PagedResponse<CompoundWords>>> getCompoundWordByMeaning(
            @RequestParam String meaning,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        PagedResponse<CompoundWords> pages = compoundWordService.getCompoundWordByMeaning(meaning, page, size);
        pages.getItems().forEach(compoundWordService::translateAndSaveIfNull);
        return ResponseEntity.ok(ApiResponse.success(pages, "Compound found"));
    }
}
