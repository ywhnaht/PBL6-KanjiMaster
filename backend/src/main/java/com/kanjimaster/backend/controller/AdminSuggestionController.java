package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.suggestion.ReviewSuggestionRequest;
import com.kanjimaster.backend.model.dto.suggestion.WordSuggestionDto;
import com.kanjimaster.backend.model.entity.WordSuggestion;
import com.kanjimaster.backend.service.WordSuggestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/suggestions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Admin - Suggestions", description = "Admin word suggestion management APIs")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminSuggestionController {
    
    WordSuggestionService suggestionService;
    
    @GetMapping
    @Operation(summary = "Get all suggestions", description = "Get paginated list of all suggestions with optional filters")
    public ResponseEntity<ApiResponse<PagedResponse<WordSuggestionDto>>> getAllSuggestions(
            @RequestParam(required = false) WordSuggestion.SuggestionStatus status,
            @RequestParam(required = false) WordSuggestion.SuggestionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<WordSuggestionDto> suggestions = suggestionService.getAllSuggestions(status, type, pageable);
        return ResponseEntity.ok(ApiResponse.success(suggestions, "OK"));
    }
    
    @PutMapping("/{id}/review")
    @Operation(summary = "Review suggestion", description = "Approve or reject a user suggestion")
    public ResponseEntity<ApiResponse<WordSuggestionDto>> reviewSuggestion(
            @PathVariable Integer id,
            @Valid @RequestBody ReviewSuggestionRequest request
    ) {
        WordSuggestionDto suggestion = suggestionService.reviewSuggestion(id, request);
        return ResponseEntity.ok(ApiResponse.success(suggestion, "Đã xem xét yêu cầu"));
    }
    
    @GetMapping("/count-pending")
    @Operation(summary = "Count pending suggestions", description = "Get count of pending suggestions for dashboard")
    public ResponseEntity<ApiResponse<Long>> countPending() {
        long count = suggestionService.countPending();
        return ResponseEntity.ok(ApiResponse.success(count, "OK"));
    }
}
