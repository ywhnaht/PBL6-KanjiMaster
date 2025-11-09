// pages/VerificationPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // 🆕 CHỈ LẤY TOKEN TỪ URL
      const accessToken = searchParams.get('token');

      console.log("🔍 Thông tin từ URL:", {
        token: accessToken,
        allParams: Object.fromEntries(searchParams.entries())
      });

      if (!accessToken) {
        setStatus('error');
        setMessage('Thiếu token xác thực. Vui lòng kiểm tra lại đường link.');
        return;
      }

      try {
        const authApi = await import('../../apis/verify');
        
        // 🆕 CHỈ GỬI TOKEN, KHÔNG CẦN EMAIL
        const result = await authApi.verifyEmailApi(accessToken);
        
        console.log("📦 Kết quả xác thực:", result);

        if (result.success) {
          setStatus('success');
          setMessage(result.message || '🎉 Xác thực email thành công!');
          
          setTimeout(() => {
            navigate('/home');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Xác thực thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        
        // 🆕 XỬ LÝ LỖI CHI TIẾT HƠN
        const errorMessage = error.response?.data?.message 
          || error.message 
          || 'Có lỗi xảy ra khi xác thực. Vui lòng thử lại sau.';
        
        setStatus('error');
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#DA7B93] to-[#c44569] rounded-full flex items-center justify-center text-2xl text-white font-bold">
          漢
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Xác Thực Email
        </h1>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-[#DA7B93] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Đang xác thực email của bạn...</p>
            <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-green-600 text-lg font-semibold">{message}</p>
            <p className="text-gray-500 text-sm">Bạn sẽ được chuyển hướng tự động...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            
            <p className="text-red-600 text-lg font-semibold">{message}</p>

            {/* 🆕 HƯỚNG DẪN CẬP NHẬT */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
              <p className="text-yellow-800 text-sm font-medium mb-2">💡 Giải pháp:</p>
              <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>Link xác thực phải có tham số <code>token</code></li>
                <li>Ví dụ: <code>.../verify-email?token=your_verification_token</code></li>
                <li>Vui lòng liên hệ hỗ trợ để gửi lại email xác thực</li>
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
                onClick={() => navigate('/register')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đăng ký lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;