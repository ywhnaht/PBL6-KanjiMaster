// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback, useMemo } from "react";
import useNotebookStore from "../../store/useNotebookStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useDarkModeStore from "../../store/useDarkModeStore";

const NotebookSelectionModal = ({
  isOpen,
  onClose,
  onSelectNotebook,
  onCreateNotebook,
}) => {
  const notebooks = useNotebookStore(state => state.notebooks);
  const fetchNotebooks = useNotebookStore(state => state.fetchNotebooks);
  const isDark = useDarkModeStore((state) => state.isDark);
  
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);

  const loadNotebooks = useCallback(async () => {
    setLoading(true);
    try {
      await fetchNotebooks(axiosPrivate);
    } catch (err) {
      console.error("Error loading notebooks:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchNotebooks, axiosPrivate]);

  // ✅ Chỉ load khi isOpen thay đổi
  useEffect(() => {
    if (isOpen && notebooks.length === 0) {
      loadNotebooks();
    }
  }, [isOpen, notebooks.length, loadNotebooks]);

  // ✅ Memoize handlers
  const handleSelectNotebook = useCallback(
    (notebook) => {
      onSelectNotebook(notebook);
      onClose();
    },
    [onSelectNotebook, onClose]
  );

  const handleCreateNotebook = useCallback(() => {
    onCreateNotebook();
    onClose();
  }, [onCreateNotebook, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 transition-colors duration-300 ${
      isDark ? "bg-black/60" : "bg-black/50"
    }`}>
      <div className={`rounded-2xl shadow-2xl max-w-4xl w-full p-8 animate-scale-in max-h-[80vh] overflow-y-auto transition-colors duration-300 ${
        isDark
          ? "bg-slate-800 border border-slate-700"
          : "bg-white"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">
              Chọn Notebook
            </h3>
            <p className={`text-sm mt-2 transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-gray-600"
            }`}>
              Chọn notebook để lưu từ vựng hoặc tạo một notebook mới
            </p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 outline-none border-none focus:outline-none focus:ring-0 focus:border-none active:outline-none hover:outline-none transition-colors duration-300 ${
              isDark
                ? "text-slate-400 hover:text-slate-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="Đóng"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined text-6xl text-rose-400 animate-spin inline-block">
              hourglass_empty
            </span>
          </div>
        ) : notebooks.length === 0 ? (
          <div className="text-center py-12">
            <span className={`material-symbols-outlined text-6xl inline-block mb-4 transition-colors duration-300 ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}>
              note_add
            </span>
            <p className={`mb-6 text-lg transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-gray-600"
            }`}>
              Bạn chưa có notebook nào. Hãy tạo một notebook mới!
            </p>
            <button
              onClick={handleCreateNotebook}
              className="px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl outline-none border-none focus:outline-none focus:ring-0 focus:border-none active:outline-none hover:outline-none hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Tạo Notebook Mới
            </button>
          </div>
        ) : (
          <>
            {/* Notebooks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {notebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onSelect={handleSelectNotebook}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* Divider */}
            <div className={`my-6 border-t transition-colors duration-300 ${
              isDark ? "border-slate-700" : "border-gray-200"
            }`}></div>

            {/* Create New Notebook Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCreateNotebook}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl outline-none border-none focus:outline-none focus:ring-0 focus:border-none active:outline-none hover:outline-none hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <span className="material-symbols-outlined">add</span>
                Tạo Notebook Mới
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ✅ Tách component Card + memo để tối ưu re-render
const NotebookCard = React.memo(({ notebook, onSelect, isDark }) => {
  // ✅ Chỉ state cho card này, không ảnh hưởng parent
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = useCallback(() => {
    setIsSelected(true);
    // Gọi callback ngay lập tức
    onSelect(notebook);
  }, [notebook, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`p-4 rounded-xl text-left cursor-pointer outline-none border-none focus:outline-none focus:ring-0 focus:border-none active:outline-none hover:outline-none transition-all duration-300 border ${
        isSelected
          ? isDark
            ? "bg-rose-900/30 border-rose-700 shadow-lg"
            : "bg-rose-50 border-rose-200 shadow-lg"
          : isDark
          ? "bg-slate-700 border-slate-600 hover:border-blue-500"
          : "bg-gray-50 border-gray-200 hover:border-blue-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📖</span>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold truncate transition-colors duration-300 ${
            isDark ? "text-slate-100" : "text-gray-800"
          }`}>
            {notebook.name}
          </h4>
          <p className={`text-xs line-clamp-2 transition-colors duration-300 ${
            isDark ? "text-slate-400" : "text-gray-500"
          }`}>
            {notebook.description || "Không có mô tả"}
          </p>
          {/* ✅ SỬA: cardCount -> totalEntries */}
          <p className={`text-xs mt-2 transition-colors duration-300 ${
            isDark ? "text-slate-500" : "text-gray-400"
          }`}>
            {notebook.totalEntries || 0} từ vựng
          </p>
          <p className={`text-xs transition-colors duration-300 ${
            isDark ? "text-slate-500" : "text-gray-400"
          }`}>
            {new Date(notebook.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        {isSelected && (
          <span className="text-green-500 flex-shrink-0 animate-check-slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                fill="currentColor"
              />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
});

NotebookCard.displayName = "NotebookCard";

export default NotebookSelectionModal;