import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import AdminLoginModal from '../AdminLogin';

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

const ProtectedAdminRoute = ({ children }) => {
  const { user, accessToken } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!user || !accessToken) {
      setShowLoginModal(true);
      setIsChecking(false);
      return;
    }

    // Check if user has ADMIN role
    const isAdmin = checkIsAdmin(user);
    if (!isAdmin) {
      // Redirect non-admin users to home
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [user, accessToken]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 text-lg">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  // Show login modal if not authenticated
  if (!user || !accessToken) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <span className="material-symbols-outlined text-8xl text-purple-600 mb-4">admin_panel_settings</span>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Area</h1>
            <p className="text-gray-600 mb-4">Vui lòng đăng nhập để tiếp tục</p>
          </div>
        </div>
        {showLoginModal && <AdminLoginModal onClose={() => setShowLoginModal(false)} />}
      </>
    );
  }

  // Check ADMIN role
  const isAdmin = checkIsAdmin(user);
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
