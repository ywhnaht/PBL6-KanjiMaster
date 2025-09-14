package com.kanjimaster.backend.exception;

import com.kanjimaster.backend.model.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

//@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<?>> handleRuntimeException(RuntimeException exception) {
        ApiResponse<?> response = ApiResponse.error(exception.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception exception) {
        ApiResponse<?> response = ApiResponse.error("Internal server error!");
        return ResponseEntity.badRequest().body(response);
    }
}
