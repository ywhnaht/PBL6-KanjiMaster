package com.kanjimaster.backend.service;

import com.kanjimaster.backend.config.JwtProperties;
import com.kanjimaster.backend.model.entity.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtService {
    JwtProperties jwtProperties;
    RedisTemplate<String, String> redisTemplate;
    String BLACK_LIST_PREFIX = "blacklist:";

    public String generateAccessToken(CustomUserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, jwtProperties.getAccessTokenExpiration());
    }

    public String generateRefreshToken(CustomUserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, jwtProperties.getRefreshTokenExpiration());
    }

    public String buildToken(Map<String, Object> extraClaims, CustomUserDetails userDetails, long expiration) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, getSignInKey())
                .setId(UUID.randomUUID().toString())
                .compact();

    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractId(String token) {
        return extractClaim(token, Claims::getId);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, CustomUserDetails userDetails) {
        String userEmail = extractEmail(token);

        return (userEmail.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        return extractExpirationDate(token).before(new Date());
    }

    public Date extractExpirationDate(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenInBlacklist(String token) {
        try {
            String jti = extractId(token);
            String key = BLACK_LIST_PREFIX + jti;
            return  redisTemplate.hasKey(key);
        } catch (Exception e) {
            return false;
        }
    }

    public void blacklistToken(String token) {
        String jti = extractId(token);
        Date expirationDate = extractExpirationDate(token);
        long remainingMillis = expirationDate.getTime() - System.currentTimeMillis();

        if (remainingMillis > 0) {
            String key = BLACK_LIST_PREFIX + jti;
            redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofMillis(remainingMillis));
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith((SecretKey) getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
