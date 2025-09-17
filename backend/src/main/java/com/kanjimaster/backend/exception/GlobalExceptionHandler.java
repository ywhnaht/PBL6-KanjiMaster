package com.kanjimaster.backend.exception;

import com.kanjimaster.backend.model.dto.ApiResponse;

import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(KanjiNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleKanjiNotFoundException(KanjiNotFoundException exception) {
        ApiResponse<?> response = ApiResponse.error(exception.getMessage());
        return ResponseEntity.status(404).body(response);
    }

    @ExceptionHandler(RedisConnectionFailureException.class)
    public ResponseEntity<ApiResponse<?>> handleRedisConnectionFailureException(RedisConnectionFailureException exception) {
        ApiResponse<?> response = ApiResponse.error("Redis connection failure " + exception.getMessage());
        return ResponseEntity.status(500).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<?>> handleRuntimeException(RuntimeException exception) {
        ApiResponse<?> response = ApiResponse.error(exception.getMessage());
        return ResponseEntity.status(400).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception exception) {
        ApiResponse<?> response = ApiResponse.error("Internal server error!");
        return ResponseEntity.status(500).body(response);
    }
}
