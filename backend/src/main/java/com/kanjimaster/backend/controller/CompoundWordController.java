package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.service.CompoundWordService;
import com.kanjimaster.backend.service.KanjiService;
import com.kanjimaster.backend.service.TranslationService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/compound")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CompoundWordController {
    CompoundWordService compoundWordService;
    KanjiService kanjiService;
    TranslationService translationService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompoundWords>> getById(@PathVariable Integer id) {
        CompoundWords compoundWord = compoundWordService.getById(id);
        if (compoundWord != null)
            return ResponseEntity.ok(ApiResponse.success(compoundWord, "Compound found!"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Compound not found!"));
    }

//    @GetMapping("/search")
//    public ResponseEntity<ApiResponse<CompoundWords>> getCompoundWordByWord(@RequestParam String word) {
//        return ResponseEntity.ok(ApiResponse.success(compoundWordService.getCompoundWordByWord(word), "Compound word found!"));
//    }

    @GetMapping("/translate")
    public ResponseEntity<ApiResponse<PagedResponse<CompoundWords>>> getCompoundWordByMeaning(
            @RequestParam String meaning,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        PagedResponse<CompoundWords> pages = compoundWordService.getCompoundWordByMeaning(meaning, page, size);
        if (!pages.getItems().isEmpty()) {
            pages.getItems().forEach(compoundWordService::translateIfNull);
            return ResponseEntity.ok(ApiResponse.success(pages, "Compound found"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Compound not found!"));
    }

    @Operation(summary = "Lấy 2 từ kanji bằng id từ ghép")
    @GetMapping("/{id}/kanji")
    public ResponseEntity<ApiResponse<List<KanjiDto>>> getKanjiByCompoundId(@PathVariable Integer id) {
        List<KanjiDto> kanjis = kanjiService.getKanjiByCompoundId(id);
        if (!kanjis.isEmpty())
            return ResponseEntity.ok(ApiResponse.success(kanjis, "Kanji found!"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Kanji not found!"));
    }
}
