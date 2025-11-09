import { useState } from 'react';
import { fetchRegister } from '../../apis/register';
import { useAuthStore } from '../../store/useAuthStore';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [fullName, setfullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetchRegister(fullName, email, password);
      
      if (result.success) {
        setSuccess(true);
        localStorage.setItem("pendingVerificationEmail", email);
        
        setfullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onSwitchToLogin) onSwitchToLogin();
        }, 3000);
      } else {
        setError(result.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setfullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleGoogleRegister = () => {
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      alert("Tính năng đăng ký Google đang được phát triển!");
      setIsLoading(false);
    }, 500);
  };

  return (
    // SỬA: Bỏ backdrop-blur-sm và giảm opacity
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
      {/* SỬA: Đơn giản hóa shadow và border */}
      <div className="w-full max-w-md bg-white rounded-2xl p-8 relative border border-gray-200">
        {/* Header đơn giản hóa */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#2F4454] to-[#376E6F] text-white px-6 py-2 rounded-full text-sm font-bold border border-white">
          Kanji Master
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 hover:text-gray-800 transition-colors duration-150 text-lg font-medium z-10"
          disabled={isLoading}
        >
          ✕
        </button>

        {/* Logo and Title - đơn giản hóa */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#2F4454] to-[#376E6F] rounded-full flex items-center justify-center text-2xl border-2 border-white">
            <span
              className="text-white font-bold"
              style={{
                fontFamily: "serif",
              }}
            >
              字
            </span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F4454] to-[#376E6F] bg-clip-text text-transparent mb-2">
            Đăng ký
          </h2>
          <p className="text-sm text-gray-600">
            Bắt đầu hành trình chinh phục Kanji
          </p>
        </div>

        {/* Hiển thị thông báo thành công - đơn giản hóa */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm text-center relative z-10">
            <div className="font-semibold">🎉 Đăng ký thành công!</div>
            <div className="text-xs mt-1">
              Vui lòng kiểm tra email để xác thực tài khoản.
              <br />
              Tự động chuyển sang đăng nhập sau 3 giây...
            </div>
          </div>
        )}

        {/* Hiển thị lỗi - đơn giản hóa */}
        {error && !success && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center relative z-10">
            {error}
          </div>
        )}

        {/* Register Form - tối ưu hiệu ứng */}
        {!success && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 mb-6 relative z-10"
          >
            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setfullName(e.target.value)}
                placeholder="Tên người dùng"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2F4454] focus:border-[#2F4454] bg-white transition-colors duration-150 text-gray-800"
                required
                disabled={isLoading}
                minLength={3}
              />
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2F4454] focus:border-[#2F4454] bg-white transition-colors duration-150 text-gray-800"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2F4454] focus:border-[#2F4454] bg-white transition-colors duration-150 text-gray-800"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2F4454] focus:border-[#2F4454] bg-white transition-colors duration-150 text-gray-800"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-[#2F4454] to-[#376E6F] hover:from-[#376E6F] hover:to-[#2F4454] transition-colors duration-200 disabled:opacity-60 shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng ký...
                </div>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>
        )}

        {/* Divider đơn giản */}
        {!success && (
          <>
            <div className="flex items-center my-6 relative z-10">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm bg-white">
                hoặc
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Register Button - đơn giản hóa */}
            <div className="mb-6 relative z-10">
              <button
                onClick={handleGoogleRegister}
                disabled={isLoading}
                className="w-full py-4 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:border-[#2F4454] hover:bg-[#2F4454]/5 transition-colors duration-150 disabled:opacity-60 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng ký với Google
              </button>
            </div>
          </>
        )}

        {/* Login Link */}
        <div className="text-center relative z-10">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <button
              onClick={() => {
                handleClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
              className="text-[#2F4454] hover:text-[#376E6F] font-semibold underline transition-colors duration-150"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-200 relative z-10">
          <p className="text-xs text-gray-500 text-center">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <a
              href="#"
              className="text-[#2F4454] hover:text-[#376E6F] font-medium transition-colors duration-150"
            >
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a
              href="#"
              className="text-[#2F4454] hover:text-[#376E6F] font-medium transition-colors duration-150"
            >
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;