import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import useNotificationStore from "../../store/useNotificationStore";
import NotificationDropdown from "../../components/NotificationDropdown";
import NotificationToast from "../../components/NotificationToast";
import useNotificationWebSocket from "../../hooks/useNotificationWebSocket";
import useProfileStore from "../../store/useProfileStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useDarkModeStore from "../../store/useDarkModeStore";

export default function Header({ onOpenLogin, isModalOpen }) {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const { newNotification, clearNewNotification } = useNotificationStore();

  useNotificationWebSocket();
  const axiosPrivateHook = useAxiosPrivate();
  const { profile, fetchProfile } = useProfileStore();
  const isDark = useDarkModeStore((state) => state.isDark);
  const toggleDarkMode = useDarkModeStore((state) => state.toggleDarkMode);

  // ✅ State để quản lý menu dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  React.useEffect(() => {
    const { accessToken, user } = authStore;
    if (accessToken && user) {
      fetchProfile(axiosPrivateHook);
    }
  }, [authStore.accessToken, authStore.user]);

  // ✅ Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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

  const isLoggedIn = checkLoggedIn();
  const user = authStore.user;

  return (
    <>
      <header
        className={`relative z-[10000] transition-all duration-300 h-18 flex items-center justify-between px-8 border-b ${
          isDark
            ? "bg-slate-800 border-slate-700 backdrop-blur-md shadow-sm"
            : "bg-white/80 border-gray-200 backdrop-blur-md shadow-sm"
        } ${isModalOpen ? "brightness-100" : ""}`}
      >
        {/* Logo */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* 🔔 Notification Bell */}
          {isLoggedIn && <NotificationDropdown />}

          {/* 🔥 Streak Counter */}
          {isLoggedIn && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border transition-all duration-300 ml-[-15px] ${
                isDark
                  ? "bg-[#DA7B93]/10 border-[#DA7B93]/30"
                  : "bg-gradient-to-r from-[#DA7B93]/10 to-[#2F4454]/10 border-[#DA7B93]/20"
              }`}
            >
              <span
                className={`material-symbols-outlined animate-pulse ${
                  isDark ? "text-[#f97316]" : "text-[#DA7B93]"
                }`}
              >
                local_fire_department
              </span>
              <span
                className={`font-bold ${
                  isDark ? "text-slate-200" : "text-[#2F4454]"
                }`}
              >
                {user?.streakDays || 0}
              </span>
            </div>
          )}

          {/* 🌓 Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            type="button"
            className={`w-12 h-12 flex items-center justify-center rounded-full
              appearance-none outline-none
              border-2 shadow-sm transition-all duration-300 mr-[-10px]
              ${
                isDark
                  ? "bg-[#DA7B93]/10 border-yellow-400 text-yellow-400 hover:bg-[#DA7B93]/20"
                  : "bg-gradient-to-r from-[#DA7B93]/10 to-[#2F4454]/10 border-gray-400 text-gray-600 hover:bg-[#DA7B93]/20"
              }`}
          >
            <span className="material-symbols-outlined">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* 👤 User Profile */}
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-22 h-18 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#DA7B93] focus:ring-offset-2"
              >
                <img
                  src={profile?.avatarUrl || "https://via.placeholder.com/48"}
                  alt={user?.fullName}
                  className={`w-full h-full object-cover rounded-full border-2 transition-all ${
                    isDark ? "border-slate-600" : "border-[#efbac7]"
                  }`}
                />
              </button>

              {/* Menu tài khoản */}
              <div
                className={`absolute right-0 mt-3 w-48 rounded-xl shadow-2xl border transition-all duration-300 z-[10001] origin-top-right ${
                  isMenuOpen
                    ? "opacity-100 visible scale-100"
                    : "opacity-0 invisible scale-95"
                } ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-[#DA7B93]/20"
                }`}
              >
                <div
                  className={`p-2 border-b ${
                    isDark ? "border-slate-700" : "border-gray-100"
                  }`}
                >
                  <div className="px-3 py-2">
                    <p
                      className={`font-semibold text-sm truncate ${
                        isDark ? "text-slate-100" : "text-gray-800"
                      }`}
                    >
                      {user?.fullName}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-all ${
                      isDark
                        ? "text-slate-200 hover:bg-slate-700"
                        : "text-gray-700 hover:bg-[#2F4454]/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-[#2F4454]">
                      person
                    </span>
                    Hồ sơ
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-all ${
                      isDark
                        ? "text-slate-200 hover:bg-slate-700"
                        : "text-gray-700 hover:bg-[#2F4454]/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm text-[#2F4454]">
                      settings
                    </span>
                    Cài đặt
                  </button>
                  <div
                    className={`border-t my-1 ${
                      isDark ? "border-slate-700" : "border-gray-200"
                    }`}
                  ></div>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-all ${
                      isDark
                        ? "text-[#f97316] hover:bg-[#f97316]/10"
                        : "text-[#DA7B93] hover:bg-[#DA7B93]/10"
                    }`}
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
            <button
              onClick={onOpenLogin}
              className="group relative px-6 py-2 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <span className="relative z-10">Đăng nhập</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DA7B93] to-[#2F4454] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </button>
          )}
        </div>
      </header>

      {isLoggedIn && (
        <NotificationToast
          notification={newNotification}
          onClose={clearNewNotification}
        />
      )}
    </>
  );
}