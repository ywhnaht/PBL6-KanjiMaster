import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotebookStore from "../../store/useNotebookStore";

// eslint-disable-next-line no-unused-vars
export default function NBCard({ notebook, onDelete, onRefresh, onViewDetails }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteNotebook } = useNotebookStore();

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(); // ✅ THÊM: Gọi callback nếu có
    } else {
      navigate(`/notebooks/${notebook.id}`, { state: { notebook } });
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa notebook "${notebook.name}"? Tất cả dữ liệu sẽ bị xóa.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteNotebook(notebook.id);
      onRefresh?.();
    } catch (error) {
      console.error("Error deleting notebook:", error);
      alert("Không thể xóa notebook. Vui lòng thử lại!");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const formattedDate = new Date(notebook.createdAt).toLocaleDateString(
    "vi-VN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-slate-500 to-rose-400 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden h-64 flex flex-col"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>

      {/* Header with icon and menu */}
      <div className="relative z-10 flex items-start justify-between p-6">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-3xl text-white">
            note
          </span>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white"
          >
            <span className="material-symbols-outlined text-xl">
              more_vert
            </span>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl overflow-hidden z-50 min-w-48">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">
                  delete
                </span>
                {isDeleting ? "Đang xóa..." : "Xóa Notebook"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pt-0">
        <div>
          <h3 className="text-xl font-bold text-white line-clamp-2 mb-2 leading-tight">
            {notebook.name}
          </h3>
          {notebook.description && (
            <p className="text-white/80 text-sm line-clamp-2">
              {notebook.description}
            </p>
          )}
        </div>

        {/* Footer with date and entries count */}
        <div className="space-y-2">
          {/* Total Entries */}
          <div className="flex items-center gap-1 text-white/90 text-sm">
            <span className="material-symbols-outlined text-base">
              description
            </span>
            <span className="font-semibold">
              {notebook.totalEntries || 0} từ vựng {/* ✅ SỬA: cardCount -> totalEntries */}
            </span>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-1 text-white/90 text-sm">
            <span className="material-symbols-outlined text-base">
              calendar_today
            </span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 z-5"></div>
    </div>
  );
}