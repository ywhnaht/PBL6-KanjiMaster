package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.model.entity.CustomUserDetails;
import com.kanjimaster.backend.model.entity.Role;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.UserProfile;
import com.kanjimaster.backend.repository.RoleRepository;
import com.kanjimaster.backend.repository.UserProfileRepository;
import com.kanjimaster.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserProfileRepository userProfileRepository;
    JwtService jwtService;
    PasswordEncoder passwordEncoder;
    AuthenticationManager authenticationManager;
    CustomUserDetailService userDetailService;
    EmailService emailService;
    RedisTemplate<String, String> redisTemplate;

    String REFRESH_TOKEN_PREFIX = "refreshtoken:";
    String VERIFY_TOKEN_PREFIX = "verify:";
    String VERIFY_USER_PREFIX = "verify_user:";

    @Transactional
    public void register(RegisterDto registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTS);
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        User user = User.builder()
                    .email(registerDto.getEmail())
                    .password(passwordEncoder.encode(registerDto.getPassword()))
                    .roles(Collections.singletonList(role))
                    .isVerified(false)
                    .build();

        String defaultAvatarUrl = "https://ui-avatars.com/api/?name="
                + registerDto.getFullName().replace(" ", "+")
                + "&background=random";

        UserProfile userProfile = UserProfile.builder()
                .fullName(registerDto.getFullName())
                .avatarUrl(defaultAvatarUrl)
                .totalKanjiLearned(0)
                .streakDays(1)
                .build();

        user.setUserProfile(userProfile);
        userProfile.setUser(user);
        User savedUser = userRepository.save(user);

        resendVerificationEmail(savedUser);
    }

    @Transactional
    public AuthResponse verify(VerifyRequest verifyRequest) {
        String token = verifyRequest.getToken();
        if (token == null || token.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        String redisKey = VERIFY_TOKEN_PREFIX + token;
        String email = redisTemplate.opsForValue().get(redisKey);
        if (email == null) {
            throw new AppException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String userRedisKey =  VERIFY_USER_PREFIX + email;
        redisTemplate.delete(redisKey);
        redisTemplate.delete(userRedisKey);

        if (!user.isVerified()) {
            user.setVerified(true);
            userRepository.save(user);
            log.info("Tài khoản đã được xác thực thành công: {}", email);
        } else {
            log.info("Tài khoản đã được xác thực trước đó: {}", email);
        }

        CustomUserDetails userDetail = userDetailService.loadUserByUsername(email);

        String accessToken = jwtService.generateAccessToken(userDetail);
        String refreshToken = jwtService.generateRefreshToken(userDetail);

        String refreshRedisKey = REFRESH_TOKEN_PREFIX + userDetail.getUsername();
        redisTemplate.opsForValue().set(refreshRedisKey, refreshToken, 7, TimeUnit.DAYS);

        UserProfileDto userProfileDto = buildUserProfileDto(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userProfileDto)
                .build();
    }

    public AuthResponse login(LoginDto loginDto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail(),
                            loginDto.getPassword())
                    );

            var user = userRepository.findByEmail(loginDto.getEmail()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            var userDetail = userDetailService.loadUserByUsername(user.getEmail());

            String accessToken = jwtService.generateAccessToken(userDetail);
            String refreshToken = jwtService.generateRefreshToken(userDetail);

            String redisKey = REFRESH_TOKEN_PREFIX + userDetail.getUsername();
            redisTemplate.opsForValue().set(redisKey, refreshToken, 7, TimeUnit.DAYS);

            UserProfileDto userProfileDto = buildUserProfileDto(user);

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(userProfileDto)
                    .build();
        } catch (DisabledException e) {
            User user = userRepository.findByEmail(loginDto.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            resendVerificationEmail(user);

            throw new AppException(ErrorCode.UNVERIFIED_EMAIL);
        }
    }

    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
        String userEmail = jwtService.extractEmail(refreshToken);
        CustomUserDetails userDetails = userDetailService.loadUserByUsername(userEmail);

        String redisKey = REFRESH_TOKEN_PREFIX + userEmail;
        String storedToken = redisTemplate.opsForValue().get(redisKey);
        if (storedToken == null || !storedToken.equals(refreshToken) || !jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String newAccessToken =  jwtService.generateAccessToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void logout(String authHeader) {
        String accessToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }

        if (accessToken != null) {
            jwtService.blacklistToken(accessToken);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String userEmail = authentication.getName();
            log.info("Email" + userEmail);
            String redisKey = REFRESH_TOKEN_PREFIX + userEmail;
            redisTemplate.delete(redisKey);
        }
    }

    private UserProfileDto buildUserProfileDto(User user) {
        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            log.error("Không tìm thấy UserProfile cho user: {}", user.getEmail());
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(profile.getFullName())
                .avatarUrl(profile.getAvatarUrl())
                .totalKanjiLearned(profile.getTotalKanjiLearned())
                .streakDays(profile.getStreakDays())
                .build();
    }

    private void resendVerificationEmail(User user) {
        String email = user.getEmail();
        String userRedisKey = VERIFY_USER_PREFIX + email;

        String existedToken = redisTemplate.opsForValue().get(VERIFY_USER_PREFIX + email);

        if (existedToken != null) {
            log.warn("Yêu cầu gửi lại mail cho {}, nhưng token cũ vẫn còn hiệu lực. Bỏ qua.", email);
            return;
        }

        try {
            String token = UUID.randomUUID().toString();
            String redisKey = VERIFY_TOKEN_PREFIX + token;

            redisTemplate.opsForValue().set(redisKey, user.getEmail(), 15, TimeUnit.MINUTES);
            redisTemplate.opsForValue().set(userRedisKey, token, 15, TimeUnit.MINUTES);

            emailService.sendVerificationEmail(user.getEmail(), token);
            log.info("Đã gửi lại email xác thực cho {}", user.getEmail());
        } catch (Exception e) {
            log.error("Không thể gửi lại email xác thực cho {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
