import React, { useState, useMemo, useEffect } from "react"; 
import KanjiStroke from "../../../ultis/KanjiStroke"; 
import { useNavigate } from "react-router-dom"; 
import useSearchStore from "../../../store/useSearchStore"; 
import useKanjiDetailStore from "../../../store/useKanjiDetailStore";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useNotebookStore from "../../../store/useNotebookStore";
import { useAuthStore } from "../../../store/useAuthStore";
import NotebookSelectionModal from "../../../components/Notebooks/NBList";
import NotebookCreateModal from "../../../components/Notebooks/NBCreate";
import LoginModal from "../../../components/Login";

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
  const isAuthenticated = !!user && !!accessToken;

  // ✅ SỬA: Lấy kanjiDetail từ store (không phải kanji)
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

  const pageSize = 4; 
  const mainKanji = kanjis[selected]; 
  const displayQuery = queryFromStore || query || mainKanji?.kanji || "-"; 

  const topResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];
    return searchResults.slice(0, 5);
  }, [searchResults]);

  useEffect(() => {
    let interval;
    if (notification && notificationCountdown > 0) {
      interval = setInterval(() => {
        setNotificationCountdown((prev) => prev - 1);
      }, 1000);
    } else if (notificationCountdown === 0 && notification) {
      setNotification(null);
      setNotificationCountdown(3);
    }
    return () => clearInterval(interval);
  }, [notification, notificationCountdown]);

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

  const paginatedCompounds = compoundsForSelected.slice( 
    compoundPage * pageSize, 
    (compoundPage + 1) * pageSize 
  ); 

  const prevPage = () => setCompoundPage((p) => Math.max(0, p - 1)); 
  const nextPage = () => 
    setCompoundPage((p) => Math.min(totalPages - 1, p + 1)); 
  const goToPage = (i) => setCompoundPage(i); 

  const handleRedrawStrokes = () => { 
    setKanjiStrokeKey((prev) => prev + 1); 
  }; 

  const getJLPTColor = (level) => { 
    const colors = { 
      N5: "bg-green-100 text-green-800 border-green-200", 
      N4: "bg-blue-100 text-blue-800 border-blue-200", 
      N3: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      N2: "bg-orange-100 text-orange-800 border-orange-200", 
      N1: "bg-red-100 text-red-800 border-red-200", 
    }; 
    return colors[level] || "bg-gray-100 text-gray-800 border-gray-200"; 
  }; 

  const handleCompoundClick = (item) => { 
    if (!item?.id) return; 
    if (item.word) { 
      setQuery(item.word); 
    } 
    setCurrentWordId(item.id); 
    navigate(`/search/word/${item.id}`); 
  }; 

  const handleKanjiClick = async (kanji) => { 
    if (!kanji?.id) return; 
    if (kanji.kanji) { 
      setQuery(kanji.kanji); 
    } 
    setCurrentKanjiId(kanji.id); 
    await fetchKanjiDetail(kanji.id); 
    navigate(`/search/kanji/${kanji.id}`); 
  }; 

  // ✅ SỬA: Hàm getKanjiId - lấy từ kanjiDetail ĐẦU TIÊN
  const getKanjiId = () => {
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

    // 1. ✅ ƯỚI TIÊN: kanjiDetail từ KanjiDetailStore (được fetch chi tiết)
    if (kanjiDetail?.id) {
      console.log("✅ Using kanji ID from kanjiDetail:", kanjiDetail.id);
      return kanjiDetail.id;
    }
    
    // 2. currentKanjiId từ SearchStore
    if (currentKanjiId) {
      console.log("✅ Using kanji ID from currentKanjiId (SearchStore):", currentKanjiId);
      return currentKanjiId;
    }
    
    // 3. mainKanji.id từ props (fallback cuối cùng)
    if (mainKanji?.id) {
      console.log("✅ Using kanji ID from mainKanji (props):", mainKanji.id);
      return mainKanji.id;
    }
    
    console.error("❌ [getKanjiId] No valid kanji ID found in any source!");
    return null;
  };

  const handleFavoriteClick = async () => {
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
  };

  const handleLoginSuccess = () => {
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
  };

  const handleSelectNotebook = async (notebook) => {
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

      // ✅ Validate entityId
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
  };

  const handleCreateNotebook = () => {
    setShowNotebookModal(false);
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setShowNotebookModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setShowNotebookModal(true);
  };

  const handleCloseNotebookModal = () => {
    setShowNotebookModal(false);
    setSelectedKanjiId(null);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleSwitchToRegister = () => {
    console.log("Switch to register modal");
  };

  const NotificationModal = () => {
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
        border: "border-green-200",
        text: "text-green-800",
      },
      warning: {
        bg: "from-amber-500 to-orange-500",
        icon: "text-white",
        border: "border-amber-200",
        text: "text-amber-800",
      },
      error: {
        bg: "from-red-500 to-rose-500",
        icon: "text-white",
        border: "border-red-200",
        text: "text-red-800",
      },
    };

    const theme = colorMap[notification.type] || colorMap.info;

    return (
      <div className="fixed top-4 right-4 z-[10001]">
        <div className={`bg-white rounded-2xl shadow-2xl border ${theme.border} p-6 max-w-sm transform animate-slide-in-right`}>
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
              <p className={`${theme.text} text-sm leading-relaxed`}>
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
              onClick={() => setNotification(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const separateReadings = (joyoReading) => {
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
  };

  const readings = separateReadings(mainKanji?.joyoReading);

  const handleSearchResultClick = async (item) => {
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
  };

  return ( 
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR BÊN TRÁI - Top 5 Results */}
          {!hideRelatedResults && topResults.length > 0 && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-lg p-4 top-6 max-h-[600px] overflow-y-auto">
                <h3 className="font-bold text-lg text-gray-800 mb-3">
                  Kết quả liên quan: {" "} 
                      <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"> 
                        {displayQuery} 
                      </span> 
                </h3>
                
                <div className="space-y-2">
                  {topResults.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => handleSearchResultClick(item)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                            {item.text}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.reading && (
                              <div className="truncate">{item.reading}</div>
                            )}
                            {item.meaning && (
                              <div className="truncate text-gray-600">{item.meaning}</div>
                            )}
                          </div>
                        </div>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          item.type === "KANJI" 
                            ? "bg-purple-100 text-purple-700" 
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-gray-200"> 
                {!hideHeader && (<div className="flex items-center gap-3"> 
                  {/* Kanji cấu thành */} 
                  {compoundKanjis && compoundKanjis.length > 0 && ( 
                    <div className="flex gap-2"> 
                      {compoundKanjis.map((k, i) => ( 
                        <button 
                          key={k.id || i} 
                          onClick={() => handleKanjiClick(k)} 
                          className="w-14 h-14 flex items-center justify-center text-2xl font-semibold text-gray-800 bg-white border-3 border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-100 active:bg-blue-200 transition-all" 
                          title={`${k.kanji} - ${k.hanViet}`} 
                          style={{ borderWidth: "3px" }} 
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
                          className={`px-4 py-2 rounded-lg transition-all ${ 
                            selected === i 
                              ? "bg-blue-600 text-white" 
                              : "bg-white text-gray-700 hover:bg-gray-50" 
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
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6 flex flex-col"> 
                      {/* Kanji & info */} 
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 px-[62px]"> 
                        <div className="flex-1 flex flex-col items-center md:items-start"> 
                          <div className="text-8xl font-light text-gray-800 select-text mb-4 pl-8"> 
                            {mainKanji.kanji} 
                          </div> 
                          <div className="flex items-center gap-3"> 
                            <span 
                              className={`px-3 py-1 rounded-full text-sm font-semibold border ${getJLPTColor( 
                                mainKanji.level 
                              )}`} 
                            > 
                              JLPT N{mainKanji.level || "-"} 
                            </span> 
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"> 
                              {mainKanji.strokes ?? "-"} nét 
                            </span> 
                          </div> 
                        </div> 
                        {/* ✅ Buttons - Gọi handleFavoriteClick */}
                        <div className="flex md:flex-col justify-center items-center md:items-start gap-3 mt-4 md:mt-0"> 
                          <button 
                            onClick={handleFavoriteClick}
                            disabled={isAddingToNotebook}
                            className="group p-3 rounded-full bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title={isAuthenticated ? "Lưu vào notebook" : "Đăng nhập để lưu notebook"}
                          > 
                            <span className="material-symbols-outlined text-red-500 group-hover:text-red-600 text-2xl"> 
                              favorite 
                            </span> 
                          </button> 
                          <button className="group p-3 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"> 
                            <span className="material-symbols-outlined text-blue-500 group-hover:text-blue-600 text-2xl"> 
                              share 
                            </span> 
                          </button> 
                          <button className="group p-3 rounded-full bg-green-50 hover:bg-green-100 transition-colors"> 
                            <span className="material-symbols-outlined text-green-500 group-hover:text-green-600 text-2xl"> 
                              bookmark 
                            </span> 
                          </button> 
                        </div> 
                      </div> 

                      {/* Meaning & Readings */} 
                      <div className="space-y-6"> 
                        {/* Phần Âm On (Katakana) và Âm Kun (Hiragana) */} 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                          <div className="p-4 bg-purple-50 rounded-lg"> 
                            <h3 className="font-semibold text-purple-800 mb-2"> 
                              音読み (On-yomi) 
                            </h3> 
                            <p className="text-purple-700 font-medium text-lg"> 
                              {readings.onyomi}
                            </p> 
                          </div> 
                          <div className="p-4 bg-green-50 rounded-lg"> 
                            <h3 className="font-semibold text-green-800 mb-2"> 
                              訓読み (Kun-yomi) 
                            </h3> 
                            <p className="text-green-700 font-medium text-lg"> 
                              {readings.kunyomi}
                            </p> 
                          </div> 
                        </div> 

                        {/* Phần Bộ */} 
                        <div className="p-4 bg-orange-50 rounded-lg"> 
                          <h3 className="font-semibold text-orange-800 mb-3"> 
                            Thông tin Hán tự 
                          </h3> 
                          <div className="space-y-2"> 
                            <p className="text-orange-700"> 
                              <span className="font-semibold">Hán Việt:</span>{" "} 
                              {mainKanji.hanViet || "-"} 
                            </p> 
                            <p className="text-orange-700"> 
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
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6"> 
                      <h3 className="font-bold text-lg text-gray-800 mb-4"> 
                        Câu ví dụ 
                      </h3> 
                      <div className="space-y-4"> 
                        {examples.map((ex, i) => ( 
                          <div 
                            key={ex.id || i} 
                            className="border-l-4 border-blue-200 pl-4 py-2" 
                          > 
                            <p className="text-lg font-medium text-gray-800"> 
                              {ex.sentence} 
                            </p> 
                            <p className="text-gray-500 text-sm italic">{ex.meaning}</p> 
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
                    <div className="bg-white rounded-xl shadow-lg p-6"> 
                      <div className="flex items-center justify-between mb-4"> 
                        <h3 className="font-bold text-lg text-gray-800"> 
                          Thứ tự nét viết 
                        </h3> 
                        <button 
                          onClick={handleRedrawStrokes} 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300" 
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
                  <div className="bg-white rounded-xl shadow-lg p-6"> 
                    <h3 className="font-bold text-lg text-gray-800 mb-4"> 
                      Kết quả tương tự cho:{" "} 
                      <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"> 
                        {displayQuery} 
                      </span> 
                    </h3> 
                    {compoundsForSelected.length === 0 ? ( 
                      <p className="text-gray-500 italic">Không có từ ghép liên quan</p> 
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
                              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer" 
                            > 
                              <div className="flex items-center justify-between mb-1"> 
                                <span className="text-xl font-semibold text-gray-800"> 
                                  {c.word} 
                                </span> 
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded"> 
                                  {c.hiragana || c.reading || ""} 
                                </span> 
                              </div> 
                              <p className="text-gray-600 text-sm"> 
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
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
                                compoundPage === 0 
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                  : "bg-white text-gray-700 hover:bg-gray-100 border" 
                              }`} 
                            > 
                              &lt; 
                            </button> 
                            {Array.from({ length: totalPages }).map((_, i) => ( 
                              <button 
                                key={i} 
                                onClick={() => goToPage(i)} 
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
                                  compoundPage === i 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-white text-gray-700 hover:bg-gray-100 border" 
                                }`} 
                              > 
                                {i + 1} 
                              </button> 
                            ))} 
                            <button 
                              onClick={nextPage} 
                              disabled={compoundPage === totalPages - 1} 
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
                                compoundPage === totalPages - 1 
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
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

      {/* ✅ Notification Modal */}
      <NotificationModal />
    </>
  ); 
}