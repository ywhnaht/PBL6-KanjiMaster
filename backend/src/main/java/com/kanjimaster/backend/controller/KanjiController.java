package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.service.CompoundWordService;
import com.kanjimaster.backend.service.TranslationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kanjimaster.backend.service.KanjiService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/kanji")
public class KanjiController {
    KanjiService kanjiService;
    CompoundWordService compoundWordService;
    TranslationService translationService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KanjiDto>> getKanjiById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(kanjiService.getKanjiById(id), "Kanji found!"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<KanjiDto>> searchKanji(@RequestParam String key, @RequestParam String field) {
        return ResponseEntity.ok(ApiResponse.success(kanjiService.getKanjiByCharacter(key), "Kanji found"));
    }

    @GetMapping("/search/han")
    public ResponseEntity<ApiResponse<PagedResponse<KanjiDto>>> searchByHanViet(
            @RequestParam String hanViet,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(ApiResponse.success(kanjiService.getKanjiByHanViet(hanViet, page, size), "Kanji found"));
    }

    @GetMapping("/level")
    public ResponseEntity<ApiResponse<PagedResponse<KanjiDto>>> getKanjiByLevel(
            @RequestParam String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(ApiResponse.success(kanjiService.getKanjiByLevel(level, page, size), "Kanji Found"));
    }

    @GetMapping("/{id}/compounds")
    public ResponseEntity<ApiResponse<PagedResponse<CompoundWords>>> getCompoundWordById(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        PagedResponse<CompoundWords> pages = compoundWordService.getByKanjiId(id, page, size);
        pages.getItems().forEach(compoundWordService::translateAndSaveIfNull);

        return ResponseEntity.ok(ApiResponse.success(pages, "Compound found!"));
    }
}
