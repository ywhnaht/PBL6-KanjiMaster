package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.QuizItem;
import com.kanjimaster.backend.model.dto.QuizResultDto;
import com.kanjimaster.backend.model.entity.QuizHistory;
import com.kanjimaster.backend.service.QuizService;
import com.kanjimaster.backend.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quiz")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizController {
    QuizService quizService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizItem>>> generateQuiz(
            @RequestParam String level,
            @RequestParam(defaultValue = "20") int numberOfQuestion) {
        List<QuizItem> quizItems = quizService.generateQuiz(level, numberOfQuestion);
        return ResponseEntity.ok(ApiResponse.success(quizItems, "OK"));
    }

    @PostMapping("/history")
    public ResponseEntity<ApiResponse<QuizHistory>> submitQuizResult(
            @RequestBody QuizResultDto quizResultDto) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        quizService.saveQuizResult(quizResultDto, userId);

        return ResponseEntity.ok(ApiResponse.success(null, "OK"));
    }

    @GetMapping("/review")
    public ResponseEntity<ApiResponse<List<QuizItem>>> generateReviewQuiz(
            @RequestParam String level,
            @RequestParam(defaultValue = "20") int numberOfQuestion
    ) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);
        List<QuizItem> quizItems = quizService.getReviewQuiz(userId, level, numberOfQuestion);

        return ResponseEntity.ok(ApiResponse.success(quizItems, "OK"));
    }
}
