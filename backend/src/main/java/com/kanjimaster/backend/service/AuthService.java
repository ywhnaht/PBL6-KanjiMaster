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
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    JwtService jwtService;
    PasswordEncoder passwordEncoder;
    AuthenticationManager authenticationManager;
    CustomUserDetailService userDetailService;
    EmailService emailService;
    RedisTemplate<String, String> redisTemplate;

    String VERIFY_TOKEN_PREFIX = "verify:token:";
    String VERIFY_USER_PREFIX = "verify:user:";
    String REFRESH_TOKEN_PREFIX = "refreshtoken:";
    String RESET_TOKEN_PREFIX = "reset:token:";
    String RESET_USER_PREFIX = "reset:user:";

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
        String token =  verifyRequest.getToken();
        User user = validateAndGetUserFromToken(token, VERIFY_TOKEN_PREFIX, ErrorCode.INVALID_VERIFICATION_TOKEN);
        deleteOneTimeTokens(token, user.getEmail(), VERIFY_TOKEN_PREFIX, VERIFY_USER_PREFIX);

        if (!user.isVerified()) {
            user.setVerified(true);
            userRepository.save(user);
            log.info("Tài khoản đã được xác thực thành công: {}", user.getEmail());
        } else {
            log.info("Tài khoản đã được xác thực trước đó: {}", user.getEmail());
        }

        CustomUserDetails userDetail = userDetailService.loadUserByUsername(user.getEmail());

        return generateAuthResponse(user, userDetail);
    }

    public void forgetPassword(String email) {
        var user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.isVerified()) {
            log.warn("Yêu cầu reset pass cho email không tồn tại hoặc chưa xác thực: {}", email);
            return;
        }

        Optional<String> tokenOpt = generateOneTimeToken(email, RESET_TOKEN_PREFIX, RESET_USER_PREFIX, 15);
        if (tokenOpt.isEmpty()) {
            log.warn("Yêu cầu gửi lại mail reset password cho {}, nhưng token cũ vẫn còn hiệu lực. Bỏ qua.", email);
            return;
        }

        try {
            emailService.sendResetPasswordEmail(email, tokenOpt.get());
            log.info("Đã gửi email reset pass cho {}", user.getEmail());
        } catch (Exception e) {
            log.error("Không thể gửi email reset pass cho {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
        User user = validateAndGetUserFromToken(resetPasswordRequest.getToken(), RESET_TOKEN_PREFIX, ErrorCode.INVALID_RESET_TOKEN);
        deleteOneTimeTokens(resetPasswordRequest.getToken(), user.getEmail(), RESET_TOKEN_PREFIX, RESET_USER_PREFIX);

        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
        userRepository.save(user);

        String refreshRedisKey = REFRESH_TOKEN_PREFIX + user.getEmail();
        redisTemplate.delete(refreshRedisKey);

        log.info("Đã reset password và vô hiệu hóa mọi phiên đăng nhập cũ của tài khoản {}", user.getEmail());
    }

    public AuthResponse login(LoginDto loginDto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail(),
                            loginDto.getPassword())
                    );

            var user = userRepository.findByEmail(loginDto.getEmail()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            
            // Check if user is banned
            if (user.isBanned()) {
                throw new AppException(ErrorCode.USER_BANNED);
            }
            
            var userDetail = userDetailService.loadUserByUsername(user.getEmail());

            return generateAuthResponse(user, userDetail);
        } catch (DisabledException e) {
            User user = userRepository.findByEmail(loginDto.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            resendVerificationEmail(user);

            throw new AppException(ErrorCode.UNVERIFIED_EMAIL);
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
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
            log.info("Email {}", userEmail);
            String redisKey = REFRESH_TOKEN_PREFIX + userEmail;
            redisTemplate.delete(redisKey);
        }
    }

    private AuthResponse generateAuthResponse(User user, CustomUserDetails userDetail) {
        String accessToken = jwtService.generateAccessToken(userDetail);
        String refreshToken = jwtService.generateRefreshToken(userDetail);

        String refreshRedisKey = REFRESH_TOKEN_PREFIX + userDetail.getUsername();
        redisTemplate.opsForValue().set(refreshRedisKey, refreshToken, 7, TimeUnit.DAYS);

        UserProfileDto userProfileDto = buildUserProfileDto(user);
        return AuthResponse.builder()
                .user(userProfileDto)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private void deleteOneTimeTokens(String token, String email, String tokenPrefix, String userPrefix) {
        String tokenRedisKey = tokenPrefix + token;
        String userRedisKey = userPrefix + email;
        redisTemplate.delete(tokenRedisKey);
        redisTemplate.delete(userRedisKey);
    }

    private User validateAndGetUserFromToken(String token, String tokenPrefix, ErrorCode errorCode) {
        if (token == null || token.isEmpty()) {
            throw new AppException(errorCode);
        }

        String redisKey = tokenPrefix + token;
        String email = redisTemplate.opsForValue().get(redisKey);

        if (email == null) {
            throw new AppException(errorCode);
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Optional<String> generateOneTimeToken(String email, String tokenPrefix, String userPrefix, long ttlMinutes) {
        String userRedisKey = userPrefix + email;
        String existedToken = redisTemplate.opsForValue().get(userRedisKey);

        if (existedToken != null && !existedToken.isEmpty()) {
            return Optional.empty();
        }

        String token = UUID.randomUUID().toString();
        String tokenRedisKey = tokenPrefix + token;
        redisTemplate.opsForValue().set(tokenRedisKey, email, ttlMinutes, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(userRedisKey, token, ttlMinutes, TimeUnit.MINUTES);

        return Optional.of(token);
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
                .roles(user.getRoles())
                .build();
    }

    private void resendVerificationEmail(User user) {
        Optional<String> tokenOpt = generateOneTimeToken(user.getEmail(), VERIFY_TOKEN_PREFIX, VERIFY_USER_PREFIX, 15);

        if (tokenOpt.isEmpty()) {
            log.warn("Yêu cầu gửi lại mail cho {}, nhưng token cũ vẫn còn hiệu lực. Bỏ qua.", user.getEmail());
            return;
        }

        try {
            emailService.sendVerificationEmail(user.getEmail(), tokenOpt.get());
            log.info("Đã gửi lại email xác thực cho {}", user.getEmail());
        } catch (Exception e) {
            log.error("Không thể gửi lại email xác thực cho {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
