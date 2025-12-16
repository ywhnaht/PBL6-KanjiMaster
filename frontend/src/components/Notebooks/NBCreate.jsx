// eslint-disable-next-line no-unused-vars
import React, { useState, useCallback, useMemo } from "react";
import useNotebookStore from "../../store/useNotebookStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useDarkModeStore from "../../store/useDarkModeStore";

const NBCreate = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [notebookName, setNotebookName] = useState("");
  const [notebookDescription, setNotebookDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ✅ Dùng selector thay vì destructure toàn bộ store
  const createNotebook = useNotebookStore(state => state.createNotebook);
  const isDark = useDarkModeStore((state) => state.isDark);
  
  // ✅ Lưu axios instance, không tạo mới mỗi render
  const axiosPrivate = useAxiosPrivate();

  // ✅ Memoize handler input - tránh tạo function mới mỗi render
  const handleNameChange = useCallback((e) => {
    setNotebookName(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setNotebookDescription(e.target.value);
  }, []);

  // ✅ Memoize handler tạo notebook
  const handleCreateNotebook = useCallback(async () => {
    if (!notebookName.trim()) {
      alert("Vui lòng nhập tên notebook");
      return;
    }

    setIsCreating(true);
    try {
      await createNotebook(
        axiosPrivate,
        notebookName,
        notebookDescription
      );
      setNotebookName("");
      setNotebookDescription("");
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Error creating notebook:", err);
      alert("Không thể tạo notebook. Vui lòng thử lại!");
    } finally {
      setIsCreating(false);
    }
  }, [notebookName, notebookDescription, createNotebook, axiosPrivate, onClose, onSuccess]);

  // ✅ Memoize handler đóng modal
  const handleClose = useCallback(() => {
    setNotebookName("");
    setNotebookDescription("");
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 transition-colors duration-300 ${
      isDark ? "bg-black/60" : "bg-black/50"
    }`}>
      <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-scale-in transition-colors duration-300 ${
        isDark
          ? "bg-slate-800 border border-slate-700"
          : "bg-white"
      }`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent mb-2">
            Tạo Notebook Mới
          </h3>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? "text-slate-400" : "text-gray-600"
          }`}>
            Tạo một notebook để lưu các từ vựng yêu thích của bạn
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? "text-slate-200" : "text-gray-700"
            }`}>
              Tên Notebook
            </label>
            <input
              type="text"
              value={notebookName}
              onChange={handleNameChange}
              placeholder="VD: N2 Kanji từ vựng"
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors duration-300 ${
                isDark
                  ? "bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400"
                  : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"
              }`}
              disabled={isCreating}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? "text-slate-200" : "text-gray-700"
            }`}>
              Mô tả (Tùy chọn)
            </label>
            <textarea
              value={notebookDescription}
              onChange={handleDescriptionChange}
              placeholder="Mô tả notebook của bạn..."
              rows={3}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none transition-colors duration-300 ${
                isDark
                  ? "bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400"
                  : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"
              }`}
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isCreating}
            className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-colors duration-300 disabled:opacity-50 ${
              isDark
                ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hủy
          </button>
          <button
            onClick={handleCreateNotebook}
            disabled={isCreating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {isCreating ? "Đang tạo..." : "Tạo Notebook"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NBCreate;