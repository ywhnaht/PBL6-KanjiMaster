// Header.jsx - Cập nhật để hỗ trợ làm mờ khi modal mở
import React from "react";
import { useAuthStore } from "../../store/useAuthStore";

export default function Header({ onOpenLogin, isModalOpen }) {
  const authStore = useAuthStore();

  const checkLoggedIn = () => {
    const { accessToken, user } = authStore;
    return !!(accessToken && user);
  };

  const handleLogout = () => {
    if (typeof authStore.logout === "function") {
      authStore.logout();
    } else if (typeof authStore.clearAuth === "function") {
      authStore.clearAuth();
    } else {
      authStore.clearAccessToken?.();
      authStore.setUser?.(null);
    }
    console.log("✅ Đã đăng xuất");

    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLoggedIn = checkLoggedIn();
  const user = authStore.user;

  return (
    <header
      className={`relative z-[10000] bg-white/80 backdrop-blur-md shadow-sm h-18 flex items-center justify-between px-8 border-b border-gray-200 transition-all duration-300 ${
        isModalOpen ? "brightness-100" : ""
      }`}
    >
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
      </h1>

      <div className="flex items-center gap-6">
        {/* 🔔 Thông báo */}
        <button className="relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-300 hover:shadow-md transform hover:scale-110">
          <span className="material-symbols-outlined text-[#2F4454]">
            notifications
          </span>
          <span className="absolute top-1 right-1 w-5 h-5 bg-[#DA7B93] rounded-full text-white text-xs flex items-center justify-center animate-pulse shadow-lg">
            3
          </span>
        </button>

        {/* 🔥 Điểm */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#DA7B93]/10 to-[#2F4454]/10 px-4 py-2 rounded-full shadow-sm border border-[#DA7B93]/20">
          <span className="material-symbols-outlined text-[#DA7B93] animate-pulse">
            local_fire_department
          </span>
          <span className="font-bold text-[#2F4454]">
            {user?.streakDays || 0}
          </span>
        </div>

        {/* 👤 User */}
        {isLoggedIn ? (
          <div className="relative group">
            <button className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-bold flex items-center justify-center hover:from-[#DA7B93] hover:to-[#2F4454] transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110">
              {getInitials(user?.fullName)}
            </button>

            {/* Menu tài khoản */}
            <div
              className="absolute right-0 mt-3 w-48
                         bg-white text-gray-800 rounded-xl shadow-2xl border border-[#DA7B93]/20
                         opacity-0 invisible group-hover:opacity-100 group-hover:visible
                         transition-all duration-300 z-[10001]"
            >
              <div className="p-2 border-b border-gray-100">
                <div className="px-3 py-2">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2F4454]/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#2F4454]">
                    person
                  </span>
                  Hồ sơ
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2F4454]/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#2F4454]">
                    settings
                  </span>
                  Cài đặt
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[#DA7B93] hover:bg-[#DA7B93]/10 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    logout
                  </span>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onOpenLogin}
              className="group relative px-6 py-2 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <span className="relative z-10">Đăng nhập</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DA7B93] to-[#2F4454] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
