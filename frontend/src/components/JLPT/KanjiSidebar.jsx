/* eslint-disable no-unused-vars */
import React from "react";
import useKanjiStore from "../../store/useKanjiStore";

const KanjiSidebar = ({ 
  levels, 
  currentLevel, 
  setCurrentLevel,
  progressSummary,
  totalKanji,
  learnedKanjiCount,
  lessonPagination,
  hasData
}) => {
  const isLoggedIn = useKanjiStore((state) => state.isLoggedIn());

  // 🎯 XỬ LÝ progressSummary an toàn
  const safeProgressSummary = progressSummary || {
    completed: 0,
    learning: 0,
    notStarted: 0,
    total: 0
  };

  // 🎯 XỬ LÝ lessonPagination an toàn
  const safeLessonPagination = lessonPagination || {
    currentPage: 1,
    totalPages: 1,
    lessonStart: 0,
    lessonEnd: 0,
    totalLessons: 0
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold text-[#2E151B] mb-2">Chọn level để bắt đầu</h3>
            <p className="text-[#2E151B]/70 text-sm">Dữ liệu kanji sẽ hiển thị tại đây</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thống kê học tập */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-[#2E151B] mb-4">
          Thống kê học tập
        </h4>
        <div className="space-y-4">
          {/* Tổng số kanji */}
          <div className="flex justify-between items-center p-3 bg-[#DA7B93]/8 rounded-lg border border-[#2E151B]/10">
            <span className="text-[#2E151B] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E151B] text-lg">target</span>
              {isLoggedIn ? "Tổng số kanji" : "Tổng số kanji"}
            </span>
            <span className="font-bold text-[#2E151B]">
              {isLoggedIn 
                ? `${learnedKanjiCount || 0}/${totalKanji || 0}`
                : `${totalKanji || 0}`}
            </span>
          </div>

          {/* Đã hoàn thành */}
          <div className="flex justify-between items-center p-3 bg-[#DA7B93]/8 rounded-lg border border-[#2E151B]/10">
            <span className="text-[#2E151B] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E151B] text-lg">check_circle</span>
              Đã hoàn thành
            </span>
            <span className="font-bold text-[#2E151B]">
              {safeProgressSummary.completed}
            </span>
          </div>

          {/* Đang học */}
          <div className="flex justify-between items-center p-3 bg-[#DA7B93]/8 rounded-lg border border-[#2E151B]/10">
            <span className="text-[#2E151B] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E151B] text-lg">import_contacts</span>
              Đang học
            </span>
            <span className="font-bold text-[#2E151B]">
              {safeProgressSummary.learning}
            </span>
          </div>

          {/* Chưa học */}
          <div className="flex justify-between items-center p-3 bg-[#DA7B93]/8 rounded-lg border border-[#2E151B]/10">
            <span className="text-[#2E151B] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2E151B] text-lg">schedule</span>
              Chưa học
            </span>
            <span className="font-bold text-[#2E151B]">
              {safeProgressSummary.notStarted}
            </span>
          </div>
        </div>
      </div>

      {/* Mẹo học tập */}
      <div className="p-6 bg-gradient-to-r from-[#2E151B]/5 via-[#DA7B93]/5 to-[#2E151B]/5 rounded-xl shadow-sm border border-[#DA7B93]/10">
        <h3 className="font-bold text-[#2E151B] mb-3 text-xl">
          {isLoggedIn ? "Mẹo học tập" : "Bắt đầu học tập"}
        </h3>
        <p className="leading-relaxed px-4 py-3 rounded-lg text-[#2E151B] font-medium bg-gradient-to-r from-[#2E151B]/10 via-[#DA7B93]/10 to-[#2E151B]/10 shadow-inner border border-[#DA7B93]/10">
          {!isLoggedIn 
            ? "Đăng nhập để lưu tiến độ học tập và theo dõi quá trình học của bạn."
            : "Học đều đặn mỗi ngày, ôn tập lại các bài đã học để ghi nhớ lâu hơn."}
        </p>
      </div>
    </div>
  );
};

export default KanjiSidebar;