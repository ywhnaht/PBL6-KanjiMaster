/* eslint-disable no-unused-vars */
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import KanjiResult from "../ResultItem/KanjiResult";
import useKanjiStore from "../../store/useKanjiStore";
import useKanjiDetailStore from "../../store/useKanjiDetailStore";
import useDarkModeStore from "../../store/useDarkModeStore";

// Tối ưu KanjiButton
const KanjiButton = React.memo(({ kanji, hanViet, learned, onClick, isDark }) => {
  const displayHanViet = useMemo(() => {
    if (!hanViet) return "";
    return hanViet.split(" ")[0];
  }, [hanViet]);

  const handleClick = useCallback(() => {
    onClick(kanji);
  }, [onClick, kanji]);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
        learned
          ? isDark
            ? "border-rose-500 bg-rose-900/30 shadow-sm hover:bg-rose-900/40"
            : "border-[#DA7B93] bg-[#DA7B93]/10 shadow-sm hover:bg-[#DA7B93]/20"
          : isDark
          ? "border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600"
          : "border-gray-200 bg-gray-50 hover:border-[#2F4454]/30 hover:bg-gray-100"
      }`}
      type="button"
    >
      <div
        className={`text-2xl font-bold text-center mb-1 transition-colors duration-300 ${
          learned 
            ? isDark 
              ? "text-rose-400" 
              : "text-[#DA7B93]" 
            : isDark 
            ? "text-slate-100" 
            : "text-[#2F4454]"
        }`}
      >
        {kanji}
      </div>
      <div
        className={`text-xs text-center transition-colors duration-300 ${
          learned 
            ? isDark 
              ? "text-rose-400 font-semibold" 
              : "text-[#DA7B93] font-semibold" 
            : isDark 
            ? "text-slate-400" 
            : "text-[#2F4454]/70"
        }`}
      >
        {displayHanViet || "N/A"}
      </div>
    </motion.button>
  );
});

KanjiButton.displayName = "KanjiButton";

// Component Modal duy nhất - đặt ở cấp cao nhất
const GlobalKanjiModal = React.memo(({ onKanjiStatusChange }) => {
  const modalRef = useRef(null);
  const isDark = useDarkModeStore((state) => state.isDark);

  const {
    kanjiDetail,
    loading,
    error,
    isModalOpen,
    closeKanjiDetail,
    markAsMastered,
    isLoggedIn,
  } = useKanjiDetailStore();

  const kanjiItems = useKanjiStore((state) => state.kanjiItems);
  const updateKanjiStatus = useKanjiStore((state) => state.updateKanjiStatus);

  const [currentStatus, setCurrentStatus] = useState(null);

  useEffect(() => {
    if (kanjiDetail) {
      setCurrentStatus(kanjiDetail.status);
    }
  }, [kanjiDetail]);

  useEffect(() => {
    if (isModalOpen && kanjiDetail?.id) {
      const currentKanji = kanjiItems.find(
        (item) => item.id === kanjiDetail.id
      );
      if (currentKanji && currentKanji.status !== currentStatus) {
        setCurrentStatus(currentKanji.status);
      }
    }
  }, [isModalOpen, kanjiDetail, kanjiItems, currentStatus]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeKanjiDetail();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isModalOpen, closeKanjiDetail]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        isModalOpen
      ) {
        closeKanjiDetail();
      }
    };

    if (isModalOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 10);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        clearTimeout(timer);
      };
    }
  }, [isModalOpen, closeKanjiDetail]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        closeKanjiDetail();
      }
    },
    [closeKanjiDetail]
  );

  const handleModalClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleMarkAsMastered = useCallback(async () => {
    if (!kanjiDetail?.id) return;

    setCurrentStatus("MASTERED");
    updateKanjiStatus(kanjiDetail.id, "MASTERED");

    const result = await markAsMastered(kanjiDetail.id);

    if (result.success) {
      updateKanjiStatus(kanjiDetail.id, "MASTERED");
      if (onKanjiStatusChange) {
        onKanjiStatusChange();
      }
    } else {
      console.error("❌ Failed to mark as mastered:", result.message);
      setCurrentStatus(kanjiDetail.status);
      updateKanjiStatus(kanjiDetail.id, kanjiDetail.status);
    }
  }, [kanjiDetail, markAsMastered, updateKanjiStatus, onKanjiStatusChange]);

  const kanjiData = useMemo(() => {
    if (!kanjiDetail) return [];
    return [
      {
        kanji: kanjiDetail.kanji,
        level: kanjiDetail.level,
        hanViet: kanjiDetail.hanViet,
        joyoReading: kanjiDetail.joyoReading,
        strokes: kanjiDetail.strokes,
        radical: kanjiDetail.radical,
        svgLink: kanjiDetail.svgLink,
      },
    ];
  }, [kanjiDetail]);

  const memoizedKanjiResult = useMemo(() => {
    if (!kanjiDetail) return null;

    return (
      <KanjiResult
        kanjis={kanjiData}
        compounds={kanjiDetail.compoundWords || []}
        examples={kanjiDetail.kanjiExamples || []}
        query={kanjiDetail.kanji}
        hideHeader={true}
        hideRelatedResults={true}  // 🆕 THÊM PROP NÀY
      />
    );
  }, [kanjiDetail, kanjiData]);

  const isMastered = useMemo(() => {
    return currentStatus === "MASTERED";
  }, [currentStatus]);

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentStatus(null);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <motion.div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-black/50" : "bg-black/30"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className={`absolute inset-0 transition-colors duration-300 ${
          isDark ? "bg-black/50" : "bg-black/30"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        ref={modalRef}
        className={`relative rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto z-[100000] border transition-colors duration-300 ${
          isDark
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        }`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{
          type: "tween",
          ease: "easeOut",
          duration: 0.15,
        }}
        onClick={handleModalClick}
      >
        <button
          onClick={closeKanjiDetail}
          className={`absolute top-3 right-3 text-lg rounded-full w-8 h-8 flex items-center justify-center shadow-sm z-10 transition-all duration-300 ${
            isDark
              ? "text-slate-400 bg-slate-700 hover:text-slate-100 hover:bg-slate-600"
              : "text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Đóng modal"
          type="button"
        >
          ✕
        </button>

        <div className="p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 transition-colors duration-300 ${
                isDark ? "border-b-rose-400" : "border-b-[#DA7B93]"
              }`}></div>
              <p className={`transition-colors duration-300 ${
                isDark ? "text-slate-400" : "text-gray-600"
              }`}>
                Đang tải chi tiết kanji...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <div className={`text-4xl mb-4 transition-colors duration-300 ${
                isDark ? "text-red-400" : "text-red-500"
              }`}>
                ❌
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                isDark ? "text-slate-100" : "text-[#2F4454]"
              }`}>
                Lỗi
              </h3>
              <p className={`mb-6 transition-colors duration-300 ${
                isDark ? "text-slate-400" : "text-gray-600"
              }`}>
                {error}
              </p>
              <button
                onClick={closeKanjiDetail}
                className="px-6 py-2 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                type="button"
              >
                Đóng
              </button>
            </div>
          )}

          {!kanjiDetail && !loading && !error && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                isDark ? "text-slate-100" : "text-[#2F4454]"
              }`}>
                Không có dữ liệu
              </h3>
              <p className={`mb-6 transition-colors duration-300 ${
                isDark ? "text-slate-400" : "text-gray-600"
              }`}>
                Không thể tải chi tiết kanji
              </p>
              <button
                onClick={closeKanjiDetail}
                className="px-6 py-2 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                type="button"
              >
                Đóng
              </button>
            </div>
          )}

          {kanjiDetail && !loading && !error && (
            <>
              {memoizedKanjiResult}

              <div className={`mt-6 p-4 border-t transition-colors duration-300 ${
                isDark ? "border-slate-700" : "border-gray-200"
              }`}>
                <div className="flex items-center justify-end">
                  {!isMastered && isLoggedIn() && (
                    <button
                      onClick={handleMarkAsMastered}
                      className="px-4 py-2 bg-[#2F4454] text-white rounded-lg hover:bg-[#1E2E39] transition-colors duration-300 hover:shadow-lg"
                      type="button"
                    >
                      Đánh dấu đã học
                    </button>
                  )}

                  {!isMastered && !isLoggedIn() && (
                    <div className={`text-sm px-3 py-2 rounded-lg border transition-colors duration-300 ${
                      isDark
                        ? "text-slate-300 bg-slate-700 border-slate-600"
                        : "text-[#2F4454] bg-[#2F4454]/5 border-[#2F4454]/10"
                    }`}>
                      Đăng nhập để lưu tiến độ
                    </div>
                  )}

                  {isMastered && (
                    <div className={`flex items-center font-semibold px-4 py-2 rounded-lg border transition-colors duration-300 ${
                      isDark
                        ? "text-rose-400 bg-rose-900/30 border-rose-700/50"
                        : "text-[#DA7B93] bg-[#DA7B93]/10 border-[#DA7B93]/20"
                    }`}>
                      <span>Đã học thuộc</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

GlobalKanjiModal.displayName = "GlobalKanjiModal";

// Main Component
function LessonCard({ lesson, onLessonClick, isActive }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDark = useDarkModeStore((state) => state.isDark);

  const kanjiItems = useKanjiStore((state) => state.kanjiItems);
  const isKanjiLearned = useKanjiStore((state) => state.isKanjiLearned);
  const { openKanjiDetail } = useKanjiDetailStore();

  const isLoggedIn = useKanjiDetailStore((state) => state.isLoggedIn);

  const handleKanjiClick = useCallback(
    (kanji) => {
      const kanjiDetail = lesson.kanjiDetails?.find(
        (item) => item.kanji === kanji || item.character === kanji
      );

      if (kanjiDetail?.id) {
        openKanjiDetail(kanjiDetail.id);
      } else {
        console.warn(`Không tìm thấy ID cho kanji: ${kanji}`);
      }
    },
    [lesson.kanjiDetails, openKanjiDetail]
  );

  const learnedCount = useMemo(() => {
    if (!lesson.kanjiDetails || !Array.isArray(lesson.kanjiDetails)) return 0;

    return lesson.kanjiDetails.filter((item) => {
      if (!item?.id) return false;

      const currentKanji = kanjiItems.find(
        (storeItem) => storeItem.id === item.id
      );
      const status = currentKanji?.status || item.status;

      return status === "MASTERED";
    }).length;
  }, [lesson.kanjiDetails, kanjiItems]);

  const kanjiList = useMemo(() => {
    if (!lesson.kanjiDetails) return null; 

    return lesson.kanji.map((k, index) => {
      const kanjiDetail = lesson.kanjiDetails.find(item => item.kanji === k || item.character === k);
      const hanViet = kanjiDetail?.hanViet || "";

      let learned = false;
      if (kanjiDetail?.id) {
        const currentKanji = kanjiItems.find(
          (item) => item.id === kanjiDetail.id
        );
        const status = currentKanji?.status || kanjiDetail.status;
        learned = status === "MASTERED";
      } else {
        learned = isKanjiLearned(k);
      }

      return (
        <KanjiButton
          key={`${k}-${index}-${learned}-${kanjiDetail?.id || index}`}
          kanji={k}
          hanViet={hanViet}
          learned={learned}
          onClick={handleKanjiClick}
          isDark={isDark}
        />
      );
    });
  }, [
    lesson.kanji,
    lesson.kanjiDetails,
    handleKanjiClick,
    isKanjiLearned,
    kanjiItems,
    isDark,
  ]);

  const handleLessonToggle = useCallback(() => {
    if (!isExpanded) {
      if (onLessonClick && lesson.apiPage !== undefined) {
        console.log(`🚀 Clicked Lesson ${lesson.lessonNumber}. Calling API Page ${lesson.apiPage}`);
        onLessonClick(lesson.apiPage);
      }
    }
    
    setIsExpanded((prev) => !prev);
  }, [onLessonClick, lesson.apiPage, lesson.lessonNumber, isExpanded]);

  const baseClasses = `rounded-xl transition-all duration-300 ${
    isDark
      ? "bg-slate-800 border-slate-700 hover:shadow-lg hover:border-slate-600"
      : "bg-white border-gray-200 hover:shadow-md border"
  }`;
  const activeClasses = isActive 
    ? isDark
      ? "border-rose-500 shadow-lg"
      : "border-indigo-400 shadow-lg"
    : "border";

  return (
    <motion.div
      className={`${baseClasses} ${activeClasses}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`p-4 cursor-pointer flex justify-between items-center transition-colors duration-300 ${
          isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-50"
        }`}
        onClick={handleLessonToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLessonToggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div>
          <h3 className={`font-semibold text-lg transition-colors duration-300 ${
            isDark ? "text-slate-100" : "text-[#2F4454]/90"
          }`}>
            {lesson.title}
          </h3>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? "text-slate-400" : "text-[#2F4454]/70"
          }`}>
            {lesson.range}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lesson.kanjiDetails && (
            <div className={`text-sm font-medium transition-colors duration-300 ${
              isDark
                ? "text-rose-400"
                : "text-[#2F4454]"
            }`}>
              {learnedCount}/{lesson.kanji.length} đã thuộc
            </div>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`transition-colors duration-300 ${
              isDark ? "text-slate-500" : "text-[#2F4454]/50"
            }`}
          >
            ▼
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t overflow-hidden transition-colors duration-300 ${
              isDark ? "border-slate-700" : "border-gray-100"
            }`}
          >
            <div className="p-4">
              {!lesson.kanjiDetails && (
                <div className={`mb-3 p-3 rounded-lg text-center border transition-colors duration-300 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-slate-400"
                    : "bg-gray-100 border-gray-200 text-gray-600"
                }`}>
                  <p className="text-sm">Đang tải chi tiết kanji...</p>
                </div>
              )}
              
              {lesson.kanjiDetails && (
                <>
                  {!isLoggedIn() && (
                    <div className={`mb-3 p-3 rounded-lg border transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600 text-slate-300"
                        : "bg-[#2F4454]/5 border-[#2F4454]/10 text-[#2F4454]"
                    }`}>
                      <p className="text-sm text-center">
                        👀 Bạn đang xem ở chế độ khách. Đăng nhập để lưu tiến độ học tập.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                    {kanjiList}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Export Global Modal để sử dụng ở cấp cao nhất
export { GlobalKanjiModal };
export default LessonCard;