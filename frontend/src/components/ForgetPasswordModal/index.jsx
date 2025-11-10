import React, { useState, useEffect } from 'react';
import { forgetPassword } from '../../apis/resetPassword'; 

const ForgetPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Effect để đếm ngược và tự động đóng
  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (showSuccessModal && countdown === 0) {
      handleSuccessClose();
    }
  }, [showSuccessModal, countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Vui lòng nhập địa chỉ email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      await forgetPassword(email.trim());
      setShowSuccessModal(true);
      setCountdown(5);
      setEmail('');
    } catch (error) {
      setMessage(
        error.response?.data?.message || 
        'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setShowSuccessModal(false);
    setCountdown(5);
    onClose();
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setCountdown(5);
    onSuccess?.();
  };

  // 🎯 THÊM: Hàm xử lý click overlay
  const handleOverlayClick = (e) => {
    // Chỉ đóng modal khi click trực tiếp vào overlay (background)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // 🎯 THÊM: Hàm xử lý click overlay cho modal thành công
  const handleSuccessOverlayClick = (e) => {
    // Chỉ đóng modal khi click trực tiếp vào overlay (background)
    if (e.target === e.currentTarget) {
      handleSuccessClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal quên mật khẩu chính */}
      {!showSuccessModal && (
        // 🎯 SỬA: Thêm onClick để xử lý click bên ngoài
        <div 
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          onClick={handleOverlayClick} // 🎯 CLICK OVERLAY ĐÓNG MODAL
        >
          {/* 🎯 SỬA: Thêm stopPropagation để ngăn click trong modal lan ra ngoài */}
          <div 
            className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200"
            onClick={(e) => e.stopPropagation()} // 🎯 NGĂN CLICK TRONG MODAL
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-3 text-center">
              Quên Mật Khẩu
            </h2>
            
            <p className="text-gray-600 text-sm mb-6 text-center">
              Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ email
                </label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DA7B93] focus:border-transparent bg-white transition-colors duration-150 text-gray-800"
                />
              </div>

              {message && (
                <div className={`mb-4 p-3 border rounded-lg text-sm text-center ${
                  message.includes('thành công') 
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#DA7B93] to-[#c44569] text-white rounded-lg hover:from-[#c44569] hover:to-[#DA7B93] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-medium shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    'Gửi yêu cầu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thông báo thành công */}
      {showSuccessModal && (
        // 🎯 SỬA: Thêm onClick để xử lý click bên ngoài
        <div 
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          onClick={handleSuccessOverlayClick} // 🎯 CLICK OVERLAY ĐÓNG MODAL
        >
          {/* 🎯 SỬA: Thêm stopPropagation để ngăn click trong modal lan ra ngoài */}
          <div 
            className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200"
            onClick={(e) => e.stopPropagation()} // 🎯 NGĂN CLICK TRONG MODAL
          >
            <div className="text-center">
              {/* Icon success */}
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Thành công
              </h2>
              
              <p className="text-gray-600 text-sm mb-4">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn.
              </p>
              <p className="text-gray-500 text-xs mb-6">
                Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
              </p>

              {/* Hiển thị đếm ngược */}
              <div className="text-lg font-bold text-[#DA7B93] mb-4">
                Tự động đóng sau: <span className="text-2xl">{countdown}</span> giây
              </div>

              <button
                onClick={handleSuccessClose}
                className="px-6 py-3 bg-gradient-to-r from-[#DA7B93] to-[#c44569] text-white rounded-lg hover:from-[#c44569] hover:to-[#DA7B93] transition-colors duration-150 font-medium shadow-md"
              >
                Đóng ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForgetPasswordModal;