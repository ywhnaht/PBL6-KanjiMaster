package com.kanjimaster.backend.service;

import com.kanjimaster.backend.config.JwtProperties;
import com.kanjimaster.backend.model.entity.CustomUserDetails;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collections;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for JwtService
 * Tests JWT token generation, validation, and extraction
 */
@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private JwtService jwtService;

    private CustomUserDetails testUserDetails;
    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        testUserDetails = CustomUserDetails.builder()
                .id("user123")
                .email("test@example.com")
                .password("password")
                .authorities(Collections.emptyList())
                .isVerified(true)
                .build();

        lenient().when(jwtProperties.getSecret()).thenReturn(TEST_SECRET);
        lenient().when(jwtProperties.getAccessTokenExpiration()).thenReturn(3600000L); // 1 hour
        lenient().when(jwtProperties.getRefreshTokenExpiration()).thenReturn(86400000L); // 24 hours
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void generateAccessToken_Success() {
        // When
        String token = jwtService.generateAccessToken(testUserDetails);

        // Then
        assertNotNull(token);
        assertTrue(token.length() > 0);
        
        // Verify token contains user email
        String extractedEmail = jwtService.extractEmail(token);
        assertEquals("test@example.com", extractedEmail);
    }

    @Test
    void generateRefreshToken_Success() {
        // When
        String token = jwtService.generateRefreshToken(testUserDetails);

        // Then
        assertNotNull(token);
        assertTrue(token.length() > 0);
        
        String extractedEmail = jwtService.extractEmail(token);
        assertEquals("test@example.com", extractedEmail);
    }

    @Test
    void extractEmail_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);

        // When
        String email = jwtService.extractEmail(token);

        // Then
        assertEquals("test@example.com", email);
    }

    @Test
    void extractId_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);

        // When
        String tokenId = jwtService.extractId(token);

        // Then
        assertNotNull(tokenId);
        assertFalse(tokenId.isEmpty());
    }

    @Test
    void isTokenValid_ValidToken_ReturnsTrue() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);

        // When
        boolean isValid = jwtService.isTokenValid(token, testUserDetails);

        // Then
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_DifferentUser_ReturnsFalse() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);
        
        CustomUserDetails differentUser = CustomUserDetails.builder()
                .id("user456")
                .email("different@example.com")
                .password("password")
                .authorities(Collections.emptyList())
                .isVerified(true)
                .build();

        // When
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Then
        assertFalse(isValid);
    }

    @Test
    void isTokenExpired_FreshToken_ReturnsFalse() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);

        // When
        boolean isExpired = jwtService.isTokenExpired(token);

        // Then
        assertFalse(isExpired);
    }

    @Test
    void extractExpirationDate_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);

        // When
        Date expirationDate = jwtService.extractExpirationDate(token);

        // Then
        assertNotNull(expirationDate);
        assertTrue(expirationDate.after(new Date()));
    }

    @Test
    void blacklistToken_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);
        doNothing().when(valueOperations).set(anyString(), anyString(), anyLong(), any(TimeUnit.class));

        // When & Then
        assertDoesNotThrow(() -> jwtService.blacklistToken(token));
        
        // Verify Redis was called
        verify(valueOperations, times(1)).set(anyString(), anyString(), anyLong(), any(TimeUnit.class));
    }

    @Test
    void isTokenInBlacklist_NotBlacklisted_ReturnsFalse() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);
        lenient().when(valueOperations.get(anyString())).thenReturn(null);

        // When
        boolean isBlacklisted = jwtService.isTokenInBlacklist(token);

        // Then
        assertFalse(isBlacklisted);
    }

    @Test
    void isTokenInBlacklist_Blacklisted_ReturnsTrue() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);
        when(valueOperations.get(anyString())).thenReturn("blacklisted");

        // When
        boolean isBlacklisted = jwtService.isTokenInBlacklist(token);

        // Then
        assertTrue(isBlacklisted);
    }

    @Test
    void extractClaim_CustomClaim_Success() {
        // Given
        String token = jwtService.generateAccessToken(testUserDetails);

        // When
        String userId = jwtService.extractClaim(token, claims -> claims.get("userId", String.class));

        // Then
        assertEquals("user123", userId);
    }
}
