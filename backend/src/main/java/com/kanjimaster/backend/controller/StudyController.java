package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.StudySessionDto;
import com.kanjimaster.backend.service.StudyService;
import com.kanjimaster.backend.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suggest")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudyController {
    StudyService studyService;

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<StudySessionDto>>> getTodaySession(
            @RequestParam(required = false, defaultValue = "5") String level
    ) {
        String userId = SecurityUtils.getCurrentUserId().orElse(null);

        List<StudySessionDto> session = studyService.getTodayStudySession(userId, level);

        return ResponseEntity.ok(ApiResponse.success(session, "Lấy gợi ý học tập thành công"));
    }
}
