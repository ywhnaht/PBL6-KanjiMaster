import React, { useState } from "react";
import useAuthStore from "../../store/useAuthStore";

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const testAccounts = [
    { id: 1, email: "user1@test.com", password: "123456", name: "Nguyễn Văn A", level: "N5", kanjiMastered: 120 },
    { id: 2, email: "user2@test.com", password: "123456", name: "Trần Thị B", level: "N4", kanjiMastered: 350 },
    { id: 3, email: "admin@test.com", password: "123456", name: "Admin User", level: "N3", kanjiMastered: 650 }
  ];

  const loginWithTestAccount = (account) => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUser = {
        id: account.id,
        name: account.name,
        email: account.email,
        level: account.level,
        kanjiMastered: account.kanjiMastered,
        joinDate: new Date().toISOString(),
      };
      const mockToken = `mock-token-${account.id}`;
      login(mockUser, mockToken);

      onLoginSuccess?.(mockUser.id);
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUser = {
        id: 999,
        name: "Google User",
        email: "google.user@example.com",
        level: "N5",
        kanjiMastered: 0,
        joinDate: new Date().toISOString(),
      };
      const mockToken = `google-token-${Date.now()}`;
      login(mockUser, mockToken);

      onLoginSuccess?.(mockUser.id);
      setIsLoading(false);
      onClose();
    }, 800);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("loginEmail");
    const password = formData.get("loginPassword");

    const testAccount = testAccounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (testAccount) {
      loginWithTestAccount(testAccount);
      return;
    }

    alert("Email hoặc mật khẩu không đúng!");
    setIsLoading(false);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      alert("Tính năng đăng ký đang được phát triển! Vui lòng sử dụng tài khoản test.");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative border-2 border-[#DA7B93]">
        {/* Header with Japanese Style */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#DA7B93] to-[#c44569] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white">
          Kanji Master
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 hover:text-gray-800 transition-all duration-200 text-lg font-medium z-10"
          disabled={isLoading}
        >
          ✕
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#DA7B93] to-[#c44569] rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white">
            <span className="text-white font-bold" style={{ fontFamily: 'serif', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>漢</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-2">
            {isSignUp ? "Đăng ký tài khoản" : "Đăng nhập"}
          </h2>
          <p className="text-sm text-gray-600">
            {isSignUp ? "Bắt đầu hành trình chinh phục Kanji" : "Tiếp tục hành trình chinh phục Kanji"}
          </p>
        </div>

        {/* Login/Signup Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4 mb-6 relative z-10">
          {isSignUp && (
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Họ và tên"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DA7B93] focus:border-[#DA7B93] bg-white transition-all duration-200 text-gray-800"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <input
              type="email"
              name="loginEmail"
              placeholder="Email"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DA7B93] focus:border-[#DA7B93] bg-white transition-all duration-200 text-gray-800"
              required
              disabled={isLoading}
              defaultValue={!isSignUp ? "user1@test.com" : ""}
            />
          </div>

          <div>
            <input
              type="password"
              name="loginPassword"
              placeholder="Mật khẩu"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DA7B93] focus:border-[#DA7B93] bg-white transition-all duration-200 text-gray-800"
              required
              disabled={isLoading}
              defaultValue={!isSignUp ? "123456" : ""}
            />
          </div>

          {isSignUp && (
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DA7B93] focus:border-[#DA7B93] bg-white transition-all duration-200 text-gray-800"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#DA7B93] to-[#c44569] hover:from-[#c44569] hover:to-[#DA7B93] transition-all duration-300 disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isSignUp ? "Đang đăng ký..." : "Đang đăng nhập..."}
              </div>
            ) : (
              isSignUp ? "Đăng ký tài khoản" : "Đăng nhập"
            )}
          </button>
        </form>

        {/* Divider with Japanese Style */}
        <div className="flex items-center my-6 relative z-10">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm bg-white rounded-full">hoặc</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Login Button */}
        <div className="mb-6 relative z-10">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-[#DA7B93] hover:bg-[#DA7B93]/5 transition-all duration-300 disabled:opacity-60 shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập với Google
          </button>
        </div>

        {/* Switch between Login/Signup */}
        <div className="text-center relative z-10">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent font-semibold hover:from-[#DA7B93] hover:to-[#2F4454] transition-all duration-200 py-2 px-4 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            {isSignUp ? "← Quay lại đăng nhập" : "Tạo tài khoản mới →"}
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-200 relative z-10">
          <p className="text-xs text-gray-500 text-center">
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <a href="#" className="text-[#DA7B93] hover:text-[#c44569] font-medium">Điều khoản sử dụng</a>{" "}
            và{" "}
            <a href="#" className="text-[#DA7B93] hover:text-[#c44569] font-medium">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;