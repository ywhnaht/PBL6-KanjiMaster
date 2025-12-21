package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.AuthResponse;
import com.kanjimaster.backend.model.dto.LoginDto;
import com.kanjimaster.backend.model.dto.RegisterDto;
import com.kanjimaster.backend.model.dto.UserProfileDto;
import com.kanjimaster.backend.model.entity.CustomUserDetails;
import com.kanjimaster.backend.model.entity.Role;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.UserProfile;
import com.kanjimaster.backend.repository.RoleRepository;
import com.kanjimaster.backend.repository.UserProfileRepository;
import com.kanjimaster.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 * Tests authentication, registration, and token management functionality
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceSimpleTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private CustomUserDetailService userDetailService;

    @Mock
    private EmailService emailService;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role testRole;
    private UserProfile testUserProfile;
    private CustomUserDetails testUserDetails;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setName("USER");
        testRole.setId(1);

        testUserProfile = UserProfile.builder()
                .fullName("Test User")
                .avatarUrl("https://ui-avatars.com/api/?name=Test+User")
                .totalKanjiLearned(0)
                .streakDays(1)
                .build();

        testUser = User.builder()
                .id("user123")
                .email("test@example.com")
                .password("encodedPassword")
                .roles(Collections.singletonList(testRole))
                .isVerified(true)
                .build();
        
        testUser.setUserProfile(testUserProfile);
        testUserProfile.setUser(testUser);

        testUserDetails = CustomUserDetails.builder()
                .id(testUser.getId())
                .email(testUser.getEmail())
                .password(testUser.getPassword())
                .authorities(testUser.getRoles().stream()
                        .map(role -> (GrantedAuthority) () -> "ROLE_" + role.getName())
                        .collect(Collectors.toList()))
                .isVerified(testUser.isVerified())
                .build();
    }

    @Test
    void register_Success() {
        // Given
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail("newuser@example.com");
        registerDto.setPassword("password123");
        registerDto.setFullName("New User");

        when(userRepository.existsByEmail(registerDto.getEmail())).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(testRole));
        when(passwordEncoder.encode(registerDto.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), anyString(), anyLong(), any());

        // When
        assertDoesNotThrow(() -> authService.register(registerDto));

        // Then
        verify(userRepository).existsByEmail(registerDto.getEmail());
        verify(roleRepository).findByName("USER");
        verify(passwordEncoder).encode(registerDto.getPassword());
        verify(userRepository).save(any(User.class));
        verify(emailService).sendVerificationEmail(eq(registerDto.getEmail()), anyString());
    }

    @Test
    void register_UserAlreadyExists_ThrowsException() {
        // Given
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail("existing@example.com");
        registerDto.setPassword("password123");
        registerDto.setFullName("Existing User");

        when(userRepository.existsByEmail(registerDto.getEmail())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> authService.register(registerDto));
        assertEquals(ErrorCode.USER_EXISTS, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        // Given
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("password123");

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                testUserDetails, null, testUserDetails.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(loginDto.getEmail())).thenReturn(Optional.of(testUser));
        when(userDetailService.loadUserByUsername(loginDto.getEmail())).thenReturn(testUserDetails);
        when(jwtService.generateAccessToken(testUserDetails)).thenReturn("accessToken123");
        when(jwtService.generateRefreshToken(testUserDetails)).thenReturn("refreshToken123");
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), anyString(), anyLong(), any());

        // When
        AuthResponse response = authService.login(loginDto);

        // Then
        assertNotNull(response);
        assertEquals("accessToken123", response.getAccessToken());
        assertEquals("refreshToken123", response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals(testUser.getId(), response.getUser().getId());
        assertEquals(testUser.getEmail(), response.getUser().getEmail());
        assertEquals(testUserProfile.getFullName(), response.getUser().getFullName());
        
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateAccessToken(testUserDetails);
        verify(jwtService).generateRefreshToken(testUserDetails);
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        // Given
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

        // When & Then
        assertThrows(org.springframework.security.core.AuthenticationException.class, () -> authService.login(loginDto));
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    void login_UserBanned_ThrowsException() {
        // Given
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("password123");

        testUser.setBanned(true);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                testUserDetails, null, testUserDetails.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(loginDto.getEmail())).thenReturn(Optional.of(testUser));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> authService.login(loginDto));
        assertEquals(ErrorCode.USER_BANNED, exception.getErrorCode());
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    void refreshToken_Success() {
        // Given
        String refreshToken = "validRefreshToken123";
        String userEmail = "test@example.com";
        String newAccessToken = "newAccessToken456";

        when(jwtService.extractEmail(refreshToken)).thenReturn(userEmail);
        when(userDetailService.loadUserByUsername(userEmail)).thenReturn(testUserDetails);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("refreshtoken:" + userEmail)).thenReturn(refreshToken);
        when(jwtService.isTokenValid(refreshToken, testUserDetails)).thenReturn(true);
        when(jwtService.generateAccessToken(testUserDetails)).thenReturn(newAccessToken);

        // When
        AuthResponse response = authService.refreshToken(refreshToken);

        // Then
        assertNotNull(response);
        assertEquals(newAccessToken, response.getAccessToken());
        assertNull(response.getRefreshToken()); // Refresh token không được trả về trong refresh endpoint
        verify(jwtService).generateAccessToken(testUserDetails);
    }

    @Test
    void refreshToken_InvalidToken_ThrowsException() {
        // Given
        String refreshToken = "invalidRefreshToken";
        String userEmail = "test@example.com";

        when(jwtService.extractEmail(refreshToken)).thenReturn(userEmail);
        when(userDetailService.loadUserByUsername(userEmail)).thenReturn(testUserDetails);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("refreshtoken:" + userEmail)).thenReturn(null); // Token not in Redis

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> authService.refreshToken(refreshToken));
        assertEquals(ErrorCode.INVALID_REFRESH_TOKEN, exception.getErrorCode());
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    void logout_Success() {
        // Given
        String refreshToken = "refreshToken123";

        when(redisTemplate.delete(anyString())).thenReturn(true);

        // When
        assertDoesNotThrow(() -> authService.logout(refreshToken));

        // Then
        verify(redisTemplate).delete("refreshtoken:" + refreshToken);
    }
}
