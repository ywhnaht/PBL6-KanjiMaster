package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.suggestion.CreateSuggestionRequest;
import com.kanjimaster.backend.model.dto.suggestion.WordSuggestionDto;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/suggestions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Word Suggestions", description = "User word suggestion APIs")
@SecurityRequirement(name = "bearerAuth")
public class WordSuggestionController {
    
    WordSuggestionService suggestionService;
    
    @PostMapping
    @Operation(summary = "Create new suggestion", description = "User submits a new word/correction suggestion")
    public ResponseEntity<ApiResponse<WordSuggestionDto>> createSuggestion(
            @Valid @RequestBody CreateSuggestionRequest request
    ) {
        WordSuggestionDto suggestion = suggestionService.createSuggestion(request);
        return ResponseEntity.ok(ApiResponse.success(suggestion, "Yêu cầu đã được gửi thành công"));
    }
    
    @GetMapping("/my-suggestions")
    @Operation(summary = "Get my suggestions", description = "Get all suggestions submitted by current user")
    public ResponseEntity<ApiResponse<PagedResponse<WordSuggestionDto>>> getMySuggestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<WordSuggestionDto> suggestions = suggestionService.getMySuggestions(pageable);
        return ResponseEntity.ok(ApiResponse.success(suggestions, "OK"));
    }
}
