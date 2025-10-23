/* eslint-disable no-unused-vars */
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import KanjiLearningBoard from "../../components/JLPT/KanjiLearningBoard";
import KanjiSidebar from "../../components/JLPT/KanjiSidebar";
import useKanjiStore from "../../store/useKanjiStore";
// 🎯 THÊM IMPORT GlobalKanjiModal
import { GlobalKanjiModal } from "../../components/JLPT/LessonCard";

const LEVEL_MAP = {
  N5: "5",
  N4: "4",
  N3: "3",
  N2: "2",
  N1: "1",
};

const LEVELS_DATA = [
  {
    id: "N5",
    title: "JLPT N5",
    subtitle: "Trình độ Nhập môn",
    total: 100,
    apiLevel: "5",
  },
  {
    id: "N4",
    title: "JLPT N4",
    subtitle: "Trình độ Sơ cấp",
    total: 200,
    apiLevel: "4",
  },
  {
    id: "N3",
    title: "JLPT N3",
    subtitle: "Trình độ Trung cấp",
    total: 250,
    apiLevel: "3",
  },
  {
    id: "N2",
    title: "JLPT N2",
    subtitle: "Trình độ Khá",
    total: 300,
    apiLevel: "2",
  },
  {
    id: "N1",
    title: "JLPT N1",
    subtitle: "Trình độ Cao cấp",
    total: 400,
    apiLevel: "1",
  },
];

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || "Có lỗi xảy ra khi tải dữ liệu"}
          </p>
          <button
            onClick={() =>
              this.setState({ hasError: false, error: null, errorInfo: null })
            }
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LearnKanjiContent() {
  const [currentLevel, setCurrentLevel] = useState("N5");
  const [currentLessonPage, setCurrentLessonPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🆕 DÙNG useRef ĐỂ THEO DÕI TRẠNG THÁI
  const isInitialMount = useRef(true);
  const lastFetchedLevel = useRef("N5");

  // 🎯 SỬ DỤNG useKanjiStore - ĐƠN GIẢN HÓA
  const {
    kanjiItems,
    pagination,
    loading,
    error,
    fetchAllKanjiByLevel,
    clearError,
    isLoggedIn,
    getUserId,
  } = useKanjiStore();

  const lessonsPerPage = 10;

  // Convert level từ N5 -> 5, N4 -> 4, etc.
  const getApiLevel = (level) => LEVEL_MAP[level] || "5";

  // 🎯 EFFECT CHÍNH ĐỂ FETCH DATA - ĐƠN GIẢN HÓA
  useEffect(() => {
    // Chỉ fetch khi level thay đổi hoặc khi refreshTrigger thay đổi
    if (
      isInitialMount.current ||
      currentLevel !== lastFetchedLevel.current ||
      refreshTrigger > 0
    ) {
      const apiLevel = getApiLevel(currentLevel);
      const userId = isLoggedIn() ? getUserId() : null;

      console.log(
        `🔄 Fetching kanji for level: ${currentLevel} -> API level: ${apiLevel}`
      );

      fetchAllKanjiByLevel({
        level: apiLevel,
        size: 1000,
      });

      lastFetchedLevel.current = currentLevel;
      isInitialMount.current = false;
    }
  }, [
    currentLevel,
    refreshTrigger,
    fetchAllKanjiByLevel,
    isLoggedIn,
    getUserId,
  ]);

  // 🎯 HÀM XỬ LÝ KHI CẦN REFRESH THỦ CÔNG
  const handleManualRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // 🎯 XỬ LÝ KHI CHUYỂN LEVEL
  const handleLevelChange = useCallback((newLevel) => {
    console.log(`🔄 Changing level to ${newLevel}`);
    setCurrentLevel(newLevel);
    setCurrentLessonPage(1);
  }, []);

  // Kiểm tra xem có dữ liệu không
  const hasData = useMemo(() => {
    return kanjiItems && Array.isArray(kanjiItems) && kanjiItems.length > 0;
  }, [kanjiItems]);

  // 🎯 TÍNH learnedCount TỪ KANJI DETAILS (status === "MASTERED")
  const learnedCount = useMemo(() => {
    if (!isLoggedIn() || !kanjiItems || !Array.isArray(kanjiItems)) return 0;

    const masteredItems = kanjiItems.filter(
      (item) => item?.status === "MASTERED"
    );

    return masteredItems.length;
  }, [kanjiItems, isLoggedIn]);

  // 🎯 TÍNH PROGRESS VÀ TẠO LESSONS
  const currentLevelData = useMemo(() => {
    try {
      const levelInfo =
        LEVELS_DATA.find((level) => level.id === currentLevel) ||
        LEVELS_DATA[0];
      const apiLevel = getApiLevel(currentLevel);

      if (!hasData) {
        return {
          ...levelInfo,
          allLessons: [],
          lessons: [],
          progress: 0,
          total: 0,
          apiLevel: apiLevel,
          learnedCount: 0,
          totalLessons: 0,
        };
      }

      const totalKanji = kanjiItems.length;
      const progress =
        totalKanji > 0 ? Math.round((learnedCount / totalKanji) * 100) : 0;

      // Tạo lessons từ kanjiItems
      const allLessons = [];
      const itemsPerLesson = 10;

      for (let i = 0; i < kanjiItems.length; i += itemsPerLesson) {
        const lessonKanji = kanjiItems.slice(i, i + itemsPerLesson);
        const lessonNumber = Math.floor(i / itemsPerLesson) + 1;

        const kanjiCharacters = lessonKanji
          .map((item) => item?.kanji || null)
          .filter(
            (char) => char !== null && char !== "?" && typeof char === "string"
          );

        if (kanjiCharacters.length > 0) {
          allLessons.push({
            id: `${currentLevel}-L${lessonNumber}`,
            title: `Bài ${lessonNumber}: ${kanjiCharacters[0]} và các từ liên quan`,
            range: `Kanji ${i + 1}–${Math.min(
              i + itemsPerLesson,
              kanjiItems.length
            )}`,
            kanji: kanjiCharacters,
            kanjiDetails: lessonKanji,
            apiLevel: apiLevel,
            lessonNumber: lessonNumber,
          });
        }
      }

      return {
        ...levelInfo,
        allLessons: allLessons,
        lessons: allLessons,
        total: totalKanji,
        progress: progress,
        learnedCount: learnedCount,
        apiLevel: apiLevel,
        totalLessons: allLessons.length,
      };
    } catch (error) {
      console.error("Error in currentLevelData calculation:", error);
      return {
        ...LEVELS_DATA[0],
        allLessons: [],
        lessons: [],
        progress: 0,
        total: 0,
        apiLevel: "5",
        learnedCount: 0,
        totalLessons: 0,
      };
    }
  }, [currentLevel, kanjiItems, hasData, learnedCount]);

  // 🎯 LỌC LESSONS CHO PHÂN TRANG
  const { filteredLessons, totalLessonPages, lessonStart, lessonEnd } =
    useMemo(() => {
      try {
        const lessonsToShow = currentLevelData.allLessons || [];

        const totalLessons = lessonsToShow.length;
        const totalPages = Math.ceil(totalLessons / lessonsPerPage);
        const startIndex = (currentLessonPage - 1) * lessonsPerPage;
        const endIndex = Math.min(startIndex + lessonsPerPage, totalLessons);
        const paginatedLessons = lessonsToShow.slice(startIndex, endIndex);

        return {
          filteredLessons: paginatedLessons,
          totalLessonPages: totalPages,
          lessonStart: startIndex + 1,
          lessonEnd: endIndex,
        };
      } catch (error) {
        console.error("Error in filteredLessons calculation:", error);
        return {
          filteredLessons: [],
          totalLessonPages: 1,
          lessonStart: 0,
          lessonEnd: 0,
        };
      }
    }, [currentLevelData.allLessons, currentLessonPage]);

  // 🎯 TÍNH PROGRESS SUMMARY CHO SIDEBAR
  const progressSummary = useMemo(() => {
    if (!isLoggedIn() || !currentLevelData.allLessons) return {};

    const totalLessons = currentLevelData.allLessons.length;
    let completedLessons = 0;
    let learningLessons = 0;

    currentLevelData.allLessons.forEach((lesson) => {
      if (!lesson.kanjiDetails) return;

      const masteredCount = lesson.kanjiDetails.filter(
        (item) => item?.status === "MASTERED"
      ).length;
      const totalCount = lesson.kanjiDetails.length;

      if (masteredCount === totalCount) {
        completedLessons++;
      } else if (masteredCount > 0) {
        learningLessons++;
      }
    });

    return {
      completed: completedLessons,
      learning: learningLessons,
      notStarted: totalLessons - completedLessons - learningLessons,
      total: totalLessons,
    };
  }, [currentLevelData.allLessons, isLoggedIn]);

  // 🎯 XỬ LÝ CHUYỂN TRANG LESSONS
  const handleLessonPageChange = useCallback((newPage) => {
    setCurrentLessonPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Hiển thị error state
  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1500px] mx-auto">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😵</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Có lỗi xảy ra
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      clearError();
                      handleManualRefresh();
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Thử lại
                  </button>
                  <button
                    onClick={() => handleLevelChange("N5")}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Về N5
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Hiển thị loading
  if (loading && kanjiItems.length === 0) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1500px] mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Đang tải toàn bộ dữ liệu kanji {currentLevel}...
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1500px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* CỘT CHÍNH: BOARD */}
              <div className="lg:col-span-8 flex flex-col">
                <KanjiLearningBoard
                  levels={LEVELS_DATA}
                  currentLevel={currentLevel}
                  setCurrentLevel={handleLevelChange}
                  currentLevelData={{
                    ...currentLevelData,
                    lessons: filteredLessons,
                  }}
                  filteredLessons={filteredLessons}
                  loading={loading}
                  hasData={hasData}
                  pagination={pagination}
                  onRefresh={handleManualRefresh}
                />

                {/* PAGINATION */}
                {hasData && totalLessonPages > 1 && (
                  <div className="mt-8 flex justify-center items-center">
                    <div className="flex gap-2 items-center">
                      {/* Prev */}
                      <button
                        onClick={() =>
                          handleLessonPageChange(currentLessonPage - 1)
                        }
                        disabled={currentLessonPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 
                   hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                      >
                        ←
                      </button>

                      {/* Page numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisible = 7;

                        const createPage = (page) => (
                          <button
                            key={page}
                            onClick={() => handleLessonPageChange(page)}
                            className={`min-w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-150
              ${
                currentLessonPage === page
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
                          >
                            {page}
                          </button>
                        );

                        // Nếu tổng trang <= 7 thì hiện hết
                        if (totalLessonPages <= maxVisible) {
                          for (let i = 1; i <= totalLessonPages; i++)
                            pages.push(createPage(i));
                        } else {
                          // Nếu đang ở đầu
                          if (currentLessonPage <= 4) {
                            for (let i = 1; i <= 5; i++)
                              pages.push(createPage(i));
                            pages.push(
                              <span key="dots1" className="px-2 text-gray-400">
                                …
                              </span>
                            );
                            pages.push(createPage(totalLessonPages));
                          }
                          // Nếu đang ở giữa
                          else if (currentLessonPage < totalLessonPages - 3) {
                            pages.push(createPage(1));
                            pages.push(
                              <span key="dots1" className="px-2 text-gray-400">
                                …
                              </span>
                            );
                            for (
                              let i = currentLessonPage - 1;
                              i <= currentLessonPage + 1;
                              i++
                            )
                              pages.push(createPage(i));
                            pages.push(
                              <span key="dots2" className="px-2 text-gray-400">
                                …
                              </span>
                            );
                            pages.push(createPage(totalLessonPages));
                          }
                          // Nếu đang ở cuối
                          else {
                            pages.push(createPage(1));
                            pages.push(
                              <span key="dots1" className="px-2 text-gray-400">
                                …
                              </span>
                            );
                            for (
                              let i = totalLessonPages - 4;
                              i <= totalLessonPages;
                              i++
                            )
                              pages.push(createPage(i));
                          }
                        }

                        return pages;
                      })()}

                      {/* Next */}
                      <button
                        onClick={() =>
                          handleLessonPageChange(currentLessonPage + 1)
                        }
                        disabled={currentLessonPage === totalLessonPages}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 
                   hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CỘT PHỤ: SIDEBAR */}
              <div className="lg:col-span-4">
                <KanjiSidebar
                  levels={LEVELS_DATA}
                  currentLevel={currentLevel}
                  setCurrentLevel={handleLevelChange}
                  progressSummary={progressSummary}
                  totalKanji={kanjiItems.length}
                  learnedKanjiCount={learnedCount}
                  apiTotal={pagination.totalItems}
                  lessonPagination={{
                    currentPage: currentLessonPage,
                    totalPages: totalLessonPages,
                    lessonStart,
                    lessonEnd,
                    totalLessons: currentLevelData.totalLessons || 0,
                  }}
                  hasData={hasData}
                  onRefresh={handleManualRefresh}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 🎯 GlobalKanjiModal */}
      <GlobalKanjiModal onKanjiStatusChange={handleManualRefresh} />
    </div>
  );
}

export default function LearnKanji() {
  return (
    <ErrorBoundary>
      <LearnKanjiContent />
    </ErrorBoundary>
  );
}
