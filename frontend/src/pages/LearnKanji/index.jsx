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
import { GlobalKanjiModal } from "../../components/JLPT/LessonCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosPublic from "../../apis/axios";

// 🎯 THÊM IMPORT CHO LOGIC LOGIN/REGISTER
import LoginModal from "../../components/Login";
import RegisterModal from "../../components/Register";

const LEVEL_MAP = {
  N5: "5",
  N4: "4",
  N3: "3",
  N2: "2",
  N1: "1",
};

const LEVELS_DATA = [
  // ... (giữ nguyên LEVELS_DATA)
  {
    id: "N5",
    title: "JLPT N5",
    subtitle: "Trình độ Nhập môn",
    total: 80,
    apiLevel: "5",
  },
  {
    id: "N4",
    title: "JLPT N4",
    subtitle: "Trình độ Sơ cấp",
    total: 167,
    apiLevel: "4",
  },
  {
    id: "N3",
    title: "JLPT N3",
    subtitle: "Trình độ Trung cấp",
    total: 380,
    apiLevel: "3",
  },
  {
    id: "N2",
    title: "JLPT N2",
    subtitle: "Trình độ Khá",
    total: 383,
    apiLevel: "2",
  },
  {
    id: "N1",
    title: "JLPT N1",
    total: 963,
    subtitle: "Trình độ Cao cấp",
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
            type="button"
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
  
  // 🎯 THÊM STATE QUẢN LÝ MODAL LOGIN/REGISTER
  const [activeModal, setActiveModal] = useState(null);
  const [currentApiPage, setCurrentApiPage] = useState(0);

  const axiosPrivateHook = useAxiosPrivate();
  const isInitialMount = useRef(true);
  const lastFetchedApiLevel = useRef("5");

  const {
    kanjiItems,
    pagination,
    loading,
    error,
    fetchKanjiByLevel,
    clearError,
    isLoggedIn,
    getUserId,
    isCacheValid,
    forceRefresh,
    fetchSummary,
    clearSummary,
  } = useKanjiStore();
  
  const allKanjiCache = useKanjiStore(state => state.allKanjiCache);
  const progressSummaryState = useKanjiStore(state => state.progressSummary);
  const summaryLoading = useKanjiStore(state => state.summaryLoading);

  const KANJI_PER_LESSON = 10;
  const LESSONS_PER_PAGE_UI = 10;

  const getApiLevel = useCallback((level) => LEVEL_MAP[level] || "5", []);
  const axiosToUse = isLoggedIn() ? axiosPrivateHook : axiosPublic;

  // --- REF CHO MODAL OVERLAY ---
  const modalRef = useRef(null);

  // --- HANDLERS FOR LOGIN/REGISTER ---
  const handleOpenLogin = () => setActiveModal('login');
  const handleOpenRegister = () => setActiveModal('register');
  const handleCloseModal = () => setActiveModal(null);

  const handleLoginSuccess = () => {
    handleCloseModal();
    // Sau khi login thành công, buộc refresh để fetch summary và cập nhật trạng thái
    forceRefresh(); 
  };

  // 🎯 HANDLER CLICK BÊN NGOÀI MODAL
  const handleOutsideClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCloseModal();
    }
  }, []);

  // 🎯 THÊM EVENT LISTENER CHO CLICK BÊN NGOÀI
  useEffect(() => {
    if (activeModal) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Ngăn chặn scroll khi modal mở
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
      // Khôi phục scroll khi modal đóng
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'unset';
    };
  }, [activeModal, handleOutsideClick]);

  // --- END HANDLERS ---

  // 🎯 useEffect để fetch Summary khi đăng nhập
  useEffect(() => {
    const userId = getUserId();
    
    if (isLoggedIn() && userId) {
      console.log(`✅ User logged in (${userId}). Fetching progress summary...`);
      fetchSummary(axiosToUse);
    } else {
      console.log("❌ User logged out or ID missing. Clearing progress summary.");
      clearSummary();
    }
    
    return () => {
      clearSummary();
    };
  }, [isLoggedIn, getUserId, fetchSummary, clearSummary, axiosToUse]);

  // Logic Fetch Kanji (Giữ nguyên)
  useEffect(() => {
    const apiLevel = getApiLevel(currentLevel);
    
    if (isInitialMount.current || currentLevel !== lastFetchedApiLevel.current) {
      setCurrentLessonPage(1);
      setCurrentApiPage(0);
      
      console.log(`🔄 Level changed to ${currentLevel}. Fetching API Page 0 if not cached.`);
      
      fetchKanjiByLevel({
        axios: axiosToUse,
        level: apiLevel,
        page: 0,
        size: KANJI_PER_LESSON,
        forceRefresh: false,
      });

      lastFetchedApiLevel.current = currentLevel;
      isInitialMount.current = false;
    } else if (refreshTrigger > 0) {
      console.log(`🔄 Manual refresh triggered. Re-fetching API Page ${currentApiPage} AND Summary.`);
      
      fetchSummary(axiosToUse);
      
      fetchKanjiByLevel({
        axios: axiosToUse,
        level: apiLevel,
        page: currentApiPage,
        size: KANJI_PER_LESSON,
        forceRefresh: true, 
      });
      setRefreshTrigger(0);
    }
  }, [
    axiosToUse,
    currentLevel,
    refreshTrigger,
    fetchKanjiByLevel,
    getApiLevel,
    currentApiPage,
    fetchSummary,
  ]);
  
  // Logic khi click lesson (Giữ nguyên)
  const handleLessonClick = useCallback((lessonApiPage) => {
    console.log(`Lesson clicked. Loading API Page: ${lessonApiPage}`);
    
    const apiLevel = getApiLevel(currentLevel);
    
    setCurrentApiPage(lessonApiPage);

    if (!isCacheValid(apiLevel, lessonApiPage)) {
      console.log(`➡️ Data for API Page ${lessonApiPage} not found/stale. Fetching...`);
      
      fetchKanjiByLevel({
        axios: axiosToUse,
        level: apiLevel,
        page: lessonApiPage,
        size: KANJI_PER_LESSON,
        forceRefresh: false,
      });
    } else {
      console.log(`📦 Data for API Page ${lessonApiPage} is cached. Updating state.`);
      
      fetchKanjiByLevel({
        axios: axiosToUse,
        level: apiLevel,
        page: lessonApiPage,
        size: KANJI_PER_LESSON,
        forceRefresh: false,
      });
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentLevel, isCacheValid, fetchKanjiByLevel, axiosToUse, getApiLevel]);

  // Logic refresh (Giữ nguyên)
  const handleManualRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered (re-fetch current API page and summary)");
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Logic đổi level (Giữ nguyên)
  const handleLevelChange = useCallback((newLevel) => {
    console.log(`🔄 Changing UI level to ${newLevel}`);
    setCurrentLevel(newLevel);
  }, []);

  const hasData = useMemo(() => {
    return kanjiItems && Array.isArray(kanjiItems) && kanjiItems.length > 0;
  }, [kanjiItems]);

  // currentLevelData (Giữ nguyên logic tính toán)
  const currentLevelData = useMemo(() => {
    try {
      const levelInfo =
        LEVELS_DATA.find((level) => level.id === currentLevel) ||
        LEVELS_DATA[0];
      const apiLevel = getApiLevel(currentLevel);

      const totalApiPages = pagination.totalPages || 0;
      const totalKanjiCount = pagination.totalItems || (totalApiPages * KANJI_PER_LESSON);
      const totalLessonsForUI = totalApiPages;
      
      const allLessons = [];
      
      for (let i = 0; i < totalApiPages; i++) {
        const lessonNumber = i + 1;
        const kanjiStart = i * KANJI_PER_LESSON + 1;
        const kanjiEnd = Math.min(kanjiStart + KANJI_PER_LESSON - 1, totalKanjiCount);

        const cacheKey = `${apiLevel}_${i}`;
        const lessonCache = allKanjiCache[cacheKey];
        const lessonKanji = lessonCache?.items || (pagination.currentPage === i ? kanjiItems : []);
        
        const firstKanji = lessonKanji?.[0]?.kanji || (lessonKanji?.[0]?.character) || '...';
        
        const status = (
            lessonCache?.items && 
            lessonCache.items.length > 0
          ) 
          ? (lessonCache.items.every(item => item?.status === "MASTERED") 
          ? "COMPLETED" 
          : (lessonCache.items.some(item => item?.status === "MASTERED") 
          ? "LEARNING" 
          : "NOT_STARTED")) 
          : "UNKNOWN"; 

        allLessons.push({
          id: `${currentLevel}-L${lessonNumber}`,
          title: `Bài ${lessonNumber}: ${firstKanji} và các từ liên quan`,
          range: `Kanji ${kanjiStart}–${kanjiEnd}`,
          kanji: lessonKanji.map(item => item?.kanji || item?.character),
          kanjiDetails: lessonCache?.items,
          apiLevel: apiLevel,
          lessonNumber: lessonNumber,
          apiPage: i,
          status: status,
        });
      }

      let totalLearnedCount = 0;
      
      Object.keys(allKanjiCache).filter(key => key.startsWith(`${apiLevel}_`)).forEach(cacheKey => {
        const cache = allKanjiCache[cacheKey];
        totalLearnedCount += (cache.items || []).filter(item => item?.status === "MASTERED").length;
      });

      if (totalLearnedCount > totalKanjiCount) totalLearnedCount = totalKanjiCount;
      
      const progress =
        totalKanjiCount > 0 ? Math.round((totalLearnedCount / totalKanjiCount) * 100) : 0;
      
      const currentLessonKanji = (currentApiPage === pagination.currentPage && kanjiItems.length > 0)
        ? kanjiItems 
        : allKanjiCache[`${apiLevel}_${currentApiPage}`]?.items || [];
        
      const currentLessonDetails = allLessons.find(l => l.apiPage === currentApiPage) || {};

      return {
        ...levelInfo,
        allLessons: allLessons,
        lessons: [{ ...currentLessonDetails, kanjiDetails: currentLessonKanji }],
        totalKanji: totalKanjiCount,
        progress: progress,
        learnedCount: totalLearnedCount,
        apiLevel: apiLevel,
        totalLessons: totalLessonsForUI,
      };
    } catch (error) {
      console.error("Error in currentLevelData calculation:", error);
      return {
        ...LEVELS_DATA[0],
        allLessons: [],
        lessons: [],
        progress: 0,
        totalKanji: 0,
        apiLevel: "5",
        learnedCount: 0,
        totalLessons: 0,
      };
    }
  }, [
    currentLevel,
    pagination.totalPages,
    pagination.totalItems,
    pagination.currentPage,
    kanjiItems,
    allKanjiCache,
    currentApiPage,
    getApiLevel,
  ]);

  // Pagination Logic (Giữ nguyên)
  const { filteredLessons, totalLessonPages, lessonStart, lessonEnd } = useMemo(() => {
    try {
      const lessonsToShow = currentLevelData.allLessons || [];

      const totalLessons = lessonsToShow.length;
      const totalPages = Math.ceil(totalLessons / LESSONS_PER_PAGE_UI);
      const startIndex = (currentLessonPage - 1) * LESSONS_PER_PAGE_UI;
      const endIndex = Math.min(startIndex + LESSONS_PER_PAGE_UI, totalLessons);
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

  // Progress Summary Logic (Giữ nguyên)
  const progressSummary = useMemo(() => {
    if (!isLoggedIn()) return {};

    const totalLessons = currentLevelData.totalLessons || 0;
    
    const completedLessons = currentLevelData.allLessons.filter(l => l.status === "COMPLETED").length;
    const learningLessons = currentLevelData.allLessons.filter(l => l.status === "LEARNING").length;
    const notStartedLessons = currentLevelData.allLessons.filter(l => l.status === "NOT_STARTED").length;
    const unknownLessons = currentLevelData.allLessons.filter(l => l.status === "UNKNOWN").length;

    return {
      completed: completedLessons,
      learning: learningLessons,
      notStarted: notStartedLessons + unknownLessons,
      total: totalLessons,
      allLevelsSummary: progressSummaryState,
    };
  }, [currentLevelData.allLessons, currentLevelData.totalLessons, isLoggedIn, progressSummaryState]);

  // --- RENDER LOGIC ---

  // Hiển thị Error (Giữ nguyên)
  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 🎯 TRUYỀN isModalOpen VÀO HEADER */}
          <Header 
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1800px] mx-auto">
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
                      forceRefresh();
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    type="button"
                  >
                    Thử lại
                  </button>
                  <button
                    onClick={() => handleLevelChange("N5")}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    type="button"
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

  // Hiển thị Loading ban đầu (Giữ nguyên)
  if (loading && currentApiPage === 0 && pagination.currentPage < 1) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 🎯 TRUYỀN isModalOpen VÀO HEADER */}
          <Header 
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1500px] mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Đang tải danh sách bài học {currentLevel}...
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
    <div id="webcrumbs-learn-kanji">
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 🎯 Tích hợp props mở modal vào Header - THÊM isModalOpen */}
          <Header 
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1500px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col">
                  <KanjiLearningBoard
                    levels={LEVELS_DATA}
                    currentLevel={currentLevel}
                    setCurrentLevel={handleLevelChange}
                    currentLevelData={currentLevelData}
                    filteredLessons={filteredLessons}
                    loading={loading && pagination.currentPage !== currentApiPage}
                    hasData={currentLevelData.totalKanji > 0}
                    pagination={pagination}
                    onRefresh={handleManualRefresh}
                    onLessonClick={handleLessonClick}
                    currentApiPage={currentApiPage}
                  />

                  {currentLevelData.totalLessons > 0 && totalLessonPages > 1 && (
                    <div className="mt-8 flex justify-center items-center">
                      {/* Pagination controls - Giữ nguyên */}
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() =>
                            setCurrentLessonPage(currentLessonPage - 1)
                          }
                          disabled={currentLessonPage === 1}
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                          type="button"
                        >
                          ←
                        </button>

                        {(() => {
                          const pages = [];
                          const maxVisible = 7;
                          const totalPages = totalLessonPages;

                          const createPage = (page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentLessonPage(page)}
                              className={`min-w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-150
                                ${
                                  currentLessonPage === page
                                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                              type="button"
                            >
                              {page}
                            </button>
                          );

                          if (totalPages <= maxVisible) {
                            for (let i = 1; i <= totalPages; i++)
                              pages.push(createPage(i));
                          } else {
                            if (currentLessonPage <= 4) {
                              for (let i = 1; i <= 5; i++)
                                pages.push(createPage(i));
                              pages.push(
                                <span key="dots1" className="px-2 text-gray-400">
                                  …
                                </span>
                              );
                              pages.push(createPage(totalPages));
                            } else if (currentLessonPage < totalPages - 3) {
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
                              pages.push(createPage(totalPages));
                            } else {
                              pages.push(createPage(1));
                              pages.push(
                                <span key="dots1" className="px-2 text-gray-400">
                                  …
                                </span>
                              );
                              for (
                                let i = totalPages - 4;
                                i <= totalPages;
                                i++
                              )
                                pages.push(createPage(i));
                            }
                          }

                          return pages;
                        })()}

                        <button
                          onClick={() =>
                            setCurrentLessonPage(currentLessonPage + 1)
                          }
                          disabled={currentLessonPage === totalLessonPages}
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                          type="button"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4">
                  <KanjiSidebar
                    levels={LEVELS_DATA}
                    currentLevel={currentLevel}
                    setCurrentLevel={handleLevelChange}
                    progressSummary={progressSummary}
                    summaryLoading={summaryLoading}
                    totalKanji={currentLevelData.totalKanji}
                    learnedKanjiCount={currentLevelData.learnedCount}
                    apiTotal={pagination.totalItems}
                    lessonPagination={{
                      currentPage: currentLessonPage,
                      totalPages: totalLessonPages,
                      lessonStart,
                      lessonEnd,
                      totalLessons: currentLevelData.totalLessons || 0,
                    }}
                    hasData={currentLevelData.totalKanji > 0}
                    onRefresh={handleManualRefresh}
                    onLessonClick={handleLessonClick}
                    currentApiPage={currentApiPage}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
        
        {/* 🎯 Modal Login/Register được hiển thị ở đây - THÊM REF VÀ OVERLAY CLICK */}
        {activeModal && (
          <div className="fixed inset-0 z-[9999] bg-black/50 transition-all duration-200">
            <div 
              ref={modalRef}
              className="relative z-[10000] w-full h-full flex items-center justify-center"
            >
              {activeModal === 'login' && (
                <LoginModal
                  onClose={handleCloseModal}
                  onSwitchToRegister={() => setActiveModal('register')}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}

              {activeModal === 'register' && (
                <RegisterModal
                  onClose={handleCloseModal}
                  onSwitchToLogin={() => setActiveModal('login')}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <GlobalKanjiModal onKanjiStatusChange={handleManualRefresh} />
    </div>
  );
}

function LearnKanji() {
  return (
    <ErrorBoundary>
      <LearnKanjiContent />
    </ErrorBoundary>
  );
}

export default LearnKanji;