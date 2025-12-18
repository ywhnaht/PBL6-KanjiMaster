import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../../../store/useSearchStore";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useNotebookStore from "../../../store/useNotebookStore";
import useDarkModeStore from "../../../store/useDarkModeStore";
import { useAuthStore } from "../../../store/useAuthStore";
import NotebookSelectionModal from "../../../components/Notebooks/NBList";
import NotebookCreateModal from "../../../components/Notebooks/NBCreate";
import LoginModal from "../../../components/Login";
import SuggestionModal from "../../../components/SuggestionModal";

// ✅ Extract NotificationModal thành component riêng
const NotificationModalComponent = React.memo(
  ({ notification, notificationCountdown, isDark, onClose }) => {
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
        <div
          className={`rounded-2xl shadow-2xl border ${theme.border} p-6 max-w-sm transform animate-slide-in-right transition-colors duration-300 ${
            isDark ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${theme.bg} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <span
                className={`material-symbols-outlined ${theme.icon} text-lg`}
              >
                {iconMap[notification.type] || "info"}
              </span>
            </div>

            <div className="flex-1">
              <h3
                className={`font-bold text-lg bg-gradient-to-r ${theme.bg} bg-clip-text text-transparent`}
              >
                {notification.title}
              </h3>
              <p
                className={`${theme.text} text-sm leading-relaxed transition-colors duration-300`}
              >
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
  }
);

NotificationModalComponent.displayName = "NotificationModalComponent";

export default function WordResult({
  word,
  reading,
  hiragana,
  meaning,
  examples = [],
  relatedWords = [],
  query = "",
}) {
  const navigate = useNavigate();
  const axiosPrivateHook = useAxiosPrivate();
  const { user, accessToken } = useAuthStore();
  const isDark = useDarkModeStore((state) => state.isDark);
  const isAuthenticated = !!user && !!accessToken;

  const addEntryToNotebook = useNotebookStore(
    (state) => state.addEntryToNotebook
  );
  const entryExists = useNotebookStore((state) => state.entryExists);

  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAddingToNotebook, setIsAddingToNotebook] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionType, setSuggestionType] = useState('ADD_COMPOUND');
  const [notification, setNotification] = useState(null);
  const [notificationCountdown, setNotificationCountdown] = useState(3);

  const {
    compoundKanjis,
    fetchKanjiDetail,
    fetchCompoundDetail,
    fetchCompoundKanji,
    setQuery,
    setCurrentWordId,
    query: queryFromStore,
    // eslint-disable-next-line no-unused-vars
    currentWordId,
  } = useSearchStore();

  const displayQuery = queryFromStore || query || word || "-";

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

  // ✅ Memoize handleNavigate
  const handleNavigate = useCallback(
    async (id, type, newWord = "") => {
      if (!id) return;

      if (newWord) {
        setQuery(newWord);
      }

      if (type === "kanji") {
        await fetchKanjiDetail(id);
      } else {
        await fetchCompoundDetail(id);
        await fetchCompoundKanji(id);
        setCurrentWordId(id);
      }

      navigate(`/search/${type}/${id}`);
    },
    [setQuery, fetchKanjiDetail, fetchCompoundDetail, fetchCompoundKanji, setCurrentWordId, navigate]
  );

  // ✅ Memoize handleRelatedWordClick
  const handleRelatedWordClick = useCallback(
    (relatedWord) => {
      if (!relatedWord?.id) return;

      if (relatedWord.word) {
        setQuery(relatedWord.word);
      }

      setCurrentWordId(relatedWord.id);
      handleNavigate(relatedWord.id, "word", relatedWord.word);
    },
    [setQuery, setCurrentWordId, handleNavigate]
  );

  // ✅ Memoize handleFavoriteClick
  const handleFavoriteClick = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const currentWordIdFromStore = useSearchStore.getState().currentWordId;
    setSelectedWordId(currentWordIdFromStore || word);
    setShowNotebookModal(true);
  }, [isAuthenticated, word]);

  // ✅ Memoize handleLoginSuccess
  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
    const currentWordIdFromStore = useSearchStore.getState().currentWordId;
    setSelectedWordId(currentWordIdFromStore || word);
    setShowNotebookModal(true);
  }, [word]);

  // ✅ Memoize handleSelectNotebook
  const handleSelectNotebook = useCallback(
    async (notebook) => {
      try {
        setIsAddingToNotebook(true);

        const currentWordIdFromStore = useSearchStore.getState().currentWordId;
        const entityId = selectedWordId || currentWordIdFromStore;

        console.log("🔍 [WordResult handleSelectNotebook] Debug:", {
          selectedWordId,
          currentWordId: currentWordIdFromStore,
          entityId,
          wordText: word,
          type: "COMPOUND",
          notebookId: notebook.id,
        });

        if (
          !entityId ||
          entityId === 0 ||
          entityId === undefined ||
          entityId === null
        ) {
          throw new Error(
            `❌ Word ID không hợp lệ: ${entityId}. Vui lòng reload trang!`
          );
        }

        console.log("🔍 [WordResult] Checking if entry exists:", {
          entityId,
          entityType: "COMPOUND",
          notebook: notebook.name,
        });

        if (entryExists(entityId, "COMPOUND")) {
          console.warn("⚠️ [WordResult] Entry already exists in notebook");
          setNotification({
            type: "warning",
            title: "Từ đã tồn tại!",
            message: `Từ "${word}" đã có trong notebook "${notebook.name}"`,
            icon: "info",
          });
          setIsAddingToNotebook(false);
          return;
        }

        console.log("📤 [WordResult] Sending request to backend:", {
          notebookId: notebook.id,
          entityType: "COMPOUND",
          entityId: Number(entityId),
          word,
        });

        const axiosInstance = axiosPrivateHook;

        const result = await addEntryToNotebook(
          axiosInstance,
          notebook.id,
          "COMPOUND",
          Number(entityId)
        );

        console.log("✅ [WordResult] Backend response received:", result);

        setNotification({
          type: "success",
          title: "Lưu thành công!",
          message: `Từ "${word}" đã được lưu vào notebook "${notebook.name}"`,
          icon: "bookmark_add",
        });
        setShowNotebookModal(false);
      } catch (error) {
        console.error("❌ [WordResult handleSelectNotebook] Error occurred:", {
          message: error.message,
          status: error.response?.status,
          responseData: error.response?.data,
          fullError: error,
        });

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Không thể lưu từ vựng";

        if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("tồn tại")
        ) {
          setNotification({
            type: "warning",
            title: "Từ đã tồn tại!",
            message: `Từ "${word}" đã có trong notebook này`,
            icon: "info",
          });
        } else if (
          errorMessage.includes("0") ||
          errorMessage.includes("không hợp lệ")
        ) {
          setNotification({
            type: "error",
            title: "Lỗi Dữ Liệu!",
            message: "Word ID không hợp lệ. Vui lòng reload trang!",
            icon: "error",
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
    },
    [selectedWordId, entryExists, addEntryToNotebook, axiosPrivateHook, word]
  );

  // ✅ Memoize handleCreateNotebook
  const handleCreateNotebook = useCallback(() => {
    setShowNotebookModal(false);
    setShowCreateModal(true);
  }, []);

  // ✅ Memoize handleCreateSuccess
  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    setShowNotebookModal(true);
  }, []);

  // ✅ Memoize handleCloseCreateModal
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setShowNotebookModal(true);
  }, []);

  // ✅ Memoize handleCloseNotebookModal
  const handleCloseNotebookModal = useCallback(() => {
    setShowNotebookModal(false);
    setSelectedWordId(null);
  }, []);

  // ✅ Memoize handleCloseLoginModal
  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  // ✅ Memoize handleCloseNotification
  const handleCloseNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // ✅ Memoize handleSwitchToRegister
  const handleSwitchToRegister = useCallback(() => {
    console.log("Switch to register modal");
  }, []);

  return (
    <>
      <div className="w-full space-y-6">
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-7 border-b transition-colors duration-300 ${
            isDark ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? "text-slate-100" : "text-gray-800"
            }`}
          >
            Kết quả cho:{" "}
             <span
              className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                isDark
                  ? "text-blue-300 bg-blue-900/30"
                  : "text-blue-600 bg-blue-50"
              }`}
            >
              {displayQuery}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Word Content */}
          <div className="xl:col-span-2">
            {/* Main Word Display */}
            <div
              className={`rounded-xl shadow-lg p-8 mb-6 transition-colors duration-300 ${
                isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
              }`}
            >
              <div className="mb-8 text-left">
                <div className="flex justify-between items-start mb-4 px-[20px]">
                  {/* Left side: Word + Reading */}
                  <div className="text-center">
                    <div className={`text-8xl font-light select-text transition-colors duration-300 ${
                      isDark ? "text-slate-100" : "text-gray-800"
                    }`}>
                      {word}
                    </div>
                    <div className={`text-2xl font-medium mt-3 transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-gray-600"
                    }`}>
                      {hiragana}
                    </div>
                  </div>

                  {/* Right side: Action buttons */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <button
                      onClick={handleFavoriteClick}
                      disabled={isAddingToNotebook}
                      className={`group p-1 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                        isDark
                          ? "bg-red-900/30 hover:bg-red-800/50"
                          : "bg-red-50 hover:bg-red-100"
                      }`}
                      title={
                        isAuthenticated
                          ? "Lưu vào notebook"
                          : "Đăng nhập để lưu notebook"
                      }
                    >
                      <span className={`material-symbols-outlined text-base transition-colors duration-300 ${
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
                      className={`group p-1 rounded-full transition-colors duration-300 ${
                      isDark
                        ? "bg-blue-900/30 hover:bg-blue-800/50"
                        : "bg-blue-50 hover:bg-blue-100"
                      }`}
                      title={isAuthenticated ? "Báo lỗi / Sửa đổi" : "Đăng nhập để báo lỗi"}
                    >
                      <span className={`material-symbols-outlined text-base transition-colors duration-300 ${
                        isDark
                          ? "text-blue-400 group-hover:text-blue-300"
                          : "text-blue-500 group-hover:text-blue-600"
                      }`}>
                        flag
                      </span>
                    </button>
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowLoginModal(true);
                          return;
                        }
                        setSuggestionType('ADD_COMPOUND');
                        setShowSuggestionModal(true);
                      }}
                      className={`group p-1 rounded-full transition-colors duration-300 ${
                      isDark
                        ? "bg-green-900/30 hover:bg-green-800/50"
                        : "bg-green-50 hover:bg-green-100"
                      }`}
                      title={isAuthenticated ? "Đề xuất thêm từ ghép mới" : "Đăng nhập để đề xuất"}
                    >
                      <span className={`material-symbols-outlined text-base transition-colors duration-300 ${
                        isDark
                          ? "text-green-400 group-hover:text-green-300"
                          : "text-green-500 group-hover:text-green-600"
                      }`}>
                        add_circle
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Meaning */}
              <div className="space-y-6">
                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  isDark
                    ? "bg-blue-900/30 border border-blue-700"
                    : "bg-blue-50"
                }`}>
                  <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? "text-blue-300" : "text-blue-800"
                  }`}>
                    Ý nghĩa
                  </h3>
                  <p className={`font-medium transition-colors duration-300 ${
                    isDark ? "text-blue-200" : "text-blue-700"
                  }`}>
                    {meaning}
                  </p>
                </div>
              </div>
            </div>

            {/* Examples */}
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
                        {ex.sentence || ex.example}
                      </p>
                      {ex.meaning && (
                        <p className={`text-sm italic transition-colors duration-300 ${
                          isDark ? "text-slate-400" : "text-gray-500"
                        }`}>
                          {ex.meaning}
                        </p>
                      )}
                      {ex.meaningEn && (
                        <p className={`text-sm transition-colors duration-300 ${
                          isDark ? "text-slate-500" : "text-gray-400"
                        }`}>
                          {ex.meaningEn}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Kanji cấu thành và Từ liên quan */}
          <div className="space-y-6">
            {/* Kanji cấu thành */}
            {compoundKanjis && compoundKanjis.length > 0 && (
              <div className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
                isDark
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-white"
              }`}>
                <h3 className={`font-bold text-lg mb-4 transition-colors duration-300 ${
                  isDark ? "text-slate-100" : "text-gray-800"
                }`}>
                  Kanji cấu thành
                </h3>
                <div className="space-y-3">
                  {compoundKanjis.map((k, i) => (
                    <div
                      key={k.id || i}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNavigate(k.id, "kanji", k.kanji)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNavigate(k.id, "kanji", k.kanji);
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
                          {k.kanji}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded transition-colors duration-300 ${
                          isDark
                            ? "text-slate-300 bg-slate-700"
                            : "text-gray-500 bg-gray-100"
                        }`}>
                          {k.hanViet}
                        </span>
                      </div>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDark ? "text-slate-400" : "text-gray-600"
                      }`}>
                        Level: {k.level} | ON: {k.onyomi} | KUN: {k.kunyomi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Từ liên quan */}
            {relatedWords.length > 0 && (
              <div className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
                isDark
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-white"
              }`}>
                <h3 className={`font-bold text-lg mb-4 transition-colors duration-300 ${
                  isDark ? "text-slate-100" : "text-gray-800"
                }`}>
                  Từ liên quan với{" "}
                  <span className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                    isDark
                      ? "text-blue-300 bg-blue-900/30"
                      : "text-blue-600 bg-blue-50"
                  }`}>
                    {displayQuery}
                  </span>
                </h3>
                <div className="space-y-3">
                  {relatedWords.map((relatedWord, i) => (
                    <div
                      key={relatedWord.id || i}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleRelatedWordClick(relatedWord)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRelatedWordClick(relatedWord);
                        }
                      }}
                      className={`border rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                        isDark
                          ? "border-slate-600 hover:border-green-500 hover:bg-green-900/20"
                          : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-lg font-semibold transition-colors duration-300 ${
                          isDark ? "text-slate-100" : "text-gray-800"
                        }`}>
                          {relatedWord.word}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded transition-colors duration-300 ${
                          isDark
                            ? "text-slate-300 bg-slate-700"
                            : "text-gray-500 bg-gray-100"
                        }`}>
                          {relatedWord.reading || relatedWord.hiragana || ""}
                        </span>
                      </div>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDark ? "text-slate-400" : "text-gray-600"
                      }`}>
                        {relatedWord.meaning || relatedWord.meaningEn || ""}
                      </p>
                      {relatedWord.partOfSpeech && (
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full transition-colors duration-300 ${
                          isDark
                            ? "bg-purple-900/30 text-purple-300"
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {relatedWord.partOfSpeech}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal đăng nhập */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {/* Modal chọn notebook */}
      <NotebookSelectionModal
        isOpen={showNotebookModal}
        onClose={handleCloseNotebookModal}
        onSelectNotebook={handleSelectNotebook}
        onCreateNotebook={handleCreateNotebook}
      />

      {/* Modal tạo notebook mới */}
      <NotebookCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* Suggestion Modal */}
      <SuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        type={suggestionType}
        initialData={{
          word: word,
          reading: reading,
          hiragana: hiragana,
          meaning: meaning
        }}
      />

      {/* Notification Modal */}
      <NotificationModalComponent
        notification={notification}
        notificationCountdown={notificationCountdown}
        isDark={isDark}
        onClose={handleCloseNotification}
      />
    </>
  );
}