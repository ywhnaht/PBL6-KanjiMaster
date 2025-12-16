package com.kanjimaster.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),

    // Authentication & Authorization Errors (1xxx)
    USER_EXISTS(1001, "Người dùng với email này đã tồn tại", HttpStatus.BAD_REQUEST),
    UNVERIFIED_EMAIL(1002, "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email và kích hoạt tài khoản.", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1003, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN(1004, "Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1005, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1006, "Không tìm thấy vai trò người dùng", HttpStatus.NOT_FOUND),
    INVALID_VERIFICATION_TOKEN(1007, "Mã xác thực không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    INVALID_RESET_TOKEN(1008, "Mã xác thực không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(1009, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),
    INVALID_INPUT(1010, "Đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_ACCESS_TOKEN(1011, "Access token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    NOTEBOOK_EXISTS(1012, "Notebook với tên này đã tồn tại", HttpStatus.BAD_REQUEST),
    NOTEBOOK_NOT_FOUND(1013, "Notebook không tồn tại", HttpStatus.NOT_FOUND),
    NOTEBOOK_UNAUTHORIZED(1014, "Bạn không có quyền truy cập notebook này", HttpStatus.UNAUTHORIZED),
    ENTRY_NOT_FOUND(1013, "NotebookEntry không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(1014, "Yêu cầu xác thực không thành công", HttpStatus.UNAUTHORIZED),
    ENTRY_EXISTS(1015, "%s đã được thêm trong notebook %s", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(1016, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    WRONG_PASSWORD(1017, "Mật khẩu hiện tại không đúng", HttpStatus.BAD_REQUEST),
    SAME_PASSWORD(1018, "Mật khẩu mới phải khác mật khẩu cũ", HttpStatus.BAD_REQUEST),
    FILE_EMPTY(1019, "File không được để trống", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(1020, "File quá lớn (tối đa 5MB)", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(1021, "Chỉ chấp nhận file ảnh", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(1022, "Upload file thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    NOTIFICATION_NOT_FOUND(1023, "Không tìm thấy thông báo", HttpStatus.NOT_FOUND),

    // Resource Errors (2xxx)
    KANJI_NOT_FOUND(2001, "Không tìm thấy Kanji", HttpStatus.NOT_FOUND),
    COMPOUND_NOT_FOUND(2002, "Không tìm thấy Compound", HttpStatus.NOT_FOUND),

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
