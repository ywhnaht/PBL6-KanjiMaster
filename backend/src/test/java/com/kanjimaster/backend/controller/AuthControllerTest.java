package com.kanjimaster.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanjimaster.backend.model.dto.AuthResponse;
import com.kanjimaster.backend.model.dto.LoginDto;
import com.kanjimaster.backend.model.dto.RegisterDto;
import com.kanjimaster.backend.model.dto.UserProfileDto;
import com.kanjimaster.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController
 * Tests authentication endpoints with Spring Security
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private RegisterDto registerDto;
    private LoginDto loginDto;
    private AuthResponse loginResponse;

    @BeforeEach
    void setUp() {
        registerDto = new RegisterDto();
        registerDto.setEmail("newuser@example.com");
        registerDto.setPassword("Password123!");
        registerDto.setFullName("New User");

        loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("Password123!");

        UserProfileDto userProfile = UserProfileDto.builder()
                .id("user123")
                .email("test@example.com")
                .fullName("Test User")
                .avatarUrl("https://ui-avatars.com/api/?name=Test+User")
                .totalKanjiLearned(0)
                .streakDays(1)
                .build();

        loginResponse = AuthResponse.builder()
                .accessToken("accessToken123")
                .refreshToken("refreshToken123")
                .user(userProfile)
                .build();
    }

    @Test
    void register_Success() throws Exception {
        // Given
        doNothing().when(authService).register(any(RegisterDto.class));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDto)))
                .andExpect(status().isCreated()) // 201 Created
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void register_InvalidEmail_BadRequest() throws Exception {
        // Given
        registerDto.setEmail("invalid-email");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_Success() throws Exception {
        // Given
        when(authService.login(any(LoginDto.class))).thenReturn(loginResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("accessToken123"))
                .andExpect(jsonPath("$.data.refreshToken").value("refreshToken123"))
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"));
    }

    @Test
    @WithMockUser
    void logout_Success() throws Exception {
        // Given
        String refreshToken = "refreshToken123";
        doNothing().when(authService).logout(refreshToken);

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer " + refreshToken))
                .andExpect(status().isOk());
    }
}
