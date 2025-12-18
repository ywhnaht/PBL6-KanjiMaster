package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.ApiResponse;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.admin.AdminDashboardDto;
import com.kanjimaster.backend.model.dto.admin.AdminUserDto;
import com.kanjimaster.backend.model.dto.admin.BanUserRequest;
import com.kanjimaster.backend.model.dto.admin.RoleUpdateRequest;
import com.kanjimaster.backend.service.AdminService;
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

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Admin", description = "Admin management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    
    AdminService adminService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get dashboard statistics", description = "Get overview statistics for admin dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboardStats() {
        AdminDashboardDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "OK"));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get all users", description = "Get paginated list of all users")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PagedResponse<AdminUserDto> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users, "OK"));
    }

    @GetMapping("/users/search")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Search users", description = "Search users by email or name")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserDto>>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<AdminUserDto> users = adminService.searchUsers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(users, "OK"));
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Get user by ID", description = "Get detailed information of a specific user")
    public ResponseEntity<ApiResponse<AdminUserDto>> getUserById(@PathVariable String userId) {
        AdminUserDto user = adminService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user, "OK"));
    }

    @PutMapping("/users/{userId}/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Update user roles", description = "Update roles for a specific user (ADMIN only)")
    public ResponseEntity<ApiResponse<AdminUserDto>> updateUserRoles(
            @PathVariable String userId,
            @Valid @RequestBody RoleUpdateRequest request
    ) {
        AdminUserDto updatedUser = adminService.updateUserRoles(userId, request);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "OK"));
    }

    @PostMapping("/users/{userId}/grant-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Grant admin role", description = "Grant ADMIN role to a user")
    public ResponseEntity<ApiResponse<AdminUserDto>> grantAdminRole(@PathVariable String userId) {
        AdminUserDto updatedUser = adminService.grantAdminRole(userId);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "OK"));
    }

    @PostMapping("/users/{userId}/revoke-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Revoke admin role", description = "Revoke ADMIN role from a user")
    public ResponseEntity<ApiResponse<AdminUserDto>> revokeAdminRole(@PathVariable String userId) {
        AdminUserDto updatedUser = adminService.revokeAdminRole(userId);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "OK"));
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user from the system (ADMIN only)")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @GetMapping("/users/{userId}/is-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Check if user is admin", description = "Check if a user has admin role")
    public ResponseEntity<ApiResponse<Boolean>> isUserAdmin(@PathVariable String userId) {
        boolean isAdmin = adminService.isUserAdmin(userId);
        return ResponseEntity.ok(ApiResponse.success(isAdmin, "OK"));
    }

    @PostMapping("/users/{userId}/ban")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Ban user", description = "Ban a user from the system")
    public ResponseEntity<ApiResponse<AdminUserDto>> banUser(
            @PathVariable String userId,
            @Valid @RequestBody BanUserRequest request
    ) {
        AdminUserDto updatedUser = adminService.banUser(userId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User banned successfully"));
    }

    @PostMapping("/users/{userId}/unban")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Unban user", description = "Unban a previously banned user")
    public ResponseEntity<ApiResponse<AdminUserDto>> unbanUser(@PathVariable String userId) {
        AdminUserDto updatedUser = adminService.unbanUser(userId);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User unbanned successfully"));
    }
}
