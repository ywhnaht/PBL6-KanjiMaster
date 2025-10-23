package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.dto.AuthResponse;
import com.kanjimaster.backend.model.dto.LoginDto;
import com.kanjimaster.backend.model.dto.RegisterDto;
import com.kanjimaster.backend.model.dto.RefreshTokenRequest;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
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
    RedisTemplate<String, String> redisTemplate;

    String PREFIX = "refreshtoken:";

    public String register(RegisterDto registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new IllegalStateException("Email đã được sử dụng.");
        }

        Role role = roleRepository.findByName("USER").get();

        // Logic gui OTP

        User user = User.builder()
                    .email(registerDto.getEmail())
                    .password(passwordEncoder.encode(registerDto.getPassword()))
                    .roles(Collections.singletonList(role))
                    .isVerified(true) // bo qua buoc verify
                    .build();

        String defaultAvatarUrl = "https://ui-avatars.com/api/?name="
                + registerDto.getFullName().replace(" ", "+")
                + "&background=random";

        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .fullName(registerDto.getFullName())
                .avatarUrl(defaultAvatarUrl)
                .totalKanjiLearned(0)
                .streakDays(1)
                .build();

        userRepository.save(user);
        userProfileRepository.save(userProfile);

        return "Vui lòng kiểm tra email để lấy mã OTP.";
    }

    public AuthResponse login(LoginDto loginDto) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));

        var user = userRepository.findByEmail(loginDto.getEmail()).orElseThrow(() -> new UsernameNotFoundException("Email not existed!"));
        var userDetail = userDetailService.loadUserByUsername(user.getEmail());

        String accessToken = jwtService.generateAccessToken(userDetail);
        String refreshToken = jwtService.generateRefreshToken(userDetail);

        String redisKey = PREFIX + userDetail.getUsername();
        redisTemplate.opsForValue().set(redisKey, refreshToken, 7, TimeUnit.DAYS);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
        String userEmail = jwtService.extractEmail(refreshToken);
        CustomUserDetails userDetails = userDetailService.loadUserByUsername(userEmail);

        String redisKey = PREFIX + userEmail;
        String storedToken = redisTemplate.opsForValue().get(redisKey);
        if (storedToken == null || !storedToken.equals(refreshToken) || !jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token is invalid or expired");
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
            String redisKey = PREFIX + userEmail;
            redisTemplate.delete(redisKey);
        }
    }

    public boolean verifyOtp(String otp) {
        return true;
    }
}
