/* eslint-disable no-unused-vars */
import React from "react";
// Sửa đường dẫn import: Điều chỉnh từ ../../store/useKanjiStore thành ../../store/useKanjiStore
// Giả định thư mục /components và /store nằm ngang cấp trong /src
import useKanjiStore from "../../store/useKanjiStore";
import useDarkModeStore from "../../store/useDarkModeStore";

const KanjiSidebar = ({ 
  levels, 
  currentLevel, 
  setCurrentLevel,
  progressSummary,
  summaryLoading, // 🎯 THÊM: Loading state cho API summary
  totalKanji,
  learnedKanjiCount,
  lessonPagination,
  hasData
}) => {
  const isLoggedIn = useKanjiStore((state) => state.isLoggedIn());
  const isDark = useDarkModeStore((state) => state.isDark);

  // 🎯 Lấy dữ liệu summary từ API
  const allLevelsSummary = progressSummary?.allLevelsSummary || { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0 };
  
  // Số kanji đã học của level hiện tại (từ API, chính xác hơn learnedKanjiCount từ cache)
  const learnedKanjiCurrentLevel = allLevelsSummary[currentLevel] || 0; 
  
  // Tổng số kanji đã học tất cả các level (từ API)
  const totalOverallLearned = Object.values(allLevelsSummary).reduce((sum, count) => sum + count, 0);


  // 🎯 XỬ LÝ progressSummary an toàn (cho lesson status)
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
        <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📚</div>
            <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-slate-100' : 'text-[#2E151B]'
            }`}>
              Chọn level để bắt đầu
            </h3>
            <p className={`text-sm transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-[#2E151B]/70'
            }`}>
              Dữ liệu kanji sẽ hiển thị tại đây
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thống kê học tập */}
      <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        <h4 className={`font-semibold mb-4 transition-colors duration-300 ${
          isDark ? 'text-slate-100' : 'text-[#2E151B]'
        }`}>
          Thống kê học tập
        </h4>

        {summaryLoading && isLoggedIn ? (
          <div className="flex justify-center items-center py-4">
            <div className={`animate-spin rounded-full h-6 w-6 border-b-2 mr-3 transition-colors duration-300 ${
              isDark ? 'border-b-rose-400' : 'border-b-[#DA7B93]'
            }`}></div>
            <span className={`text-sm transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Đang tải tiến độ tổng hợp...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Tiến độ Level hiện tại (API data) */}
            <div className={`flex justify-between items-center p-3 rounded-lg border transition-colors duration-300 ${
              isDark
                ? 'bg-rose-900/20 border-rose-700/50'
                : 'bg-[#DA7B93]/10 border-[#2E151B]/10'
            }`}>
              <span className={`font-medium flex items-center gap-2 transition-colors duration-300 ${
                isDark ? 'text-rose-300' : 'text-[#2E151B]'
              }`}>
                <span className={`material-symbols-outlined text-lg transition-colors duration-300 ${
                  isDark ? 'text-rose-400' : 'text-[#DA7B93]'
                }`}>
                  school
                </span>
                Level {currentLevel} Kanji
              </span>
              <span className={`font-bold transition-colors duration-300 ${
                isDark ? 'text-rose-400' : 'text-[#DA7B93]'
              }`}>
                {isLoggedIn 
                  ? `${learnedKanjiCurrentLevel}/${totalKanji || 0}`
                  : `${totalKanji || 0}`}
              </span>
            </div>

            {/* 2. Tổng Kanji Đã Học (API grand total) */}
            <div className={`flex justify-between items-center p-3 rounded-lg border transition-colors duration-300 ${
              isDark
                ? 'bg-slate-700/30 border-slate-600'
                : 'bg-[#2F4454]/10 border-[#2E151B]/10'
            }`}>
              <span className={`font-medium flex items-center gap-2 transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-[#2E151B]'
              }`}>
                <span className={`material-symbols-outlined text-lg transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-[#2F4454]'
                }`}>
                  auto_stories
                </span>
                Tổng Kanji Đã Học (All JLPT)
              </span>
              <span className={`font-bold transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-[#2F4454]'
              }`}>
                {isLoggedIn ? totalOverallLearned : "Đăng nhập"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mẹo học tập */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-r from-slate-800/50 via-rose-900/20 to-slate-800/50 border-rose-700/30'
          : 'bg-gradient-to-r from-[#2E151B]/5 via-[#DA7B93]/5 to-[#2E151B]/5 border-[#DA7B93]/10'
      }`}>
        <h3 className={`font-bold mb-3 text-xl transition-colors duration-300 ${
          isDark ? 'text-slate-100' : 'text-[#2E151B]'
        }`}>
          {isLoggedIn ? "Mẹo học tập" : "Bắt đầu học tập"}
        </h3>
        <p className={`leading-relaxed px-4 py-3 rounded-lg font-medium shadow-inner border transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-r from-slate-700/50 via-rose-900/20 to-slate-700/50 text-slate-100 border-rose-700/30'
            : 'bg-gradient-to-r from-[#2E151B]/10 via-[#DA7B93]/10 to-[#2E151B]/10 text-[#2E151B] border-[#DA7B93]/10'
        }`}>
          {!isLoggedIn 
            ? "Đăng nhập để lưu tiến độ học tập và theo dõi quá trình học của bạn."
            : "Học đều đặn mỗi ngày, ôn tập lại các bài đã học để ghi nhớ lâu hơn."}
        </p>
      </div>
    </div>
  );
};

export default KanjiSidebar;