import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,

      // 🔐 AUTH ACTIONS
      // Đăng nhập - lưu cả token và user
      login: (userData, token) => {
        set({
          user: userData,
          accessToken: token,
          isLoading: false
        });
        console.log("✅ Đăng nhập thành công:", userData?.email);
      },

      // Đăng xuất - xóa tất cả
      logout: () => {
        set({
          user: null,
          accessToken: null,
          isLoading: false
        });
        console.log("✅ Đã đăng xuất");
      },

      // Cập nhật thông tin user
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
        console.log("✅ Cập nhật thông tin user");
      },

      // 🎯 HELPER METHODS
      // Kiểm tra đã đăng nhập chưa
      isLoggedIn: () => {
        const { accessToken, user } = get();
        return !!(accessToken && user);
      },

      // Lấy user ID
      getUserId: () => {
        return get().user?.id || null;
      },

      // Lấy thông tin user
      getUserInfo: () => {
        return get().user || {};
      },

      // Lấy token
      getToken: () => {
        return get().accessToken;
      },

      // ⚡ LOADING STATES
      // Bắt đầu loading
      setLoading: (loading) => set({ isLoading: loading }),

      // Clear toàn bộ state (for debugging)
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          isLoading: false
        });
        console.log("✅ Đã clear auth state");
      }
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
      
      // Chỉ lưu những field cần thiết
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        // KHÔNG lưu isLoading vì không cần thiết
      }),

      // Xử lý khi load từ localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("🔄 Đã load auth state từ localStorage");
          
          // Kiểm tra token hết hạn (nếu cần)
          // if (state.accessToken && isTokenExpired(state.accessToken)) {
          //   state.accessToken = null;
          //   state.user = null;
          // }
        }
      },
    }
  )
);

export default useAuthStore;