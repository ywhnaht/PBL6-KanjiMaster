package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.service.CompoundWordService;
import com.kanjimaster.backend.service.TranslationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
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
    @Operation(summary = "Lấy thông tin Kanji theo ID")
    public ResponseEntity<ApiResponse<KanjiDto>> getKanjiById(@PathVariable Integer id) {
        KanjiDto kanjiDto = kanjiService.getKanjiById(id);
        return ResponseEntity.ok(ApiResponse.success(kanjiDto, "Kanji found!"));
    }

   @GetMapping("/search")
   public ResponseEntity<ApiResponse<KanjiDto>> searchKanji(@RequestParam String key) {
       return ResponseEntity.ok(ApiResponse.success(kanjiService.getKanjiByCharacter(key), "Kanji found"));
   }

    @Operation(summary = "Tìm kanji bằng hán việt")
    @GetMapping("/search/han")
    public ResponseEntity<ApiResponse<PagedResponse<KanjiDto>>> searchByHanViet(
            @RequestParam String hanViet,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        PagedResponse<KanjiDto> kanjis = kanjiService.getKanjiByHanViet(hanViet, page, size);
            return ResponseEntity.ok(ApiResponse.success(kanjis, "Kanji found"));
    }

    @Operation(summary = "Lấy danh sách kanji theo level kèm phân trang với page và size")
    @GetMapping("/level")
    public ResponseEntity<ApiResponse<PagedResponse<KanjiDto>>> getKanjiByLevel(
            @RequestParam String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        PagedResponse<KanjiDto> kanjis = kanjiService.getKanjiByLevel(level, page, size);
        return ResponseEntity.ok(ApiResponse.success(kanjis, "Kanji Found"));
    }

    @Operation(summary = "Lấy danh sách từ ghép theo kanji id kèm phân trang")
    @GetMapping("/{id}/compounds")
    public ResponseEntity<ApiResponse<PagedResponse<CompoundWords>>> getCompoundWordById(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        PagedResponse<CompoundWords> pages = compoundWordService.getByKanjiId(id, page, size);
        if (!pages.getItems().isEmpty()) {
            pages.getItems().forEach(translationService::translateAndCacheIfNull);
        }

        return ResponseEntity.ok(ApiResponse.success(pages, "Compound found!"));
    }
}
