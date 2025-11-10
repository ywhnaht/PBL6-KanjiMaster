package com.kanjimaster.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),

    // Authentication & Authorization Errors (1xxx)
    USER_EXISTS(1001, "Người dùng với email này đã tồn tại", HttpStatus.BAD_REQUEST),
    UNVERIFIED_EMAIL(1002, "Tài khoản của bạn chưa được xác thực hoặc đã bị khóa", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1003, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN(1004, "Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1005, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1006, "Không tìm thấy vai trò người dùng", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_OTP(1007, "OTP không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(1008, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),

    // Resource Errors (2xxx)
    KANJI_NOT_FOUND(2001, "Không tìm thấy Kanji", HttpStatus.NOT_FOUND),

    // Infrastructure Errors (3xxx)
    REDIS_CONNECTION_FAILURE(3001, "Không thể kết nối đến máy chủ Redis", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
