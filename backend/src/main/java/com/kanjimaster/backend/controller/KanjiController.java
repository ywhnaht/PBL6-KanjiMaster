package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.KanjiBasicDto;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.service.CompoundWordService;
import com.kanjimaster.backend.service.TranslationService;

import com.kanjimaster.backend.util.SecurityUtils;
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
import java.util.Optional;

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

    @PostMapping("/{kanjiId}")
    @Operation(summary = "Lấy thông tin Kanji theo ID và cập nhật status thành LEARNING")
    public ResponseEntity<ApiResponse<KanjiDto>> getKanjiDetailWithStatus(
            @PathVariable Integer kanjiId) {
        String currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        KanjiDto kanjiDto = kanjiService.getKanjiDetailandView(kanjiId, currentUserId);
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

    @Operation(summary = "Lấy danh sách kanji theo level của user kèm phân trang với page và size")
    @GetMapping("/level")
    public ResponseEntity<ApiResponse<PagedResponse<KanjiBasicDto>>> getKanjiByLevel(
            @RequestParam String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        String currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        PagedResponse<KanjiBasicDto> kanjis = kanjiService.getKanjiByLevelWithStatus(level, currentUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success(kanjis, "Kanji Found"));
    }

//    @Operation(summary = "Lấy danh sách kanji theo level của user kèm phân trang với page và size")
//    @GetMapping("/level")
//    public ResponseEntity<ApiResponse<PagedResponse<KanjiBasicDto>>> getKanjiByLevelWithStatus(
//            @RequestParam String level,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "5") int size) {
//
//        PagedResponse<KanjiBasicDto> kanjis = kanjiService.getKanjiByLevel(level, page, size);
//        return ResponseEntity.ok(ApiResponse.success(kanjis, "Kanji Found"));
//    }

    @Operation(summary = "Lấy danh sách từ ghép theo kanji id kèm phân trang")
    @GetMapping("/{id}/compounds")
    public ResponseEntity<ApiResponse<PagedResponse<CompoundWords>>> getCompoundWordById(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        PagedResponse<CompoundWords> pages = compoundWordService.getByKanjiId(id, page, size);
        return ResponseEntity.ok(ApiResponse.success(pages, "Compound found!"));
    }
}
