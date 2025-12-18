package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.admin.CompoundCreateRequest;
import com.kanjimaster.backend.model.dto.admin.CompoundUpdateRequest;
import com.kanjimaster.backend.model.dto.admin.CsvImportResult;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.service.AdminCompoundService;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/compounds")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Admin Compound", description = "Admin CRUD operations for Compound Words")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminCompoundController {
    
    AdminCompoundService adminCompoundService;

    @GetMapping
    @Operation(summary = "Get all compounds", description = "Get paginated list of all compound words")
    public ResponseEntity<ApiResponse<PagedResponse<CompoundWords>>> getAllCompounds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PagedResponse<CompoundWords> compounds = adminCompoundService.getAllCompounds(pageable);
        return ResponseEntity.ok(ApiResponse.success(compounds, "OK"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get compound by ID", description = "Get detailed information of a specific compound word")
    public ResponseEntity<ApiResponse<CompoundWords>> getCompoundById(@PathVariable Integer id) {
        CompoundWords compound = adminCompoundService.getCompoundById(id);
        return ResponseEntity.ok(ApiResponse.success(compound, "OK"));
    }

    @PostMapping
    @Operation(summary = "Create compound", description = "Create a new compound word")
    public ResponseEntity<ApiResponse<CompoundWords>> createCompound(@Valid @RequestBody CompoundCreateRequest request) {
        CompoundWords compound = adminCompoundService.createCompound(request);
        return ResponseEntity.ok(ApiResponse.success(compound, "Compound created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update compound", description = "Update an existing compound word")
    public ResponseEntity<ApiResponse<CompoundWords>> updateCompound(
            @PathVariable Integer id,
            @Valid @RequestBody CompoundUpdateRequest request
    ) {
        CompoundWords compound = adminCompoundService.updateCompound(id, request);
        return ResponseEntity.ok(ApiResponse.success(compound, "Compound updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete compound", description = "Delete a compound word from the system")
    public ResponseEntity<ApiResponse<String>> deleteCompound(@PathVariable Integer id) {
        adminCompoundService.deleteCompound(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Compound deleted successfully"));
    }

    @PostMapping("/import-csv")
    @Operation(summary = "Import compounds from CSV", description = "Bulk import compound words from CSV file. Format: word,meaning,reading,frequency,hiragana,example,exampleMeaning")
    public ResponseEntity<ApiResponse<CsvImportResult>> importCompoundsFromCsv(@RequestParam("file") MultipartFile file) {
        CsvImportResult result = adminCompoundService.importCompoundsFromCsv(file);
        return ResponseEntity.ok(ApiResponse.success(result, "OK"));
    }
}
