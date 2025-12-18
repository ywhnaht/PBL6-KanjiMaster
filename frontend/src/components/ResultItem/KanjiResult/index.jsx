import React, { useState, useMemo, useEffect, useCallback } from "react"; 
import KanjiStroke from "../../../ultis/KanjiStroke"; 
import { useNavigate } from "react-router-dom"; 
import useSearchStore from "../../../store/useSearchStore"; 
import useKanjiDetailStore from "../../../store/useKanjiDetailStore";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useNotebookStore from "../../../store/useNotebookStore";
import useDarkModeStore from "../../../store/useDarkModeStore";
import { useAuthStore } from "../../../store/useAuthStore";
import NotebookSelectionModal from "../../../components/Notebooks/NBList";
import NotebookCreateModal from "../../../components/Notebooks/NBCreate";
import LoginModal from "../../../components/Login";
import SuggestionModal from "../../../components/SuggestionModal";

const NotificationModalComponent = React.memo(({ notification, notificationCountdown, isDark, onClose }) => {
  if (!notification) return null;

  const iconMap = {
    success: "bookmark_add",
    warning: "info",
    error: "error",
    info: "info",
  };

  const colorMap = {
    success: {
      bg: "from-green-500 to-emerald-500",
      icon: "text-white",
      border: isDark ? "border-green-700" : "border-green-200",
      text: isDark ? "text-green-300" : "text-green-800",
      bgLight: isDark ? "bg-green-900/30" : "bg-green-50",
    },
    warning: {
      bg: "from-amber-500 to-orange-500",
      icon: "text-white",
      border: isDark ? "border-amber-700" : "border-amber-200",
      text: isDark ? "text-amber-300" : "text-amber-800",
      bgLight: isDark ? "bg-amber-900/30" : "bg-amber-50",
    },
    error: {
      bg: "from-red-500 to-rose-500",
      icon: "text-white",
      border: isDark ? "border-red-700" : "border-red-200",
      text: isDark ? "text-red-300" : "text-red-800",
      bgLight: isDark ? "bg-red-900/30" : "bg-red-50",
    },
  };

  const theme = colorMap[notification.type] || colorMap.info;

  return (
    <div className="fixed top-4 right-4 z-[10001]">
      <div className={`rounded-2xl shadow-2xl border ${theme.border} p-6 max-w-sm transform animate-slide-in-right transition-colors duration-300 ${
        isDark ? "bg-slate-800" : "bg-white"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${theme.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className={`material-symbols-outlined ${theme.icon} text-lg`}>
              {iconMap[notification.type] || "info"}
            </span>
          </div>

          <div className="flex-1">
            <h3 className={`font-bold text-lg bg-gradient-to-r ${theme.bg} bg-clip-text text-transparent`}>
              {notification.title}
            </h3>
            <p className={`${theme.text} text-sm leading-relaxed transition-colors duration-300`}>
              {notification.message}
            </p>
          </div>

          <div className="flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full border-2 border-opacity-30 flex items-center justify-center relative`}
              style={{
                borderColor:
                  notification.type === "success"
                    ? "#22c55e"
                    : notification.type === "warning"
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              <span
                className="font-bold text-sm"
                style={{
                  color:
                    notification.type === "success"
                      ? "#22c55e"
                      : notification.type === "warning"
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                {notificationCountdown}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={`text-xs transition-colors duration-300 ${
              isDark
                ? "text-slate-500 hover:text-slate-300"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
});

NotificationModalComponent.displayName = 'NotificationModalComponent';

export default function KanjiResult({ 
  kanjis = [], 
  examples = [], 
  compounds = [], 
  query = "", 
  hideHeader = false,
  hideRelatedResults = false

}) { 
  const navigate = useNavigate(); 
  const axiosPrivateHook = useAxiosPrivate();
  const { user, accessToken } = useAuthStore();
  const isDark = useDarkModeStore((state) => state.isDark);
  const isAuthenticated = !!user && !!accessToken;

  const kanjiDetail = useKanjiDetailStore((state) => state.kanjiDetail);

  console.log("🔍 [KanjiResult] kanjiDetail from store:", {
    kanjiDetail,
    kanji: kanjiDetail?.kanji,
    id: kanjiDetail?.id,
  });

  const { 
    setQuery, 
    setCurrentWordId, 
    setCurrentKanjiId, 
    fetchKanjiDetail,
    fetchCompoundDetail,
    compoundKanjis,
    searchResults,
    query: queryFromStore,
    currentKanjiId,
  } = useSearchStore(); 

  const addEntryToNotebook = useNotebookStore((state) => state.addEntryToNotebook);
  const entryExists = useNotebookStore((state) => state.entryExists);

  const [selected, setSelected] = useState(0); 
  const [compoundPage, setCompoundPage] = useState(0); 
  const [kanjiStrokeKey, setKanjiStrokeKey] = useState(0); 
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAddingToNotebook, setIsAddingToNotebook] = useState(false);
  const [selectedKanjiId, setSelectedKanjiId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationCountdown, setNotificationCountdown] = useState(3);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionType, setSuggestionType] = useState('ADD_KANJI');

  const pageSize = 4; 
  const mainKanji = kanjis[selected]; 
  const displayQuery = queryFromStore || query || mainKanji?.kanji || "-"; 

  const topResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];
    return searchResults.slice(0, 5);
  }, [searchResults]);

  // ✅ FIX: Tách notification countdown logic thành effect riêng
  useEffect(() => {
    if (!notification) return;

    let interval;
    // Reset countdown khi notification thay đổi
    setNotificationCountdown(3);

    interval = setInterval(() => {
      setNotificationCountdown((prev) => {
        if (prev <= 1) {
          // Khi countdown đạt 0, xóa notification
          setNotification(null);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [notification]);

  useEffect(() => { 
    setCompoundPage(0); 
    setKanjiStrokeKey((prev) => prev + 1); 
  }, [selected, kanjis]); 

  const compoundsForSelected = useMemo(() => { 
    if (!mainKanji) return []; 
    if (Array.isArray(compounds) && compounds.length > 0) { 
      const filtered = compounds.filter((c) => 
        c.word?.includes(mainKanji.kanji) 
      ); 
      return filtered.length > 0 ? filtered : compounds; 
    } 
    return []; 
  }, [compounds, mainKanji]); 

  const totalPages = Math.max( 
    1, 
    Math.ceil(compoundsForSelected.length / pageSize) 
  ); 

  const paginatedCompounds = useMemo(() => {
    return compoundsForSelected.slice( 
      compoundPage * pageSize, 
      (compoundPage + 1) * pageSize 
    );
  }, [compoundsForSelected, compoundPage, pageSize]);

  const prevPage = useCallback(() => setCompoundPage((p) => Math.max(0, p - 1)), []);
  const nextPage = useCallback(() => 
    setCompoundPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages]
  );
  const goToPage = useCallback((i) => setCompoundPage(i), []);

  const handleRedrawStrokes = useCallback(() => { 
    setKanjiStrokeKey((prev) => prev + 1); 
   }, []);

  const getJLPTColor = useCallback((level) => { 
    const colors = { 
      N5: isDark ? "bg-green-900/30 text-green-300 border-green-700" : "bg-green-100 text-green-800 border-green-200", 
      N4: isDark ? "bg-blue-900/30 text-blue-300 border-blue-700" : "bg-blue-100 text-blue-800 border-blue-200", 
      N3: isDark ? "bg-yellow-900/30 text-yellow-300 border-yellow-700" : "bg-yellow-100 text-yellow-800 border-yellow-200", 
      N2: isDark ? "bg-orange-900/30 text-orange-300 border-orange-700" : "bg-orange-100 text-orange-800 border-orange-200", 
      N1: isDark ? "bg-red-900/30 text-red-300 border-red-700" : "bg-red-100 text-red-800 border-red-200", 
    }; 
    return colors[level] || (isDark ? "bg-slate-700 text-slate-300 border-slate-600" : "bg-gray-100 text-gray-800 border-gray-200"); 
  }, [isDark]); 

  const handleCompoundClick = useCallback((item) => { 
    if (!item?.id) return; 
    if (item.word) { 
      setQuery(item.word); 
    } 
    setCurrentWordId(item.id); 
    navigate(`/search/word/${item.id}`); 
  }, [setQuery, setCurrentWordId, navigate]);

  const handleKanjiClick = useCallback(async (kanji) => { 
    if (!kanji?.id) return; 
    if (kanji.kanji) { 
      setQuery(kanji.kanji); 
    } 
    setCurrentKanjiId(kanji.id); 
    await fetchKanjiDetail(kanji.id); 
    navigate(`/search/kanji/${kanji.id}`); 
  }, [setQuery, setCurrentKanjiId, fetchKanjiDetail, navigate]);

  // ✅ SỬA: Hàm getKanjiId - lấy từ kanjiDetail ĐẦU TIÊN
  const getKanjiId = useCallback(() => {
    console.log("🔍 [getKanjiId] Debug info:", {
      kanjiDetailId: kanjiDetail?.id,
      searchStoreCurrentKanjiId: currentKanjiId,
      mainKanjiId: mainKanji?.id,
      sources: {
        kanjiDetail: kanjiDetail ? `${kanjiDetail.id} (${kanjiDetail.kanji})` : "null",
        currentKanjiId: currentKanjiId || "null",
        mainKanji: mainKanji ? `${mainKanji.id} (${mainKanji.kanji})` : "null",
      },
    });

    if (kanjiDetail?.id) {
      console.log("✅ Using kanji ID from kanjiDetail:", kanjiDetail.id);
      return kanjiDetail.id;
    }
    
    if (currentKanjiId) {
      console.log("✅ Using kanji ID from currentKanjiId (SearchStore):", currentKanjiId);
      return currentKanjiId;
    }
    
    if (mainKanji?.id) {
      console.log("✅ Using kanji ID from mainKanji (props):", mainKanji.id);
      return mainKanji.id;
    }
    
    console.error("❌ [getKanjiId] No valid kanji ID found in any source!");
    return null;
  }, [kanjiDetail, currentKanjiId, mainKanji]);

  const handleFavoriteClick = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("⚠️ User not authenticated, showing login modal");
      setShowLoginModal(true);
      return;
    }

    const kanjiId = getKanjiId();
    
    console.log("🔘 [handleFavoriteClick] Called with:", {
      kanjiId,
      mainKanjiText: mainKanji?.kanji,
      isAuthenticated,
    });

    if (!kanjiId) {
      console.error("❌ [handleFavoriteClick] kanjiId is null");
      setNotification({
        type: "error",
        title: "Lỗi Dữ Liệu!",
        message: "Không thể lấy Kanji ID. Vui lòng reload trang!",
        icon: "error",
      });
      return;
    }

    setSelectedKanjiId(kanjiId);
    setShowNotebookModal(true);
  }, [isAuthenticated, getKanjiId, mainKanji]);

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
    const kanjiId = getKanjiId();
    
    console.log("✅ [handleLoginSuccess] Login successful, kanjiId:", kanjiId);
    
    if (kanjiId) {
      setSelectedKanjiId(kanjiId);
      setShowNotebookModal(true);
    } else {
      setNotification({
        type: "error",
        title: "Lỗi!",
        message: "Không thể lấy Kanji ID.",
        icon: "error",
      });
    }
  }, [getKanjiId]);

  const handleSelectNotebook = useCallback(async (notebook) => {
    try {
      setIsAddingToNotebook(true);

      const kanjiId = getKanjiId();
      const entityId = selectedKanjiId || kanjiId;

      console.log("🔍 [handleSelectNotebook] Processing notebook selection:", {
        selectedKanjiId,
        kanjiIdFromFunction: kanjiId,
        resolvedEntityId: entityId,
        mainKanjiText: mainKanji?.kanji,
        notebookId: notebook.id,
        notebookName: notebook.name,
      });

      if (!entityId || entityId === 0 || entityId === undefined || entityId === null) {
        throw new Error(
          `❌ Kanji ID không hợp lệ: ${entityId}. Vui lòng reload trang!`
        );
      }

      console.log("🔍 [handleSelectNotebook] Checking if entry exists:", {
        entityId,
        entityType: "KANJI",
      });

      if (entryExists(entityId, "KANJI")) {
        console.warn("⚠️ [handleSelectNotebook] Entry already exists in notebook");
        setNotification({
          type: "warning",
          title: "Kanji đã tồn tại!",
          message: `Kanji "${mainKanji?.kanji}" đã có trong notebook này`,
          icon: "info",
        });
        setIsAddingToNotebook(false);
        return;
      }

      console.log("📤 [handleSelectNotebook] Sending request to backend:", {
        notebookId: notebook.id,
        entityType: "KANJI",
        entityId: Number(entityId),
      });

      const result = await addEntryToNotebook(
        axiosPrivateHook,
        notebook.id,
        "KANJI",
        Number(entityId)
      );

      console.log("✅ [handleSelectNotebook] Backend response received:", result);

      // ✅ FIX: Tách notification update thành state change riêng
      setNotification({
        type: "success",
        title: "Lưu thành công!",
        message: `Kanji "${mainKanji?.kanji}" đã được lưu vào notebook "${notebook.name}"`,
        icon: "bookmark_add",
      });
      
      setShowNotebookModal(false);
    } catch (error) {
      console.error("❌ [handleSelectNotebook] Error occurred:", {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        fullError: error,
      });

      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage.includes("0") || errorMessage.includes("không hợp lệ")) {
        setNotification({
          type: "error",
          title: "Lỗi Dữ Liệu!",
          message: "Kanji ID không hợp lệ. Vui lòng reload trang!",
          icon: "error",
        });
      } else if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("tồn tại")
      ) {
        setNotification({
          type: "warning",
          title: "Kanji đã tồn tại!",
          message: errorMessage,
          icon: "info",
        });
      } else if (error.response?.status === 500) {
        setNotification({
          type: "error",
          title: "Lỗi Server (500)!",
          message: errorMessage || "Backend không thể xử lý request",
          icon: "error",
        });
      } else {
        setNotification({
          type: "error",
          title: "Lỗi!",
          message: errorMessage,
          icon: "error",
        });
      }
    } finally {
      setIsAddingToNotebook(false);
    }
  }, [getKanjiId, selectedKanjiId, entryExists, addEntryToNotebook, axiosPrivateHook, mainKanji]);

  const handleCreateNotebook = useCallback(() => {
    setShowNotebookModal(false);
    setShowCreateModal(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    setShowNotebookModal(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setShowNotebookModal(true);
  }, []);

  const handleCloseNotebookModal = useCallback(() => {
    setShowNotebookModal(false);
    setSelectedKanjiId(null);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    console.log("Switch to register modal");
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const separateReadings = useCallback((joyoReading) => {
    if (!joyoReading) return { onyomi: "-", kunyomi: "-" };
    
    const katakanaRegex = /[\u30A0-\u30FF]/;
    const hiraganaRegex = /[\u3040-\u309F]/;
    
    const parts = joyoReading.split(/[、,]/).map(part => part.trim());
    
    let onyomi = [];
    let kunyomi = [];
    
    parts.forEach(part => {
      if (katakanaRegex.test(part)) {
        onyomi.push(part);
      } else if (hiraganaRegex.test(part)) {
        kunyomi.push(part);
      }
    });
    
    return {
      onyomi: onyomi.length > 0 ? onyomi.join('、') : "-",
      kunyomi: kunyomi.length > 0 ? kunyomi.join('、') : "-"
    };
  }, []);

  const readings = useMemo(() => separateReadings(mainKanji?.joyoReading), [mainKanji, separateReadings]);

  const handleSearchResultClick = useCallback(async (item) => {
    if (!item?.id) return;
    setQuery(item.text || "");
    
    if (item.type === "KANJI") {
      setCurrentKanjiId(item.id);
      await fetchKanjiDetail(item.id);
      navigate(`/search/kanji/${item.id}`);
    } else if (item.type === "COMPOUND") {
      setCurrentWordId(item.id);
      await fetchCompoundDetail(item.id);
      navigate(`/search/word/${item.id}`);
    }
  }, [setQuery, setCurrentKanjiId, fetchKanjiDetail, setCurrentWordId, fetchCompoundDetail, navigate]);

  return ( 
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR BÊN TRÁI - Top 5 Results */}
          {!hideRelatedResults && topResults.length > 0 && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className={`rounded-xl shadow-lg p-4 top-6 max-h-[600px] overflow-y-auto transition-colors duration-300 ${
                isDark
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-white"
              }`}>
                <h3 className={`font-bold text-lg mb-3 transition-colors duration-300 ${
                  isDark ? "text-slate-100" : "text-gray-800"
                }`}>
                  Kết quả liên quan:{" "} 
                  <span className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                    isDark
                      ? "text-blue-300 bg-blue-900/30"
                      : "text-blue-600 bg-blue-50"
                  }`}> 
                    {displayQuery} 
                  </span> 
                </h3>
                
                <div className="space-y-2">
                  {topResults.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => handleSearchResultClick(item)}
                      className={`w-full text-left p-3 rounded-lg border transition-all group ${
                        isDark
                          ? "border-slate-600 hover:border-blue-500 hover:bg-blue-900/20"
                          : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className={`text-lg font-semibold group-hover:transition-colors duration-300 truncate ${
                            isDark
                              ? "text-slate-100 group-hover:text-blue-400"
                              : "text-gray-800 group-hover:text-blue-600"
                          }`}>
                            {item.text}
                          </div>
                          <div className={`text-xs mt-0.5 transition-colors duration-300 ${
                            isDark ? "text-slate-400" : "text-gray-500"
                          }`}>
                            {item.reading && (
                              <div className="truncate">{item.reading}</div>
                            )}
                            {item.meaning && (
                              <div className={`truncate transition-colors duration-300 ${
                                isDark ? "text-slate-300" : "text-gray-600"
                              }`}>{item.meaning}</div>
                            )}
                          </div>
                        </div>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                          item.type === "KANJI" 
                            ? isDark
                              ? "bg-purple-900/30 text-purple-300"
                              : "bg-purple-100 text-purple-700"
                            : isDark
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {item.type === "KANJI" ? "漢字" : "単語"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MAIN CONTENT */}
          <div className={`${!hideRelatedResults && topResults.length > 0 ? "lg:col-span-3 order-1 lg:order-2" : "lg:col-span-4"}`}>
            <div className="w-full space-y-6"> 
              {/* Header */} 
              <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b transition-colors duration-300 ${
                isDark ? "border-slate-700" : "border-gray-200"
              }`}> 
                {!hideHeader && (<div className="flex items-center gap-3"> 
                  {/* Kanji cấu thành */} 
                  {compoundKanjis && compoundKanjis.length > 0 && ( 
                    <div className="flex gap-2"> 
                      {compoundKanjis.map((k, i) => ( 
                        <button 
                          key={k.id || i} 
                          onClick={() => handleKanjiClick(k)} 
                          className={`w-14 h-14 flex items-center justify-center text-2xl font-semibold rounded-lg border-3 transition-all duration-300 ${
                            isDark
                              ? "text-slate-100 bg-slate-700 border-slate-600 hover:border-blue-500 hover:bg-blue-900/30"
                              : "text-gray-800 bg-white border-gray-400 hover:border-blue-500 hover:bg-blue-100"
                          }`}
                          title={`${k.kanji} - ${k.hanViet}`} 
                        > 
                          {k.kanji} 
                        </button> 
                      ))} 
                    </div> 
                  )} 
                  {/* Kanji Selector */} 
                  {kanjis.length > 1 && ( 
                    <div className="flex gap-2"> 
                      {kanjis.map((k, i) => ( 
                        <button 
                          key={i} 
                          onClick={() => setSelected(i)} 
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            selected === i
                              ? "bg-gradient-to-r from-slate-500 to-rose-400 text-white"
                              : isDark
                              ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        > 
                          {k.kanji} 
                        </button> 
                      ))} 
                    </div> 
                  )} 
                </div> )}
              </div> 

              {/* Main content */} 
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"> 
                <div className="xl:col-span-2"> 
                  {mainKanji && ( 
                    <div className={`rounded-xl shadow-lg p-8 mb-6 flex flex-col transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800 border border-slate-700"
                        : "bg-white"
                    }`}> 
                      {/* Kanji & info */} 
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 px-[62px]"> 
                        <div className="flex-1 flex flex-col items-center md:items-start"> 
                          <div className={`text-8xl font-light select-text mb-4 pl-8 transition-colors duration-300 ${
                            isDark ? "text-slate-100" : "text-gray-800"
                          }`}> 
                            {mainKanji.kanji} 
                          </div> 
                          <div className="flex items-center gap-3"> 
                            <span 
                              className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors duration-300 ${getJLPTColor( 
                                mainKanji.level 
                              )}`} 
                            > 
                              JLPT N{mainKanji.level || "-"} 
                            </span> 
                            <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                              isDark
                                ? "bg-slate-700 text-slate-300 border border-slate-600"
                                : "bg-gray-100 text-gray-700"
                            }`}> 
                              {mainKanji.strokes ?? "-"} nét 
                            </span> 
                          </div> 
                        </div> 
                        {/* ✅ Buttons */}
                        <div className="flex md:flex-col justify-center items-center md:items-start gap-3 mt-4 md:mt-0"> 
                          <button 
                            onClick={handleFavoriteClick}
                            disabled={isAddingToNotebook}
                            className={`group p-3 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                              isDark
                                ? "bg-red-900/30 hover:bg-red-800/50"
                                : "bg-red-50 hover:bg-red-100"
                            }`}
                            title={isAuthenticated ? "Lưu vào notebook" : "Đăng nhập để lưu notebook"}
                          > 
                            <span className={`material-symbols-outlined text-2xl transition-colors duration-300 ${
                              isDark
                                ? "text-red-400 group-hover:text-red-300"
                                : "text-red-500 group-hover:text-red-600"
                            }`}> 
                              favorite 
                            </span> 
                          </button> 
                          <button 
                            onClick={() => {
                              if (!isAuthenticated) {
                                setShowLoginModal(true);
                                return;
                              }
                              setSuggestionType('CORRECTION');
                              setShowSuggestionModal(true);
                            }}
                            className={`group p-3 rounded-full transition-colors duration-300 ${
                            isDark
                              ? "bg-blue-900/30 hover:bg-blue-800/50"
                              : "bg-blue-50 hover:bg-blue-100"
                            }`}
                            title={isAuthenticated ? "Báo lỗi / Sửa đổi" : "Đăng nhập để báo lỗi"}
                          > 
                            <span className="material-symbols-outlined text-orange-500 group-hover:text-orange-600 text-2xl"> 
                              flag 
                            </span> 
                          </button> 
                          <button 
                            onClick={() => {
                              if (!isAuthenticated) {
                                setShowLoginModal(true);
                                return;
                              }
                              setSuggestionType('ADD_KANJI');
                              setShowSuggestionModal(true);
                            }}
                            className={`group p-3 rounded-full transition-colors duration-300 ${
                            isDark
                              ? "bg-green-900/30 hover:bg-green-800/50"
                              : "bg-green-50 hover:bg-green-100"
                            }`}
                            title={isAuthenticated ? "Đề xuất thêm Kanji mới" : "Đăng nhập để đề xuất"}
                          > 
                           <span className={`material-symbols-outlined text-2xl transition-colors duration-300 ${
                              isDark
                                ? "text-green-400 group-hover:text-green-300"
                                : "text-green-500 group-hover:text-green-600"
                            }`}> 
                              add_circle 
                            </span> 
                          </button> 
                        </div> 
                      </div> 

                      {/* Meaning & Readings */} 
                      <div className="space-y-6"> 
                        {/* Phần Âm On (Katakana) và Âm Kun (Hiragana) */} 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                          <div className={`p-4 rounded-lg transition-colors duration-300 ${
                            isDark
                              ? "bg-purple-900/30 border border-purple-700"
                              : "bg-purple-50"
                          }`}> 
                            <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                              isDark ? "text-purple-300" : "text-purple-800"
                            }`}> 
                              音読み (On-yomi) 
                            </h3> 
                            <p className={`font-medium text-lg transition-colors duration-300 ${
                              isDark ? "text-purple-200" : "text-purple-700"
                            }`}> 
                              {readings.onyomi}
                            </p> 
                          </div> 
                          <div className={`p-4 rounded-lg transition-colors duration-300 ${
                            isDark
                              ? "bg-green-900/30 border border-green-700"
                              : "bg-green-50"
                          }`}> 
                            <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                              isDark ? "text-green-300" : "text-green-800"
                            }`}> 
                              訓読み (Kun-yomi) 
                            </h3> 
                            <p className={`font-medium text-lg transition-colors duration-300 ${
                              isDark ? "text-green-200" : "text-green-700"
                            }`}> 
                              {readings.kunyomi}
                            </p> 
                          </div> 
                        </div> 

                        {/* Phần Bộ */} 
                        <div className={`p-4 rounded-lg transition-colors duration-300 ${
                          isDark
                            ? "bg-orange-900/30 border border-orange-700"
                            : "bg-orange-50"
                        }`}> 
                          <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
                            isDark ? "text-orange-300" : "text-orange-800"
                          }`}> 
                            Thông tin Hán tự 
                          </h3> 
                          <div className="space-y-2"> 
                            <p className={`transition-colors duration-300 ${
                              isDark ? "text-orange-200" : "text-orange-700"
                            }`}> 
                              <span className="font-semibold">Hán Việt:</span>{" "} 
                              {mainKanji.hanViet || "-"} 
                            </p> 
                            <p className={`transition-colors duration-300 ${
                              isDark ? "text-orange-200" : "text-orange-700"
                            }`}> 
                              <span className="font-semibold">Bộ:</span>{" "} 
                              {mainKanji.radical || "-"} 
                            </p> 
                          </div> 
                        </div> 
                      </div> 
                    </div> 
                  )} 

                  {/* Ví dụ */} 
                  {examples.length > 0 && ( 
                    <div className={`rounded-xl shadow-lg p-6 mb-6 transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800 border border-slate-700"
                        : "bg-white"
                    }`}> 
                      <h3 className={`font-bold text-lg mb-4 transition-colors duration-300 ${
                        isDark ? "text-slate-100" : "text-gray-800"
                      }`}> 
                        Câu ví dụ 
                      </h3> 
                      <div className="space-y-4"> 
                        {examples.map((ex, i) => ( 
                          <div 
                            key={ex.id || i} 
                            className={`border-l-4 pl-4 py-2 transition-colors duration-300 ${
                              isDark
                                ? "border-blue-700"
                                : "border-blue-200"
                            }`}
                          > 
                            <p className={`text-lg font-medium transition-colors duration-300 ${
                              isDark ? "text-slate-100" : "text-gray-800"
                            }`}> 
                              {ex.sentence} 
                            </p> 
                            <p className={`text-sm italic transition-colors duration-300 ${
                              isDark ? "text-slate-400" : "text-gray-500"
                            }`}>{ex.meaning}</p> 
                          </div> 
                        ))} 
                      </div> 
                    </div> 
                  )} 
                </div> 

                {/* Sidebar - Right */} 
                <div className="space-y-6"> 
                  {/* Stroke order SVG */} 
                  {mainKanji?.svgLink && ( 
                    <div className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
                      isDark
                        ? "bg-slate-800 border border-slate-700"
                        : "bg-white"
                    }`}> 
                      <div className="flex items-center justify-between mb-4"> 
                        <h3 className={`font-bold text-lg transition-colors duration-300 ${
                          isDark ? "text-slate-100" : "text-gray-800"
                        }`}> 
                          Thứ tự nét viết 
                        </h3> 
                        <button 
                          onClick={handleRedrawStrokes} 
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 ${
                            isDark
                              ? "bg-blue-900/30 text-blue-300 border border-blue-700 hover:bg-blue-800/50"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                          }`}
                          title="Vẽ lại nét" 
                        > 
                          <span className="material-symbols-outlined text-base"> 
                            refresh 
                          </span> 
                        </button> 
                      </div> 
                      <div className="flex flex-col items-center"> 
                        <KanjiStroke 
                          key={kanjiStrokeKey} 
                          svgUrl={mainKanji.svgLink} 
                          width={260} 
                          height={260} 
                          strokeDuration={300} 
                          strokeDelay={400} 
                          autoPlay={true} 
                          loop={false} 
                        /> 
                      </div> 
                    </div> 
                  )} 

                  {/* Compounds */} 
                  <div className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-800 border border-slate-700"
                      : "bg-white"
                  }`}> 
                    <h3 className={`font-bold text-lg mb-4 transition-colors duration-300 ${
                      isDark ? "text-slate-100" : "text-gray-800"
                    }`}> 
                      Kết quả tương tự cho:{" "} 
                      <span className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                        isDark
                          ? "text-blue-300 bg-blue-900/30"
                          : "text-blue-600 bg-blue-50"
                      }`}> 
                        {displayQuery} 
                      </span> 
                    </h3> 
                    {compoundsForSelected.length === 0 ? ( 
                      <p className={`italic transition-colors duration-300 ${
                        isDark ? "text-slate-400" : "text-gray-500"
                      }`}>Không có từ ghép liên quan</p> 
                    ) : ( 
                      <> 
                        <div className="space-y-3"> 
                          {paginatedCompounds.map((c, i) => ( 
                            <div 
                              key={i} 
                              role="button" 
                              tabIndex={0} 
                              onClick={() => handleCompoundClick(c)} 
                              onKeyDown={(e) => { 
                                if (e.key === "Enter" || e.key === " ") { 
                                  e.preventDefault(); 
                                  handleCompoundClick(c); 
                                } 
                              }} 
                              className={`border rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                                isDark
                                  ? "border-slate-600 hover:border-blue-500 hover:bg-blue-900/20"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            > 
                              <div className="flex items-center justify-between mb-1"> 
                                <span className={`text-xl font-semibold transition-colors duration-300 ${
                                  isDark ? "text-slate-100" : "text-gray-800"
                                }`}> 
                                  {c.word} 
                                </span> 
                                <span className={`text-sm px-2 py-1 rounded transition-colors duration-300 ${
                                  isDark
                                    ? "text-slate-300 bg-slate-700"
                                    : "text-gray-500 bg-gray-100"
                                }`}> 
                                  {c.hiragana || c.reading || ""} 
                                </span> 
                              </div> 
                              <p className={`text-sm transition-colors duration-300 ${
                                isDark ? "text-slate-400" : "text-gray-600"
                              }`}> 
                                {c.meaning || c.meaningEn || ""} 
                              </p> 
                            </div> 
                          ))} 
                        </div> 
                        {/* Pagination */} 
                        {totalPages > 1 && ( 
                          <div className="mt-4 flex items-center justify-center gap-2"> 
                            <button 
                              onClick={prevPage} 
                              disabled={compoundPage === 0} 
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                                compoundPage === 0 
                                  ? isDark
                                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : isDark
                                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600"
                                  : "bg-white text-gray-700 hover:bg-gray-100 border"
                              }`}
                            > 
                              &lt; 
                            </button> 
                            {Array.from({ length: totalPages }).map((_, i) => ( 
                              <button 
                                key={i} 
                                onClick={() => goToPage(i)} 
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                                  compoundPage === i 
                                    ? "bg-gradient-to-r from-slate-500 to-rose-400 text-white"
                                    : isDark
                                    ? "bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border"
                                }`}
                              > 
                                {i + 1} 
                              </button> 
                            ))} 
                            <button 
                              onClick={nextPage} 
                              disabled={compoundPage === totalPages - 1} 
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                                compoundPage === totalPages - 1 
                                  ? isDark
                                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : isDark
                                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600"
                                  : "bg-white text-gray-700 hover:bg-gray-100 border"
                              }`}
                            > 
                              &gt; 
                            </button> 
                          </div> 
                        )} 
                      </> 
                    )} 
                  </div> 
                </div> 
              </div> 
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {/* ✅ Notebook Selection Modal */}
      <NotebookSelectionModal
        isOpen={showNotebookModal}
        onClose={handleCloseNotebookModal}
        onSelectNotebook={handleSelectNotebook}
        onCreateNotebook={handleCreateNotebook}
      />

      {/* ✅ Notebook Create Modal */}
      <NotebookCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* ✅ Suggestion Modal */}
      <SuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        type={suggestionType}
        initialData={mainKanji ? {
          kanji: mainKanji.kanji,
          hanViet: mainKanji.hanViet,
          onyomi: mainKanji.onyomi,
          kunyomi: mainKanji.kunyomi,
          joyoReading: mainKanji.joyoReading,
          meaning: mainKanji.meaning
        } : null}
      />

      {/* ✅ Notification Modal */}
       <NotificationModalComponent 
        notification={notification}
        notificationCountdown={notificationCountdown}
        isDark={isDark}
        onClose={handleCloseNotification}
      />
    </>
  ); 
}