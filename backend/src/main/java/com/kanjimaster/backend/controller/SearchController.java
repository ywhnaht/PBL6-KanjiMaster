package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/search")
public class SearchController {
    SearchService searchService;

    @Operation(summary = "Tìm theo query (gồm cả kanji, từ ghép, hán việt, meaning)")
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "full") String mode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "8") int limit) {

        SearchMode searchMode = SearchMode.from(mode);
        Object data = searchService.searchSuggest(q, searchMode, limit);

        boolean empty = (data instanceof SearchSuggestResponse ss && ss.getResults().isEmpty());

        if (empty) {
            return ResponseEntity.ok(ApiResponse.error("No results"));
        }
        return ResponseEntity.ok(ApiResponse.success(data, "OK"));
    }
}
