import { useState } from 'react';
import { fetchLogin } from '../../apis/login';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

// Helper function to check if user is admin
const checkIsAdmin = (user) => {
  // Method 1: Check roles array (preferred)
  if (user?.roles && Array.isArray(user.roles)) {
    return user.roles.some(role => role.name === 'ADMIN');
  }
  
  // Method 2: Fallback - check email pattern for admin
  if (user?.email) {
    return user.email.toLowerCase().includes('admin');
  }
  
  return false;
};

const AdminLoginModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

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
        // Check if user has ADMIN role
        const isAdmin = checkIsAdmin(result.user);
        
        if (!isAdmin) {
          setError('Bạn không có quyền truy cập Admin Panel');
          return;
        }

        console.log('🎉 ADMIN LOGIN SUCCESS', { 
          email: result.user.email, 
          roles: result.user.roles,
          isAdmin 
        });
        
        login({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        });

        onClose();
        navigate('/admin/dashboard');
        
        setEmail('');
        setPassword('');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại');
      }
    } catch (err) {
      console.error('❌ ADMIN LOGIN ERROR:', err);
      
      const status = err.response?.status;
      const message = err.response?.data?.error;

      if (status === 401) {
        setError('Email hoặc mật khẩu không đúng');
      } else if (status === 403) {
        if (message === "Tài khoản của bạn chưa được xác thực") {
          setError('Tài khoản chưa được xác thực');
        } else {
          setError('Tài khoản của bạn đã bị khóa');
        }
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-500 to-rose-400 p-8 rounded-t-2xl">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-white text-xl">close</span>
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-5xl">admin_panel_settings</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
              <p className="text-rose-100">Đăng nhập để quản lý hệ thống</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined text-red-600 text-xl flex-shrink-0">error</span>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold text-sm">Lỗi đăng nhập</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="admin@kanjimaster.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  <span>Đăng nhập</span>
                </>
              )}
            </button>

            {/* Info */}
            <div className="text-center text-sm text-gray-600">
              <p>Chỉ dành cho quản trị viên hệ thống</p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLoginModal;
