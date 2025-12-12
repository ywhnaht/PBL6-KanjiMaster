package com.kanjimaster.backend.exception;

import com.kanjimaster.backend.model.dto.ApiResponse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.kanjimaster.backend.controller")
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        return createErrorResponse(errorCode, exception);
    }

    @ExceptionHandler(value = BadCredentialsException.class)
    ResponseEntity<ApiResponse<?>> handleBadCredentialsException(BadCredentialsException exception) {
        return createErrorResponse(ErrorCode.UNAUTHENTICATED);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<?>> handleAccessDeniedException(AccessDeniedException exception) {
        return createErrorResponse(ErrorCode.ACCESS_DENIED);
    }

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<?>> handleUncategorizedException(Exception exception) {
        log.error("Uncategorized error occurred: ", exception);
        return createErrorResponse(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

    @ExceptionHandler(KanjiNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleKanjiNotFoundException(KanjiNotFoundException exception) {
        return createErrorResponse(ErrorCode.KANJI_NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(RedisConnectionFailureException.class)
    public ResponseEntity<ApiResponse<?>> handleRedisConnectionFailureException(RedisConnectionFailureException exception) {
        return createErrorResponse(ErrorCode.REDIS_CONNECTION_FAILURE);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        String errorMessage = exception.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse(ErrorCode.INVALID_INPUT.getMessage());

        return createErrorResponse(ErrorCode.INVALID_INPUT, errorMessage);
    }

//    @ExceptionHandler(RuntimeException.class)
//    public ResponseEntity<ApiResponse<?>> handleRuntimeException(RuntimeException exception) {
//        ApiResponse<?> response = ApiResponse.error(exception.getMessage());
//        return ResponseEntity.status(400).body(response);
//    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<?>> handleDisabledUser(DisabledException ex) {
        ErrorCode errorCode = ErrorCode.UNVERIFIED_EMAIL;
        ApiResponse<?> response = ApiResponse.error(errorCode.getMessage(), errorCode.name());
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    private ResponseEntity<ApiResponse<?>> createErrorResponse(ErrorCode errorCode) {
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.getMessage(), errorCode.name()));
    }

    private ResponseEntity<ApiResponse<?>> createErrorResponse(ErrorCode errorCode, AppException exception) {
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.error(exception.getMessage(), errorCode.name()));
    }

    private ResponseEntity<ApiResponse<?>> createErrorResponse(ErrorCode errorCode, String customMessage) {
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.error(customMessage, errorCode.name()));
    }
}
