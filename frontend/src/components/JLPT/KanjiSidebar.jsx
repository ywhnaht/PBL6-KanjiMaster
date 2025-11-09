/* eslint-disable no-unused-vars */
import React from "react";
// Sửa đường dẫn import: Điều chỉnh từ ../../store/useKanjiStore thành ../../store/useKanjiStore
// Giả định thư mục /components và /store nằm ngang cấp trong /src
import useKanjiStore from "../../store/useKanjiStore";

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

        {summaryLoading && isLoggedIn ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#DA7B93] mr-3"></div>
            <span className="text-gray-600 text-sm">Đang tải tiến độ tổng hợp...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Tiến độ Level hiện tại (API data) */}
            <div className="flex justify-between items-center p-3 bg-[#DA7B93]/10 rounded-lg border border-[#2E151B]/10">
              <span className="text-[#2E151B] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[#DA7B93] text-lg">school</span>
                Level {currentLevel} Kanji
              </span>
              <span className="font-bold text-[#DA7B93]">
                {isLoggedIn 
                  ? `${learnedKanjiCurrentLevel}/${totalKanji || 0}`
                  : `${totalKanji || 0}`}
              </span>
            </div>

            {/* 2. Tổng Kanji Đã Học (API grand total) */}
            <div className="flex justify-between items-center p-3 bg-[#2F4454]/10 rounded-lg border border-[#2E151B]/10">
              <span className="text-[#2E151B] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2F4454] text-lg">auto_stories</span>
                Tổng Kanji Đã Học (All JLPT)
              </span>
              <span className="font-bold text-[#2F4454]">
                {isLoggedIn ? totalOverallLearned : "Đăng nhập"}
              </span>
            </div>
          </div>
        )}
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