package com.kanjimaster.backend.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpService {
    RedisTemplate<String, String> redisTemplate;
    static String OTP_PREFIX = "opt:";
    static long OTP_EXPIRATION_TIME = 5;

    public void saveOtp(String email, String otp) {
        String key = OTP_PREFIX + email;
        redisTemplate.opsForValue().set(key, otp, OTP_EXPIRATION_TIME, TimeUnit.MINUTES);
    }

    public String getOtp(String email) {
        String key = OTP_PREFIX + email;
        return redisTemplate.opsForValue().get(key);
    }

    public void clearOtp(String email) {
        String key = OTP_PREFIX + email;
        redisTemplate.delete(key);
    }
}
