import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../../../store/useSearchStore";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useNotebookStore from "../../../store/useNotebookStore"; // ✅ THÊM
import { useAuthStore } from "../../../store/useAuthStore";
import NotebookSelectionModal from "../../../components/Notebooks/NBList";
import NotebookCreateModal from "../../../components/Notebooks/NBCreate";
import LoginModal from "../../../components/Login";

export default function WordResult({
  word,
  hiragana,
  meaning,
  examples = [],
  relatedWords = [],
  query = "",
}) {
  const navigate = useNavigate();
  const axiosPrivateHook = useAxiosPrivate();
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = !!user && !!accessToken;

  // ✅ LẤY TỪSTORE
  const addEntryToNotebook = useNotebookStore(
    (state) => state.addEntryToNotebook
  );
  const entryExists = useNotebookStore((state) => state.entryExists);

  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAddingToNotebook, setIsAddingToNotebook] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState(null);

  // ✅ State cho notification
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
  } = useSearchStore();

  const displayQuery = queryFromStore || query || word || "-";

  // ✅ Effect cho notification countdown
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

  const handleNavigate = async (id, type, newWord = "") => {
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
  };

  const handleRelatedWordClick = (relatedWord) => {
    if (!relatedWord?.id) return;

    if (relatedWord.word) {
      setQuery(relatedWord.word);
    }

    setCurrentWordId(relatedWord.id);
    handleNavigate(relatedWord.id, "word", relatedWord.word);
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const currentWordId = useSearchStore.getState().currentWordId;
    setSelectedWordId(currentWordId || word);
    setShowNotebookModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    const currentWordId = useSearchStore.getState().currentWordId;
    setSelectedWordId(currentWordId || word);
    setShowNotebookModal(true);
  };

  // ✅ SỬA: Dùng store để add entry
  const handleSelectNotebook = async (notebook) => {
    try {
      setIsAddingToNotebook(true);

      // ✅ SỬA: Lấy entityId đúng - phải là số ID, không phải từ string
      const currentWordId = useSearchStore.getState().currentWordId;
      const entityId = selectedWordId || currentWordId;

      console.log("🔍 [WordResult handleSelectNotebook] Debug:", {
        selectedWordId,
        currentWordId,
        entityId,
        wordText: word,
        type: "COMPOUND",
        notebookId: notebook.id,
      });

      // ✅ Validate entityId - phải là số hợp lệ
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

      // ✅ Kiểm tra từ trùng TRƯỚC - dùng COMPOUND thay vì COMPOUND_WORD
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

      // ✅ Lấy axios instance
      const axiosInstance = axiosPrivateHook;

      // ✅ Dùng store function - truyền COMPOUND
      const result = await addEntryToNotebook(
        axiosInstance,
        notebook.id,
        "COMPOUND",
        Number(entityId)
      );

      console.log("✅ [WordResult] Backend response received:", result);

      // ✅ Thành công
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

      // ✅ Xử lý lỗi
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
    setSelectedWordId(null);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleSwitchToRegister = () => {
    console.log("Switch to register modal");
  };

  // ✅ Component Notification Modal
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
        <div
          className={`bg-white rounded-2xl shadow-2xl border ${theme.border} p-6 max-w-sm transform animate-slide-in-right`}
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
                <div
                  className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor:
                      notification.type === "success"
                        ? "#22c55e"
                        : notification.type === "warning"
                        ? "#f59e0b"
                        : "#ef4444",
                    animation: `spin ${notificationCountdown}s linear`,
                  }}
                ></div>
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

  return (
    <>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-7 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Kết quả cho:{" "}
            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              {displayQuery}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Word Content */}
          <div className="xl:col-span-2">
            {/* Main Word Display */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="mb-8 text-left">
                <div className="flex justify-between items-start mb-4 px-[20px]">
                  {/* Left side: Word + Reading */}
                  <div className="text-center">
                    <div className="text-8xl font-light text-gray-800 select-text">
                      {word}
                    </div>
                    <div className="text-2xl text-gray-600 font-medium mt-3">
                      {hiragana}
                    </div>
                  </div>

                  {/* Right side: Action buttons */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <button
                      onClick={handleFavoriteClick}
                      disabled={isAddingToNotebook}
                      className="group p-1 rounded-full bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                      title={
                        isAuthenticated
                          ? "Lưu vào notebook"
                          : "Đăng nhập để lưu notebook"
                      }
                    >
                      <span className="material-symbols-outlined text-red-500 group-hover:text-red-600 text-base">
                        favorite
                      </span>
                    </button>
                    <button className="group p-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                      <span className="material-symbols-outlined text-blue-500 group-hover:text-blue-600 text-base">
                        share
                      </span>
                    </button>
                    <button className="group p-1 rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                      <span className="material-symbols-outlined text-green-500 group-hover:text-green-600 text-base">
                        bookmark
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Meaning */}
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Ý nghĩa</h3>
                  <p className="text-blue-700 font-medium">{meaning}</p>
                </div>
              </div>
            </div>

            {/* Examples */}
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
                        {ex.sentence || ex.example}
                      </p>
                      {ex.meaning && (
                        <p className="text-gray-500 text-sm italic">
                          {ex.meaning}
                        </p>
                      )}
                      {ex.meaningEn && (
                        <p className="text-gray-400 text-sm">{ex.meaningEn}</p>
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
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">
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
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl font-semibold text-gray-800">
                          {k.kanji}
                        </span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {k.hanViet}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Level: {k.level} | ON: {k.onyomi} | KUN: {k.kunyomi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Từ liên quan */}
            {relatedWords.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  Từ liên quan với{" "}
                  <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
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
                      className="border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-semibold text-gray-800">
                          {relatedWord.word}
                        </span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {relatedWord.reading || relatedWord.hiragana || ""}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {relatedWord.meaning || relatedWord.meaningEn || ""}
                      </p>
                      {relatedWord.partOfSpeech && (
                        <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
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

      {/* ✅ Notification Modal */}
      <NotificationModal />
    </>
  );
}
