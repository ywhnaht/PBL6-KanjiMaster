//package com.kanjimaster.backend.controller;
//
//import com.kanjimaster.backend.model.dto.ApiResponse;
//import com.kanjimaster.backend.model.dto.SuggestItem;
//import com.kanjimaster.backend.service.SuggestService;
//import io.swagger.v3.oas.annotations.Operation;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.List;
//
//@RestController
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//@RequestMapping("/api/v1/suggest")
//public class SuggestController {
//    SuggestService suggestService;
//
//    @Operation(summary = "Hiển thị gợi ý tìm kiếm gồm kanji và từ ghép")
//    @GetMapping
//    public ResponseEntity<ApiResponse<List<SuggestItem>>> searchSuggest(@RequestParam String keyword) {
//        List<SuggestItem> results = suggestService.searchSuggest(keyword);
//        if (results.isEmpty())
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Suggest not found!"));
//
//        return ResponseEntity.ok(ApiResponse.success(results, "Suggest found!"));
//    }
//}
