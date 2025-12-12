package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BattleTokenService {
    static Logger logger = LoggerFactory.getLogger(BattleTokenService.class);
    static String BATTLE_TOKEN_PREFIX = "battle:token:";
    static long BATTLE_TOKEN_EXPIRATION = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    JwtService jwtService;
    UserRepository userRepository;
    RedisTemplate<String, String> redisTemplate;
    
    /**
     * Generate a special battle token with longer expiration time
     * @param userId User's ID (email)
     * @return Battle token string
     */
    public String generateBattleToken(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Create custom claims for battle token
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "BATTLE");
        claims.put("userId", userId);
        claims.put("email", user.getEmail());
        
        // Generate token with 30 minutes expiration
        String battleToken = jwtService.buildTokenWithClaims(claims, user.getEmail(), BATTLE_TOKEN_EXPIRATION);
        
        // Store in Redis for validation
        String redisKey = BATTLE_TOKEN_PREFIX + userId;
        redisTemplate.opsForValue().set(redisKey, battleToken, 30, TimeUnit.MINUTES);
        
        logger.info("Battle token generated for user: {}", userId);
        
        return battleToken;
    }
    
    /**
     * Validate battle token
     * @param token Battle token to validate
     * @param userId Expected user ID
     * @return true if valid, false otherwise
     */
    public boolean validateBattleToken(String token, String userId) {
        try {
            if (jwtService.isTokenExpired(token)) {
                logger.warn("Battle token expired for user: {}", userId);
                return false;
            }
            
            if (jwtService.isTokenInBlacklist(token)) {
                logger.warn("Battle token is blacklisted for user: {}", userId);
                return false;
            }
            
            // Verify it's a battle token
            Claims claims = jwtService.extractAllClaims(token);
            String type = (String) claims.get("type");
            String tokenUserId = (String) claims.get("userId");
            
            boolean isValid = "BATTLE".equals(type) && userId.equals(tokenUserId);
            
            if (!isValid) {
                logger.warn("Battle token validation failed for user: {}", userId);
            }
            
            return isValid;
            
        } catch (Exception e) {
            logger.error("Error validating battle token for user {}: {}", userId, e.getMessage());
            return false;
        }
    }
    
    /**
     * Revoke battle token for a user
     * @param userId User's ID
     */
    public void revokeBattleToken(String userId) {
        String redisKey = BATTLE_TOKEN_PREFIX + userId;
        redisTemplate.delete(redisKey);
        logger.info("Battle token revoked for user: {}", userId);
    }
    
    /**
     * Extract user ID from battle token
     * @param token Battle token
     * @return User ID
     */
    public String extractUserId(String token) {
        try {
            Claims claims = jwtService.extractAllClaims(token);
            return (String) claims.get("userId");
        } catch (Exception e) {
            logger.error("Error extracting userId from battle token: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Check if token is a battle token
     * @param token Token to check
     * @return true if it's a battle token
     */
    public boolean isBattleToken(String token) {
        try {
            Claims claims = jwtService.extractAllClaims(token);
            String type = (String) claims.get("type");
            return "BATTLE".equals(type);
        } catch (Exception e) {
            return false;
        }
    }
}

