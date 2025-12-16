import { useState } from 'react';
import { fetchLogin } from '../../apis/login';
import { useAuthStore } from '../../store/useAuthStore';
import useDarkModeStore from '../../store/useDarkModeStore';
import ForgetPasswordModal from '../ForgetPasswordModal';

const LoginModal = ({ onClose, onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const isDark = useDarkModeStore((state) => state.isDark);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await fetchLogin(email, password);
      
      if (result.error === 'unverified') {
        setError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email.');
        return;
      }

      if (result.user && result.accessToken) {
        console.log('🎉 LOGIN SUCCESS - API Response:');
        
        login({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        });

        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          onClose();
        }
        
        setEmail('');
        setPassword('');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại');
      }
    } catch (err) {
      console.error('❌ LOGIN ERROR:', err);
      
      const status = err.response?.status;
      const message = err.response?.data?.error;

      if (status === 401) {
        setError('Email hoặc mật khẩu không đúng');
      } else if (status === 403 && message !== "Tài khoản của bạn chưa được xác thực") {
        setError('Tài khoản của bạn đã bị khóa');
      } else if (status === 429) {
        setError('Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  // 🎯 THÊM: Hàm xử lý click overlay
  const handleOverlayClick = (e) => {
    // Chỉ đóng modal khi click trực tiếp vào overlay (background)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleForgetPasswordClick = () => {
    console.log('🔵 Forget password clicked');
    setShowForgetPassword(true);
  };

  const handleForgetPasswordClose = () => {
    console.log('🔵 Forget password modal closed');
    setShowForgetPassword(false);
  };

  const handleForgetPasswordSuccess = () => {
    console.log('✅ Forget password success - closing all modals');
    setShowForgetPassword(false);
    onClose();
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError("");
    
    setTimeout(() => {
      alert("Tính năng đăng nhập Google đang được phát triển!");
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      {/* Hiển thị LoginModal khi không mở ForgetPasswordModal */}
      {!showForgetPassword && (
        // 🎯 SỬA: Thêm onClick để xử lý click bên ngoài
        <div 
          className={`fixed inset-0 z-[10001] flex items-center justify-center px-4 transition-colors duration-300 ${
            isDark ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={handleOverlayClick} // 🎯 CLICK OVERLAY ĐÓNG MODAL
        >
          {/* 🎯 SỬA: Thêm stopPropagation để ngăn click trong modal lan ra ngoài */}
          <div 
            className={`w-full max-w-md rounded-2xl p-8 relative border transition-colors duration-300 ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()} // 🎯 NGĂN CLICK TRONG MODAL
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#DA7B93] to-[#c44569] text-white px-6 py-2 rounded-full text-sm font-bold border border-white">
              Kanji Master
            </div>

            <button
              onClick={handleClose}
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-lg font-medium z-10 transition-colors duration-150 ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-100'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
              }`}
              disabled={isLoading}
            >
              ✕
            </button>

            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#DA7B93] to-[#c44569] rounded-full flex items-center justify-center text-2xl border-2 border-white">
                <span
                  className="text-white font-bold"
                  style={{
                    fontFamily: "serif",
                  }}
                >
                  漢
                </span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-2">
                Đăng nhập
              </h2>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Tiếp tục hành trình chinh phục Kanji
              </p>
            </div>

            {error && (
              <div className={`mb-4 p-3 border rounded-lg text-sm text-center relative z-10 transition-colors duration-300 ${
                error.includes("thành công") 
                  ? isDark
                    ? "bg-green-900/30 border-green-700/50 text-green-400"
                    : "bg-green-50 border-green-200 text-green-600"
                  : isDark
                  ? "bg-red-900/30 border-red-700/50 text-red-400"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}>
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 mb-6 relative z-10"
            >
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={`w-full p-4 border rounded-lg transition-all duration-150 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-[#DA7B93] focus:border-[#DA7B93]'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-1 focus:ring-[#DA7B93] focus:border-[#DA7B93]'
                  }`}
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
                  className={`w-full p-4 border rounded-lg transition-all duration-150 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-[#DA7B93] focus:border-[#DA7B93]'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-1 focus:ring-[#DA7B93] focus:border-[#DA7B93]'
                  }`}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgetPasswordClick}
                  className={`text-sm font-medium transition-colors duration-150 ${
                    isDark
                      ? 'text-rose-400 hover:text-rose-300'
                      : 'text-[#DA7B93] hover:text-[#c44569]'
                  }`}
                  disabled={isLoading}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-[#DA7B93] to-[#c44569] hover:from-[#c44569] hover:to-[#DA7B93] transition-all duration-200 disabled:opacity-60 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            <div className="flex items-center my-6 relative z-10">
              <div className={`flex-1 border-t transition-colors duration-300 ${
                isDark ? 'border-slate-700' : 'border-gray-300'
              }`}></div>
              <span className={`px-4 text-sm transition-colors duration-300 ${
                isDark
                  ? 'text-slate-500 bg-slate-800'
                  : 'text-gray-500 bg-white'
              }`}>
                hoặc
              </span>
              <div className={`flex-1 border-t transition-colors duration-300 ${
                isDark ? 'border-slate-700' : 'border-gray-300'
              }`}></div>
            </div>

            <div className="mb-6 relative z-10">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-150 disabled:opacity-60 border ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:border-[#DA7B93]/50'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#DA7B93] hover:bg-[#DA7B93]/5'
                }`}
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
                Đăng nhập với Google
              </button>
            </div>

            <div className="text-center relative z-10">
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => {
                    handleClose();
                    if (onSwitchToRegister) onSwitchToRegister();
                  }}
                  className={`font-semibold underline transition-colors duration-150 ${
                    isDark
                      ? 'text-rose-400 hover:text-rose-300'
                      : 'text-[#DA7B93] hover:text-[#c44569]'
                  }`}
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>

            <div className={`mt-6 pt-4 border-t relative z-10 transition-colors duration-300 ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <p className={`text-xs text-center transition-colors duration-300 ${
                isDark ? 'text-slate-500' : 'text-gray-500'
              }`}>
                Bằng việc đăng nhập, bạn đồng ý với{" "}
                <a
                  href="#"
                  className={`font-medium transition-colors duration-150 ${
                    isDark
                      ? 'text-rose-400 hover:text-rose-300'
                      : 'text-[#DA7B93] hover:text-[#c44569]'
                  }`}
                >
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  className={`font-medium transition-colors duration-150 ${
                    isDark
                      ? 'text-rose-400 hover:text-rose-300'
                      : 'text-[#DA7B93] hover:text-[#c44569]'
                  }`}
                >
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quên Mật Khẩu */}
      <ForgetPasswordModal
        isOpen={showForgetPassword}
        onClose={handleForgetPasswordClose}
        onSuccess={handleForgetPasswordSuccess}
      />
    </>
  );
};

export default LoginModal;