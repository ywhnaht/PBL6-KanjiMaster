package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/profile")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    /**
     * Lấy profile hiện tại
     */
    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUserProfile() {
        UserProfileDto profile = userProfileService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(profile, "Lấy thông tin profile thành công"));
    }

    /**
     * Cập nhật profile (fullName, bio)
     */
    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDto updated = userProfileService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật profile thành công"));
    }

    /**
     * Upload avatar
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileDto>> updateAvatar(
            @RequestParam("file") MultipartFile file) {
        UserProfileDto updated = userProfileService.updateAvatar(file);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật avatar thành công"));
    }

    /**
     * Xóa avatar
     */
    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<UserProfileDto>> deleteAvatar() {
        UserProfileDto updated = userProfileService.deleteAvatar();
        return ResponseEntity.ok(ApiResponse.success(updated, "Đã xóa avatar"));
    }

    /**
     * Đổi mật khẩu
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody UpdatePasswordRequest request) {
        userProfileService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsDto>> getUserStats() {
        UserStatsDto stats = userProfileService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Lấy thống kê thành công"));
    }
}