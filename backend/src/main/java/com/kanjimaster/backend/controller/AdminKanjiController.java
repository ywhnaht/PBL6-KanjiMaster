package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.admin.CsvImportResult;
import com.kanjimaster.backend.model.dto.admin.KanjiCreateRequest;
import com.kanjimaster.backend.model.dto.admin.KanjiUpdateRequest;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.service.AdminKanjiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/kanji")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Admin Kanji", description = "Admin CRUD operations for Kanji")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminKanjiController {
    
    AdminKanjiService adminKanjiService;

    @GetMapping
    @Operation(summary = "Get all kanji", description = "Get paginated list of all kanji")
    public ResponseEntity<ApiResponse<PagedResponse<Kanji>>> getAllKanji(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PagedResponse<Kanji> kanjis = adminKanjiService.getAllKanji(pageable);
        return ResponseEntity.ok(ApiResponse.success(kanjis, "OK"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get kanji by ID", description = "Get detailed information of a specific kanji")
    public ResponseEntity<ApiResponse<Kanji>> getKanjiById(@PathVariable Integer id) {
        Kanji kanji = adminKanjiService.getKanjiById(id);
        return ResponseEntity.ok(ApiResponse.success(kanji, "OK"));
    }

    @PostMapping
    @Operation(summary = "Create kanji", description = "Create a new kanji")
    public ResponseEntity<ApiResponse<Kanji>> createKanji(@Valid @RequestBody KanjiCreateRequest request) {
        Kanji kanji = adminKanjiService.createKanji(request);
        return ResponseEntity.ok(ApiResponse.success(kanji, "Kanji created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update kanji", description = "Update an existing kanji")
    public ResponseEntity<ApiResponse<Kanji>> updateKanji(
            @PathVariable Integer id,
            @Valid @RequestBody KanjiUpdateRequest request
    ) {
        Kanji kanji = adminKanjiService.updateKanji(id, request);
        return ResponseEntity.ok(ApiResponse.success(kanji, "Kanji updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete kanji", description = "Delete a kanji from the system")
    public ResponseEntity<ApiResponse<String>> deleteKanji(@PathVariable Integer id) {
        adminKanjiService.deleteKanji(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Kanji deleted successfully"));
    }

    @PostMapping("/import-csv")
    @Operation(summary = "Import kanji from CSV", description = "Bulk import kanji from CSV file. Format: kanji,hanViet,joyoReading,kunyomi,onyomi,level,radical,strokes,svgLink")
    public ResponseEntity<ApiResponse<CsvImportResult>> importKanjiFromCsv(@RequestParam("file") MultipartFile file) {
        CsvImportResult result = adminKanjiService.importKanjiFromCsv(file);
        return ResponseEntity.ok(ApiResponse.success(result, "OK"));
    }
}
