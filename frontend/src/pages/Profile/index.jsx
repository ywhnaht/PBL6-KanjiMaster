import React, { useState, useEffect } from "react";
import Header from "../../layouts/Header";
import Sidebar from "../../layouts/Sidebar";
import useProfileStore from "../../store/useProfileStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useAuthStore } from "../../store/useAuthStore";
import useDarkModeStore from "../../store/useDarkModeStore";
import LoginModal from "../../components/Login";

// Import avatar images from local assets
import avatar107 from "../../assets/islands/107.c3e123902d831a9.jpg";
import avatar108 from "../../assets/islands/108.3b3090077134db3.jpg";
import avatar109 from "../../assets/islands/109.5b75ca8158c771c.jpg";
import avatar110 from "../../assets/islands/110.36d90f6882d4593.jpg";
import avatar111 from "../../assets/islands/111.f9dd73353feb908.jpg";
import avatar112 from "../../assets/islands/112.c90135dfc341a90.jpg";
import avatar114 from "../../assets/islands/114.0adc064c9a6d1eb.jpg";
import avatar115 from "../../assets/islands/115.70946d9217589e8.jpg";
import avatar116 from "../../assets/islands/116.9aaedd4f4495837.jpg";
import avatar117 from "../../assets/islands/117.3cd40b021ac604f.jpg";
import avatar118 from "../../assets/islands/118.17bed2945aa1600.jpg";
import avatar119 from "../../assets/islands/119.ed0b39ac3915639.jpg";
import avatar120 from "../../assets/islands/120.bd14e2049ea1628.jpg";
import avatar121 from "../../assets/islands/121.86d7c15a5a6be0f.jpg";
import avatar122 from "../../assets/islands/122.c263b6b48ca2b1a.jpg";

const avatarOptions = [
  avatar107,
  avatar108,
  avatar109,
  avatar110,
  avatar111,
  avatar112,
  avatar114,
  avatar115,
  avatar116,
  avatar117,
  avatar118,
  avatar119,
  avatar120,
  avatar121,
  avatar122,
];

