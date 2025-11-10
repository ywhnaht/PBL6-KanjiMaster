import { axiosPrivate } from "./axios"; // Thay đổi đường dẫn nếu cần

// --- API 1: Quên Mật Khẩu (/api/auth/forget-pass) ---

/**
 * Gửi yêu cầu quên mật khẩu.
 * @param {string} email - Địa chỉ email của người dùng.
 * @returns {Promise<object>} - Phản hồi từ server.
 */
export const forgetPassword = async (email) => {
  console.log(`[API] Gửi yêu cầu quên mật khẩu cho email: ${email}`);

  try {
    const response = await axiosPrivate.post(
      `/api/auth/forget-pass?email=${encodeURIComponent(email)}`
    );

    return response.data;
  } catch (error) {
    console.error("[API ERROR] Lỗi khi gửi yêu cầu quên mật khẩu:", error);
    throw error;
  }
};

// --- API 2: Đặt Lại Mật Khẩu (/api/auth/reset-password) ---

/**
 * Gửi yêu cầu đặt lại mật khẩu mới.
 * @param {string} token - Token được gửi qua email.
 * @param {string} newPassword - Mật khẩu mới.
 * @returns {Promise<object>} - Phản hồi từ server.
 */
export const resetPassword = async (token, newPassword) => {
  console.log("[API] Gửi yêu cầu đặt lại mật khẩu...");

  try {
    const response = await axiosPrivate.post("/api/auth/reset-password", {
      token: token,
      newPassword: newPassword,
    });

    return response.data;
  } catch (error) {
    console.error("[API ERROR] Lỗi khi gửi yêu cầu đặt lại mật khẩu:", error);
    throw error;
  }
};
