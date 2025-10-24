package com.kanjimaster.backend.controller;

import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.service.AuthService;
import com.kanjimaster.backend.service.JwtService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;
    AuthenticationManager authenticationManager;
    JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterDto registerDto) {
        authService.register(registerDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt."));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verify(
            @Valid @RequestBody VerifyRequest verifyRequest) {
        AuthResponse response = authService.verify(verifyRequest);

        return ResponseEntity.ok(ApiResponse.success(response, "Xác thực email thành công. Bạn có thể đăng nhập."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginDto loginDto) {
        AuthResponse result = authService.login(loginDto);

        return ResponseEntity.ok(ApiResponse.success(result, "Đăng nhập thành công!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<AuthResponse>> logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.success(null, "Đăng xuất thành công!"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(refreshTokenRequest), "Làm mới token thành công!"));
    }
}