// Notification Modal Component
const NotificationModal = ({ type, title, message, onClose }) => {
  const isDark = useDarkModeStore((state) => state.isDark);

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return isDark
          ? "bg-green-900/30 border-green-700"
          : "bg-green-50 border-green-200";
      case "error":
        return isDark
          ? "bg-red-900/30 border-red-700"
          : "bg-red-50 border-red-200";
      case "info":
        return isDark
          ? "bg-blue-900/30 border-blue-700"
          : "bg-blue-50 border-blue-200";
      default:
        return isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-gray-50 border-gray-200";
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case "success":
        return isDark ? "text-green-400" : "text-green-800";
      case "error":
        return isDark ? "text-red-400" : "text-red-800";
      case "info":
        return isDark ? "text-blue-400" : "text-blue-800";
      default:
        return isDark ? "text-slate-100" : "text-gray-800";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return isDark ? "text-green-300" : "text-green-700";
      case "error":
        return isDark ? "text-red-300" : "text-red-700";
      case "info":
        return isDark ? "text-blue-300" : "text-blue-700";
      default:
        return isDark ? "text-slate-200" : "text-gray-700";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[99999] animate-in fade-in slide-in-from-right-4 duration-300">
      <div
        className={`${getBgColor()} border rounded-xl p-4 shadow-lg max-w-sm transition-colors duration-300`}
      >
        <div className="flex gap-3">
          <span className="text-2xl flex-shrink-0">{getIcon()}</span>
          <div className="flex-1">
            <h3 className={`${getTitleColor()} font-bold mb-1`}>{title}</h3>
            <p className={`${getTextColor()} text-sm`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 transition-colors duration-300 ${
              isDark
                ? "text-slate-500 hover:text-slate-300"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = React.useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const axiosPrivateHook = useAxiosPrivate();
  const { user, accessToken } = useAuthStore();
  const isDark = useDarkModeStore((state) => state.isDark);
  const isAuthenticated = !!user && !!accessToken;

  const {
    profile,
    stats,
    loading,
    avatarUploading,
    fetchProfile,
    fetchStats,
    updateProfile,
    changePassword,
    uploadAvatar,
  } = useProfileStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      loadStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      await fetchProfile(axiosPrivateHook);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadStats = async () => {
    try {
      await fetchStats(axiosPrivateHook);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
  };

  const handleShowLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    loadProfile();
    loadStats();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(axiosPrivateHook, formData.fullName, formData.bio);
      setEditMode(false);
      showNotification(
        "success",
        "Cập nhật thành công",
        "Hồ sơ của bạn đã được cập nhật"
      );
    } catch (err) {
      showNotification("error", "Cập nhật thất bại", err.message);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("error", "Lỗi", "Mật khẩu mới không khớp!");
      return;
    }
    try {
      await changePassword(
        axiosPrivateHook,
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
      showNotification(
        "success",
        "Đổi mật khẩu thành công",
        "Mật khẩu của bạn đã được cập nhật"
      );
    } catch (err) {
      showNotification("error", "Đổi mật khẩu thất bại", err.message);
    }
  };

  const handleAvatarSelect = async (avatarUrl) => {
    try {
      const file = await fetch(avatarUrl).then((res) => res.blob());
      await uploadAvatar(axiosPrivateHook, file);
      setShowAvatarModal(false);
      setShowFileUpload(false);
      showNotification(
        "success",
        "Cập nhật avatar thành công",
        "Ảnh đại diện của bạn đã được thay đổi"
      );
    } catch (err) {
      console.error("Avatar upload error:", err);
      showNotification("error", "Cập nhật avatar thất bại", err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar(axiosPrivateHook, file);
      setShowAvatarModal(false);
      setShowFileUpload(false);
      showNotification(
        "success",
        "Cập nhật avatar thành công",
        "Ảnh từ máy tính của bạn đã được tải lên"
      );
    } catch (err) {
      console.error("File upload error:", err);
      showNotification("error", "Tải lên avatar thất bại", err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div id="webcrumbs">
        <div
          className={`flex h-screen transition-colors duration-300 ${
            isDark
              ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
              : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
          }`}
        >
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              onOpenLogin={handleShowLoginModal}
              isModalOpen={showLoginModal}
            />
            <div className="flex-1 overflow-y-auto py-8 px-20 flex items-center justify-center">
              <div
                className={`rounded-2xl shadow-lg p-12 text-center max-w-md transition-colors duration-300 ${
                  isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-700"
                      : "bg-gradient-to-br from-slate-500/10 to-rose-400/10"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-5xl transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    lock
                  </span>
                </div>
                <h3
                  className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                    isDark ? "text-slate-100" : "text-gray-800"
                  }`}
                >
                  Đăng nhập để tiếp tục
                </h3>
                <p
                  className={`mb-6 transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Vui lòng đăng nhập để xem hồ sơ của bạn
                </p>
                <button
                  onClick={handleShowLoginModal}
                  className="w-full px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          </div>
        </div>
        {showLoginModal && (
          <LoginModal
            onClose={handleCloseLoginModal}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div id="webcrumbs">
      <div
        className={`flex h-screen transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onOpenLogin={handleShowLoginModal}
            isModalOpen={showLoginModal}
          />
          <div className="flex-1 overflow-y-auto py-8 px-20">
            <main
              className={`rounded-3xl w-full p-16 transition-colors duration-300 ${
                isDark
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              {/* Header Section */}
              <div className="mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent mb-2">
                  Hồ sơ cá nhân
                </h1>
                <p
                  className={`transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Quản lý thông tin tài khoản của bạn
                </p>
              </div>

              {/* Tab Navigation */}
              <div
                className={`flex gap-4 mb-8 border-b transition-colors duration-300 ${
                  isDark ? "border-slate-700" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === "info"
                      ? "text-rose-400 border-b-2 border-rose-400"
                      : isDark
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === "stats"
                      ? "text-rose-400 border-b-2 border-rose-400"
                      : isDark
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Thống kê
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <span className="material-symbols-outlined text-6xl text-rose-400 animate-spin inline-block">
                    hourglass_empty
                  </span>
                </div>
              ) : (
                <>
                  {/* Info Tab */}
                  {activeTab === "info" && (
                    <div className="space-y-8">
                      <div
                        className={`border rounded-2xl p-8 transition-colors duration-300 ${
                          isDark
                            ? "bg-slate-700/50 border-slate-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <h3
                          className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                            isDark ? "text-slate-100" : "text-gray-800"
                          }`}
                        >
                          Ảnh hồ sơ
                        </h3>
                        <div className="flex items-center gap-8">
                          {/* Current Avatar Display */}
                          <div className="relative group flex-shrink-0">
                            <img
                              src={
                                profile?.avatarUrl ||
                                "https://via.placeholder.com/120"
                              }
                              alt="Avatar"
                              className="w-50 h-50 rounded-full object-cover border-4 border-rose-200 shadow-lg"
                            />
                          </div>

                          {/* Avatar Options Grid */}
                          <div className="flex-1">
                            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-2">
                              {avatarOptions.map((avatar, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleAvatarSelect(avatar)}
                                  className="group relative focus:outline-none rounded-full transition-all flex-shrink-0"
                                  title={`Avatar ${index + 1}`}
                                >
                                  <img
                                    src={avatar}
                                    alt={`Avatar ${index + 1}`}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 group-hover:border-rose-400 transition-all group-hover:scale-125 cursor-pointer shadow-md"
                                  />
                                </button>
                              ))}
                              {/* Upload Button */}
                              <button
                                onClick={() => {
                                  setShowAvatarModal(true);
                                  setShowFileUpload(true);
                                }}
                                className={`w-16 h-16 mt-4 ml-6 rounded-full border-2 border-dashed flex items-center justify-center text-xl hover:scale-125 transition-all shadow-md focus:outline-none flex-shrink-0 ${
                                  isDark
                                    ? "bg-slate-600 border-slate-500 hover:border-rose-400 hover:bg-slate-500"
                                    : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 hover:border-rose-400 hover:from-rose-50 hover:to-rose-100"
                                }`}
                                title="Tải lên ảnh từ máy tính"
                              >
                                <span
                                  className={`transition-colors duration-300 ${
                                    isDark
                                      ? "text-slate-200 hover:text-rose-400"
                                      : "text-gray-600 hover:text-rose-400"
                                  }`}
                                >
                                  +
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Info Section */}
                      <div
                        className={`border rounded-2xl p-8 transition-colors duration-300 ${
                          isDark
                            ? "bg-slate-700/50 border-slate-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3
                            className={`text-xl font-bold transition-colors duration-300 ${
                              isDark ? "text-slate-100" : "text-gray-800"
                            }`}
                          >
                            Thông tin cá nhân
                          </h3>
                          <button
                            onClick={() => setEditMode(!editMode)}
                            className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
                              isDark
                                ? "text-rose-400 hover:bg-slate-600"
                                : "text-rose-400 hover:bg-rose-50"
                            }`}
                          >
                            {editMode ? "Hủy" : "Sửa"}
                          </button>
                        </div>

                        <div className="space-y-6">
                          {/* Full Name */}
                          <div
                            className={`pb-6 border-b transition-colors duration-300 ${
                              isDark ? "border-slate-600" : "border-gray-200"
                            } last:border-b-0`}
                          >
                            <label
                              className={`block font-semibold mb-2 transition-colors duration-300 ${
                                isDark ? "text-slate-200" : "text-gray-700"
                              }`}
                            >
                              Tên người dùng
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors duration-300 ${
                                  isDark
                                    ? "bg-slate-600 border-slate-500 text-slate-100"
                                    : "border-gray-300 bg-white text-gray-900"
                                }`}
                                placeholder="Nhập tên của bạn"
                              />
                            ) : (
                              <p
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                {profile?.fullName || "Chưa cập nhật"}
                              </p>
                            )}
                          </div>

                          {/* Email */}
                          <div
                            className={`pb-6 border-b transition-colors duration-300 ${
                              isDark ? "border-slate-600" : "border-gray-200"
                            } last:border-b-0`}
                          >
                            <label
                              className={`block font-semibold mb-2 transition-colors duration-300 ${
                                isDark ? "text-slate-200" : "text-gray-700"
                              }`}
                            >
                              Email
                            </label>
                            <p
                              className={`transition-colors duration-300 ${
                                isDark ? "text-slate-300" : "text-gray-600"
                              }`}
                            >
                              {profile?.email}
                            </p>
                          </div>

                          {/* Bio */}
                          <div
                            className={`pb-6 border-b transition-colors duration-300 ${
                              isDark ? "border-slate-600" : "border-gray-200"
                            } last:border-b-0`}
                          >
                            <label
                              className={`block font-semibold mb-2 transition-colors duration-300 ${
                                isDark ? "text-slate-200" : "text-gray-700"
                              }`}
                            >
                              Tiểu sử
                            </label>
                            {editMode ? (
                              <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none transition-colors duration-300 ${
                                  isDark
                                    ? "bg-slate-600 border-slate-500 text-slate-100"
                                    : "border-gray-300 bg-white text-gray-900"
                                }`}
                                rows="4"
                                placeholder="Viết gì đó về bạn..."
                              />
                            ) : (
                              <p
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                {profile?.bio || "Chưa cập nhật"}
                              </p>
                            )}
                          </div>
                        </div>

                        {editMode && (
                          <button
                            onClick={handleUpdateProfile}
                            className="mt-6 px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                          >
                            Lưu thay đổi
                          </button>
                        )}
                      </div>

                      {/* Privacy & Notifications Section */}
                      <div
                        className={`border rounded-2xl p-8 space-y-6 transition-colors duration-300 ${
                          isDark
                            ? "bg-slate-700/50 border-slate-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <h3
                          className={`text-xl font-bold transition-colors duration-300 ${
                            isDark ? "text-slate-100" : "text-gray-800"
                          }`}
                        >
                          Quyền riêng tư & Thông báo
                        </h3>

                        {/* Dark Mode Toggle */}
                        <div
                          className={`flex items-center justify-between pb-6 border-b transition-colors duration-300 ${
                            isDark ? "border-slate-600" : "border-gray-200"
                          }`}
                        >
                          <div>
                            <h3
                              className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                                isDark ? "text-slate-100" : "text-gray-800"
                              }`}
                            >
                              Chế độ sáng tối
                            </h3>
                            <p
                              className={`text-sm transition-colors duration-300 ${
                                isDark ? "text-slate-400" : "text-gray-600"
                              }`}
                            >
                              Chuyển đổi giữa chế độ sáng và tối
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              useDarkModeStore.setState({ isDark: !isDark })
                            }
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
                              isDark
                                ? "bg-slate-600 border-yellow-400 text-yellow-400 hover:bg-slate-500 hover:shadow-lg"
                                : "bg-gray-100 border-gray-400 text-gray-600 hover:bg-gray-200 hover:shadow-lg"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {isDark ? "light_mode" : "dark_mode"}
                            </span>
                            <span className="text-sm font-semibold">
                              {isDark ? "Sáng" : "Tối"}
                            </span>
                          </button>
                        </div>

                        {/* Password */}
                        <div
                          className={`flex items-center justify-between pb-6 border-b transition-colors duration-300 ${
                            isDark ? "border-slate-600" : "border-gray-200"
                          }`}
                        >
                          <div>
                            <h3
                              className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                                isDark ? "text-slate-100" : "text-gray-800"
                              }`}
                            >
                              Mật khẩu
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                Mật khẩu hiện tại:
                              </span>
                              <span
                                className={`text-lg tracking-widest transition-colors duration-300 ${
                                  isDark ? "text-slate-400" : "text-gray-400"
                                }`}
                              >
                                ・・・・・・・
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex-shrink-0 h-fit text-sm"
                          >
                            Đổi mật khẩu
                          </button>
                        </div>

                        {/* Learning Streak & Badges */}
                        <div
                          className={`flex items-center justify-between pb-6 border-b transition-colors duration-300 ${
                            isDark ? "border-slate-600" : "border-gray-200"
                          }`}
                        >
                          <div>
                            <h3
                              className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                                isDark ? "text-slate-100" : "text-gray-800"
                              }`}
                            >
                              Chuỗi phiên học và huy hiệu
                            </h3>
                            <p
                              className={`text-sm transition-colors duration-300 ${
                                isDark ? "text-slate-400" : "text-gray-600"
                              }`}
                            >
                              Thông tin về chuỗi học tập và những huy hiệu bạn
                              đã đạt được
                            </p>
                          </div>
                          <button
                            className={`px-4 py-2 rounded-full bg-gradient-to-r from-slate-500 to-rose-400 text-white transition-all flex items-center gap-2 flex-shrink-0 hover:shadow-lg`}
                          >
                            <span className="material-symbols-outlined text-xl">
                              mail
                            </span>
                          </button>
                        </div>

                        {/* Learning Reminders */}
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <h3
                              className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                                isDark ? "text-slate-100" : "text-gray-800"
                              }`}
                            >
                              Lời nhắc học
                            </h3>
                            <p
                              className={`text-sm transition-colors duration-300 ${
                                isDark ? "text-slate-400" : "text-gray-600"
                              }`}
                            >
                              Nhận thông báo khi bạn quên ôn tập
                            </p>
                          </div>
                          <button
                            className={`px-4 py-2 rounded-full bg-gradient-to-r from-slate-500 to-rose-400 text-white transition-all flex items-center gap-2 flex-shrink-0 hover:shadow-lg`}
                          >
                            <span className="material-symbols-outlined text-xl">
                              notifications
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === "stats" && (
                    <div className="space-y-8">
                      {/* Learning Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                          className={`rounded-2xl p-6 border transition-colors duration-300 ${
                            isDark
                              ? "bg-blue-900/30 border-blue-700"
                              : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`font-semibold mb-1 transition-colors duration-300 ${
                                  isDark ? "text-blue-300" : "text-blue-600"
                                }`}
                              >
                                Kanji đã học trong hôm nay
                              </p>
                              <p
                                className={`text-3xl font-bold transition-colors duration-300 ${
                                  isDark ? "text-blue-200" : "text-blue-800"
                                }`}
                              >
                                {stats?.totalKanjiLearned || 0}
                              </p>
                            </div>
                            <span className="text-5xl">📚</span>
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl p-6 border transition-colors duration-300 ${
                            isDark
                              ? "bg-green-900/30 border-green-700"
                              : "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`font-semibold mb-1 transition-colors duration-300 ${
                                  isDark ? "text-green-300" : "text-green-600"
                                }`}
                              >
                                Ngày học liên tiếp
                              </p>
                              <p
                                className={`text-3xl font-bold transition-colors duration-300 ${
                                  isDark ? "text-green-200" : "text-green-800"
                                }`}
                              >
                                {stats?.streakDays || 0}
                              </p>
                            </div>
                            <span className="text-5xl">🔥</span>
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl p-6 border transition-colors duration-300 ${
                            isDark
                              ? "bg-orange-900/30 border-orange-700"
                              : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`font-semibold mb-1 transition-colors duration-300 ${
                                  isDark ? "text-orange-300" : "text-orange-600"
                                }`}
                              >
                                Bài quiz làm
                              </p>
                              <p
                                className={`text-3xl font-bold transition-colors duration-300 ${
                                  isDark ? "text-orange-200" : "text-orange-800"
                                }`}
                              >
                                {stats?.totalQuizzesTaken || 0}
                              </p>
                            </div>
                            <span className="text-5xl">📝</span>
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl p-6 border transition-colors duration-300 ${
                            isDark
                              ? "bg-purple-900/30 border-purple-700"
                              : "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`font-semibold mb-1 transition-colors duration-300 ${
                                  isDark ? "text-purple-300" : "text-purple-600"
                                }`}
                              >
                                Tỉ lệ thắng trận
                              </p>
                              <p
                                className={`text-3xl font-bold transition-colors duration-300 ${
                                  isDark ? "text-purple-200" : "text-purple-800"
                                }`}
                              >
                                {stats?.winRate || 0}%
                              </p>
                            </div>
                            <span className="text-5xl">🏆</span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Stats */}
                      <div
                        className={`border rounded-2xl p-8 transition-colors duration-300 ${
                          isDark
                            ? "bg-slate-700/50 border-slate-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <h3
                          className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                            isDark ? "text-slate-100" : "text-gray-800"
                          }`}
                        >
                          Thống kê chi tiết
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Quiz Stats */}
                          <div className="space-y-4">
                            <h4
                              className={`font-semibold border-b pb-3 transition-colors duration-300 ${
                                isDark
                                  ? "text-slate-100 border-slate-600"
                                  : "text-gray-700 border-gray-200"
                              }`}
                            >
                              Thống kê Quiz
                            </h4>
                            <div className="flex justify-between">
                              <span
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                Điểm trung bình:
                              </span>
                              <span
                                className={`font-semibold transition-colors duration-300 ${
                                  isDark ? "text-slate-100" : "text-gray-800"
                                }`}
                              >
                                {(stats?.averageQuizScore || 0).toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                Điểm cao nhất:
                              </span>
                              <span className="font-semibold text-green-600">
                                {stats?.highestQuizScore || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                Điểm thấp nhất:
                              </span>
                              <span className="font-semibold text-red-600">
                                {stats?.lowestQuizScore || 0}
                              </span>
                            </div>
                          </div>

                          {/* Battle Stats */}
                          <div className="space-y-4">
                            <h4
                              className={`font-semibold border-b pb-3 transition-colors duration-300 ${
                                isDark
                                  ? "text-slate-100 border-slate-600"
                                  : "text-gray-700 border-gray-200"
                              }`}
                            >
                              Thống kê Trận đấu
                            </h4>
                            <div className="flex justify-between">
                              <span
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                Tổng trận:
                              </span>
                              <span
                                className={`font-semibold transition-colors duration-300 ${
                                  isDark ? "text-slate-100" : "text-gray-800"
                                }`}
                              >
                                {stats?.totalBattlesPlayed || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                Trận thắng:
                              </span>
                              <span className="font-semibold text-green-600">
                                {stats?.battlesWon || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`transition-colors duration-300 ${
                                  isDark ? "text-slate-300" : "text-gray-600"
                                }`}
                              >
                                Trận thua:
                              </span>
                              <span className="font-semibold text-red-600">
                                {stats?.battlesLost || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress by Level */}
                      <div
                        className={`border rounded-2xl p-8 transition-colors duration-300 ${
                          isDark
                            ? "bg-slate-700/50 border-slate-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <h3
                          className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                            isDark ? "text-slate-100" : "text-gray-800"
                          }`}
                        >
                          Tiến độ theo cấp độ
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(
                            stats?.progressPercentByLevel || {}
                          ).map(([level, percent]) => (
                            <div key={level}>
                              <div className="flex justify-between mb-2">
                                <span
                                  className={`font-semibold transition-colors duration-300 ${
                                    isDark ? "text-slate-100" : "text-gray-700"
                                  }`}
                                >
                                  Level {level}
                                </span>
                                <span
                                  className={`transition-colors duration-300 ${
                                    isDark ? "text-slate-300" : "text-gray-600"
                                  }`}
                                >
                                  {stats?.kanjiLearnedByLevel?.[level] || 0}/
                                  {stats?.totalKanjiByLevel?.[level] || 0}
                                </span>
                              </div>
                              <div
                                className={`w-full rounded-full h-3 overflow-hidden transition-colors duration-300 ${
                                  isDark ? "bg-slate-600" : "bg-gray-200"
                                }`}
                              >
                                <div
                                  className="bg-gradient-to-r from-slate-500 to-rose-400 h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${percent.toFixed(1)}%`,
                                  }}
                                ></div>
                              </div>
                              <p
                                className={`text-xs mt-1 transition-colors duration-300 ${
                                  isDark ? "text-slate-400" : "text-gray-500"
                                }`}
                              >
                                {percent.toFixed(1)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-[99999] p-4 transition-colors duration-300 ${
            isDark ? "bg-black/50" : "bg-black/50"
          }`}
        >
          <div
            className={`rounded-2xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative transition-colors duration-300 ${
              isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
            }`}
          >
            {/* Loading Overlay */}
            {avatarUploading && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 rounded-2xl backdrop-blur-sm transition-colors duration-300 ${
                  isDark ? "bg-slate-800/85" : "bg-white/85"
                }`}
              >
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <span className="material-symbols-outlined text-6xl text-rose-400 animate-spin inline-block">
                      hourglass_empty
                    </span>
                  </div>
                  <p
                    className={`font-semibold transition-colors duration-300 ${
                      isDark ? "text-slate-200" : "text-gray-600"
                    }`}
                  >
                    Đang tải lên ảnh...
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <h2
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? "text-slate-100" : "text-gray-800"
                }`}
              >
                Chọn ảnh đại diện
              </h2>
              <button
                onClick={() => {
                  if (!avatarUploading) {
                    setShowAvatarModal(false);
                    setShowFileUpload(false);
                  }
                }}
                disabled={avatarUploading}
                className={`text-3xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

            {!showFileUpload ? (
              <>
                {/* Avatar Grid */}
                <div className="grid grid-cols-5 md:grid-cols-6 gap-4 mb-6">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(avatar)}
                      disabled={avatarUploading}
                      className="group relative focus:outline-none rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="w-24 h-24 rounded-full object-cover border-3 border-gray-300 group-hover:border-rose-400 transition-all group-hover:scale-110 cursor-pointer shadow-md"
                      />
                    </button>
                  ))}
                  {/* Upload Button */}
                  <button
                    onClick={() => setShowFileUpload(true)}
                    disabled={avatarUploading}
                    className={`w-24 h-24 rounded-full border-3 border-dashed flex items-center justify-center text-4xl hover:scale-110 transition-all shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "bg-slate-700 border-slate-600 hover:border-rose-400 hover:bg-slate-600"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 hover:border-rose-400 hover:from-rose-50 hover:to-rose-100"
                    }`}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        isDark
                          ? "text-slate-300 group-hover:text-rose-400"
                          : "text-gray-500 group-hover:text-rose-400"
                      }`}
                    >
                      +
                    </span>
                  </button>
                </div>

                <p
                  className={`text-sm text-center font-medium transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-gray-600"
                  }`}
                >
                  Bấm vào ảnh để chọn hoặc bấm dấu{" "}
                  <span className="font-bold">+</span> để tải lên ảnh từ máy
                  tính
                </p>
              </>
            ) : (
              <>
                {/* File Upload Section */}
                <div
                  className={`rounded-xl p-12 border-3 border-dashed mb-6 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600"
                      : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className={`w-full py-8 flex flex-col items-center justify-center rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark ? "hover:bg-slate-600" : "hover:bg-slate-200/50"
                    }`}
                  >
                    <span className="text-6xl mb-4">📁</span>
                    <p
                      className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                        isDark ? "text-slate-100" : "text-gray-800"
                      }`}
                    >
                      Bấm để chọn ảnh từ máy tính
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        isDark ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Hỗ trợ định dạng: JPG, PNG, GIF, WebP
                    </p>
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFileUpload(false)}
                    disabled={avatarUploading}
                    className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    Quay lại
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-[99999] p-4 transition-colors duration-300 ${
            isDark ? "bg-black/50" : "bg-black/50"
          }`}
        >
          <div
            className={`rounded-2xl p-8 max-w-md w-full shadow-2xl transition-colors duration-300 ${
              isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? "text-slate-100" : "text-gray-800"
                }`}
              >
                Đổi mật khẩu
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`text-3xl font-bold transition-colors duration-300 ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`block font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? "text-slate-200" : "text-gray-700"
                  }`}
                >
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label
                  className={`block font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? "text-slate-200" : "text-gray-700"
                  }`}
                >
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label
                  className={`block font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? "text-slate-200" : "text-gray-700"
                  }`}
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className={`flex-1 px-4 py-2 font-semibold rounded-lg transition-all border ${
                    isDark
                      ? "bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default Profile;
