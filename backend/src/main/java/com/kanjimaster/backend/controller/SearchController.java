package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.model.entity.NotebookEntryType;
import com.kanjimaster.backend.model.entity.SearchMode;
import com.kanjimaster.backend.service.SearchHistoryService;
import com.kanjimaster.backend.service.SearchService;
import com.kanjimaster.backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/search")
public class SearchController {
    SearchService searchService;
    SearchHistoryService searchHistoryService;

    @Operation(summary = "Tìm theo query (gồm cả kanji, từ ghép, hán việt, meaning)")
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "full") String mode,
            @RequestParam(defaultValue = "8") int limit) {

        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        SearchMode searchMode = SearchMode.from(mode);
        Object data = searchService.searchSuggest(q, searchMode, limit, userId);

        if (data instanceof SearchSuggestResponse ss && !ss.getResults().isEmpty()) {
            if (searchMode == SearchMode.FULL && userId != null) {
                SuggestItem topResult = ss.getResults().getFirst();

                searchHistoryService.logSearch(
                        userId,
                        q,
                        NotebookEntryType.valueOf(topResult.getType()),
                        topResult.getId(),
                        topResult.getMeaning()
                );
            }
        }

        boolean empty = (data instanceof SearchSuggestResponse ss && ss.getResults().isEmpty());

        if (empty) {
            return ResponseEntity.ok(ApiResponse.error("No results"));
        }
        return ResponseEntity.ok(ApiResponse.success(data, "OK"));
    }
    @GetMapping("/history")
    @Operation(summary = "Lấy lịch sử tìm kiếm của người dùng")
    public ResponseEntity<ApiResponse<PagedResponse<SearchHistoryDto>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        String userId = SecurityUtils.getCurrentUserId()
                .orElse(null);

        PagedResponse<SearchHistoryDto> response = searchHistoryService.getUserHistory(userId, page, limit);

        return ResponseEntity.ok(ApiResponse.success(response, "Lấy lịch sử tìm kiếm thành công"));
    }

//    @Operation(summary = "Ghi log khi user click vào một từ gợi ý")
//    @PostMapping("/log")
//    public ResponseEntity<ApiResponse<Void>> logSearchSelection(@RequestBody SearchLogRequest request) {
//        String userId = SecurityUtils.getCurrentUserId().orElse(null);
//
//        if (userId != null) {
//            searchHistoryService.logSearch(
//                    userId,
//                    request.getSearchTerm(),
//                    request.getType(),
//                    request.getEntityId(),
//            );
//        }
//
//        return ResponseEntity.ok(ApiResponse.success(null, "Logged"));
//    }
}
