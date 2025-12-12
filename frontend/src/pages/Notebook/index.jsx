import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ THÊM
import Header from "../../layouts/Header";
import Sidebar from "../../layouts/Sidebar";
import NBCard from "../../components/Notebooks/NBCard";
import LoginModal from "../../components/Login";
import useNotebookStore from "../../store/useNotebookStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useAuthStore } from "../../store/useAuthStore";
import NotebookCreateModal from "../../components/Notebooks/NBCreate";

// Add keyframes animation styles
const styles = `
  @keyframes checkSlide {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-check-slide {
    animation: checkSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

const Notebook = () => {
  const navigate = useNavigate(); // ✅ THÊM
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortBy, setSortBy] = useState("recent"); // sort option

  const { notebooks, loading, error, fetchNotebooks } = useNotebookStore();

  const axiosPrivateHook = useAxiosPrivate();
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    loadNotebooks();
  }, []);

  // ✅ SỬA: Thêm navigate vào
  const handleViewNotebook = (notebook) => {
    navigate(`/notebooks/${notebook.id}`);
  };

  const loadNotebooks = async () => {
    try {
      if (isAuthenticated) {
        await fetchNotebooks(axiosPrivateHook);
      }
    } catch (err) {
      console.error("Error loading notebooks:", err);
    }
  };

  const handleShowLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    loadNotebooks();
  };

  const handleSwitchToRegister = () => {
    console.log("Switch to register modal");
  };

  // Handle create notebook button click - mở luôn modal tạo notebook
  const handleCreateNotebookClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowCreateModal(true); // Mở luôn modal tạo notebook
    }
  };

  // Handle notebook creation success
  const handleCreateSuccess = () => {
    // Sau khi tạo notebook thành công
    setShowCreateModal(false); // Đóng modal tạo
    loadNotebooks(); // Tải lại danh sách notebooks
  };

  // Handle close create modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false); // Đóng modal tạo
  };

  // Sort notebooks based on selection
  const getSortedNotebooks = () => {
    let sorted = [...notebooks];

    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "recent":
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return sorted;
  };

  const sortedNotebooks = getSortedNotebooks();

  return (
    <div id="webcrumbs">
      {/* Inject styles */}
      <style>{styles}</style>

      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onOpenLogin={handleShowLoginModal}
            isModalOpen={showLoginModal}
          />
          <div className="flex-1 overflow-y-auto py-8 px-20">
            <main className="bg-white rounded-3xl w-full p-16 border border-gray-200">
              {/* Header Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent mb-2">
                      Notebooks
                    </h1>
                    <p className="text-gray-600">
                      Quản lý và tổ chức các từ vựng Kanji của bạn
                    </p>
                  </div>
                  <button
                    onClick={handleCreateNotebookClick}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Tạo Notebook
                  </button>
                </div>

                {/* Filter/Sort Section */}
                <div className="flex items-center justify-between mb-6">
                  {/* View Mode Toggle - Google Style */}
                  <div className="relative inline-flex bg-gradient-to-r from-slate-100 to-rose-50 rounded-2xl p-2 shadow-sm border border-gray-200">
                    {/* Grid View Button */}
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`relative flex items-center justify-center w-20 h-14 rounded-xl transition-all duration-300 ease-out focus:outline-none ${
                        viewMode === "grid"
                          ? "bg-gradient-to-r from-slate-500 to-rose-400 shadow-lg"
                          : "hover:bg-white/90 hover:shadow-md"
                      }`}
                      title="Xem lưới"
                    >
                      {viewMode === "grid" && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-slate-600 to-rose-500 rounded-full flex items-center justify-center text-white text-xs shadow-md animate-check-slide">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                      )}
                      <span
                        className={`material-symbols-outlined text-2xl transition-all duration-300 ${
                          viewMode === "grid"
                            ? "text-white scale-110"
                            : "text-slate-600"
                        }`}
                      >
                        grid_view
                      </span>
                    </button>

                    {/* Divider */}
                    <div className="w-px bg-gray-300/50 mx-2 self-stretch my-2"></div>

                    {/* List View Button */}
                    <button
                      onClick={() => setViewMode("list")}
                      className={`relative flex items-center justify-center w-20 h-14 rounded-xl transition-all duration-300 ease-out focus:outline-none ${
                        viewMode === "list"
                          ? "bg-gradient-to-r from-slate-500 to-rose-400 shadow-lg"
                          : "hover:bg-white/90 hover:shadow-md"
                      }`}
                      title="Xem danh sách"
                    >
                      {viewMode === "list" && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-slate-600 to-rose-500 rounded-full flex items-center justify-center text-white text-xs shadow-md animate-check-slide">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                      )}
                      <span
                        className={`material-symbols-outlined text-2xl transition-all duration-300 ${
                          viewMode === "list"
                            ? "text-white scale-110"
                            : "text-slate-600"
                        }`}
                      >
                        view_list
                      </span>
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="recent">Gần đây nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                  </select>
                </div>
              </div>

              {/* Content Section */}
              {!isAuthenticated ? (
                <div className="flex items-center justify-center py-20">
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-500/10 to-rose-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-5xl text-slate-500">
                        lock
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Đăng nhập để tiếp tục
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Vui lòng đăng nhập để xem và quản lý notebooks của bạn
                    </p>
                    <button
                      onClick={handleShowLoginModal}
                      className="w-full px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-rose-400 animate-spin inline-block">
                      hourglass_empty
                    </span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">
                      Đang tải notebooks...
                    </h2>
                    <p className="text-gray-600 mt-2">Vui lòng chờ</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-20">
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
                    <span className="material-symbols-outlined text-6xl text-red-400 inline-block mb-4">
                      error
                    </span>
                    <h3 className="text-2xl font-bold text-red-600 mb-3">
                      Có lỗi xảy ra
                    </h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                      onClick={loadNotebooks}
                      className="w-full px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : sortedNotebooks.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-500/10 to-rose-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-5xl text-slate-500">
                        note_add
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Không có Notebook
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Bạn chưa tạo notebook nào. Hãy tạo một notebook mới để bắt
                      đầu!
                    </p>
                    <button
                      onClick={handleCreateNotebookClick}
                      className="w-full px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Tạo Notebook Mới
                    </button>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedNotebooks.map((notebook) => (
                    <NBCard
                      key={notebook.id}
                      notebook={notebook}
                      onRefresh={loadNotebooks}
                      isListView={false}
                      onViewDetails={() => handleViewNotebook(notebook)} // ✅ THÊM
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-100 rounded-lg font-semibold text-gray-700 text-sm">
                    <div className="col-span-4">Tiêu đề</div>
                    <div className="col-span-2">Từ vựng</div>
                    <div className="col-span-3">Tạo ngày</div>
                    <div className="col-span-3">Tác giả</div>
                  </div>

                  {/* Table Rows */}
                  {sortedNotebooks.map((notebook) => (
                    <div
                      key={notebook.id}
                      onClick={() => handleViewNotebook(notebook)}
                      className="grid grid-cols-12 gap-4 px-6 py-4 bg-white rounded-lg border border-gray-200 transition-all items-center cursor-pointer hover:shadow-lg hover:border-blue-300"
                    >
                      {/* Title */}
                      <div className="col-span-4 flex items-center gap-3">
                        <span className="text-rose-400 text-2xl">📖</span>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {notebook.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notebook.description || "Không có mô tả"}
                          </p>
                        </div>
                      </div>

                      {/* Total Entries Count */}
                      <div className="col-span-2 text-gray-700">
                        <span className="text-sm font-medium">
                          {notebook.totalEntries || 0} từ
                        </span>
                      </div>

                      {/* Created Date */}
                      <div className="col-span-3 text-gray-700">
                        <span className="text-sm">
                          {new Date(notebook.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex items-center justify-between">
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          Owner
                        </span>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-500 hover:text-gray-700 transition-all"
                          title="Thêm tùy chọn"
                        >
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <NotebookCreateModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default Notebook;