/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import LessonCard from "./LessonCard";
import useKanjiStore from "../../store/useKanjiStore";

const KanjiLearningBoard = ({
  levels,
  currentLevel,
  setCurrentLevel,
  currentLevelData,
  filteredLessons,
  loading,
  hasData,
  pagination,
}) => {
  const isLoggedIn = useKanjiStore((state) => state.isLoggedIn());

  const LevelNavigation = () => (
    <div className="flex items-center justify-between w-full max-w-6xl mx-auto p-8">
      {levels.map((level, index) => (
        <React.Fragment key={level.id}>
          <button
            onClick={() => setCurrentLevel(level.id)}
            className="relative flex flex-col items-center group"
            disabled={loading}
          >
            <div
              className={`w-16 h-16 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-500 relative
                ${
                  currentLevel === level.id
                    ? "text-white scale-110 shadow-2xl"
                    : "bg-white text-gray-700 hover:bg-[#2F4454]/5 hover:text-[#2F4454] shadow-md hover:shadow-lg"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Background gradient cho active state */}
              {currentLevel === level.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] rounded-full"></div>
              )}

              {/* Inner shadow để chữ nổi bật */}
              <div
                className={`relative z-10 ${
                  currentLevel === level.id ? "drop-shadow-sm" : ""
                }`}
              >
                {level.id}
              </div>
            </div>

            <div
              className={`mt-2 text-xs transition-colors duration-300 ${
                currentLevel === level.id
                  ? "text-[#DA7B93] font-semibold"
                  : "text-gray-600 group-hover:text-[#2F4454]"
              }`}
            >
              {level.subtitle}
            </div>
          </button>

          {index < levels.length - 1 && (
            <div className="flex-1 mx-2 flex items-center">
              <div className="w-full border-t-2 border-dashed border-[#DA7B93]/30"></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (!loading && !hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có dữ liệu kanji cho level {currentLevel}
          </h3>
          <p className="text-gray-500">
            Hãy thử chọn level khác hoặc kiểm tra lại kết nối.
          </p>
        </div>
        <LevelNavigation />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <LevelNavigation />

      {hasData && isLoggedIn && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
              {currentLevelData.title}
            </h2>
            <div className="text-sm text-gray-600">
              Tiến độ:{" "}
              <span className="font-semibold text-[#2F4454]">
                {currentLevelData.progress}%
              </span>{" "}
              ({currentLevelData.learnedCount || 0}/{currentLevelData.total}{" "}
              kanji)
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] h-3 rounded-full shadow-inner"
              initial={{ width: 0 }}
              animate={{ width: `${currentLevelData.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      )}

      {hasData && !isLoggedIn && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
            {currentLevelData.title}
          </h2>
          <p className="text-gray-600 mt-2">
            {currentLevelData.total} kanji — Đăng nhập để bắt đầu học
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#DA7B93]/30 border-t-[#DA7B93]"></div>
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {!loading && hasData && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#2F4454] mb-4">
              Tổng số bài học: {Math.ceil(currentLevelData.total / 10)}
            </h3>

            {filteredLessons.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Chưa có bài học nào
                </h3>
                <p className="text-gray-500">
                  Hãy kiểm tra lại level hoặc thử level khác.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default KanjiLearningBoard;
