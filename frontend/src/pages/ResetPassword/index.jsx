// pages/ResetPasswordPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../apis/resetPassword';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, ready, success, error
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const token = searchParams.get('token');
    
    console.log("🔍 Thông tin từ URL:", {
      token: token,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (!token) {
      setStatus('error');
      setMessage('Thiếu token đặt lại mật khẩu. Vui lòng kiểm tra lại đường link.');
      return;
    }

    setStatus('ready');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = searchParams.get('token');
    
    if (!token) {
      setMessage('Token không hợp lệ. Vui lòng kiểm tra lại đường link.');
      return;
    }

    // Validate password
    if (!password.trim()) {
      setMessage('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await resetPassword(token, password);
      
      console.log("📦 Kết quả đặt lại mật khẩu:", result);

      if (result.success) {
        setStatus('success');
        setMessage(result.message || '🎉 Đặt lại mật khẩu thành công!');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.';
      
      setStatus('error');
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#DA7B93] to-[#c44569] rounded-full flex items-center justify-center text-2xl text-white font-bold">
          漢
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Đặt Lại Mật Khẩu
        </h1>

        {status === 'loading' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto border-4 border-[#DA7B93] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Đang kiểm tra liên kết...</p>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DA7B93] focus:border-transparent transition-colors"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DA7B93] focus:border-transparent transition-colors"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm text-center ${
                message.includes('thành công') 
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#DA7B93] to-[#c44569] text-white rounded-lg hover:from-[#c44569] hover:to-[#DA7B93] disabled:opacity-50 transition-colors font-medium shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </div>
              ) : (
                'Đặt Lại Mật Khẩu'
              )}
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-green-600 text-lg font-semibold">{message}</p>
            <p className="text-gray-500 text-sm">Bạn sẽ được chuyển đến trang đăng nhập...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            
            <p className="text-red-600 text-lg font-semibold">{message}</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
              <p className="text-yellow-800 text-sm font-medium mb-2">💡 Giải pháp:</p>
              <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>Link đặt lại mật khẩu phải có tham số <code>token</code></li>
                <li>Token có thể đã hết hạn hoặc không hợp lệ</li>
                <li>Vui lòng yêu cầu gửi lại email đặt lại mật khẩu</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-[#DA7B93] text-white rounded-lg hover:bg-[#c44569] transition-colors"
              >
                Đến trang đăng nhập
              </button>
              <button
                onClick={() => navigate('/forgot-password')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Quên mật khẩu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;