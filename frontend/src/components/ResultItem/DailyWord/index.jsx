import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // 🆕 THÊM
import useNotebookStore from "../../../store/useNotebookStore";
import useSearchStore from "../../../store/useSearchStore";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useAuthStore } from "../../../store/useAuthStore";

export default function DailyWord() {
  const navigate = useNavigate(); // 🆕 THÊM
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = !!user && !!accessToken;
  
  const axiosPrivate = useAxiosPrivate();
  
  const { getSearchHistory, getSearchSuggestions } = useNotebookStore();
  const { 
    fetchCompoundDetail, 
    fetchKanjiDetail,
    fetchCompoundKanji // 🆕 THÊM
  } = useSearchStore();

  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const hasLoadedRef = useRef(false);

  // 🆕 SỬA: Xử lý khi bấm vào item trong history - tương tự Search
  const handleHistoryItemClick = useCallback(async (item) => {
    try {
      const type = item.resultType === "KANJI" ? "kanji" : "word";
      const id = item.entityId; // 🆕 SỬA: Dùng entityId thay vì item.id

      if (type === "kanji") {
        await fetchKanjiDetail(id);
      } else {
        const detail = await fetchCompoundDetail(id);
        if (detail?.id) {
          await fetchCompoundKanji(detail.id);
        }
      }

      navigate(`/search/${type}/${id}`);
    } catch (error) {
      console.error("Error loading detail:", error);
    }
  }, [fetchCompoundDetail, fetchKanjiDetail, fetchCompoundKanji, navigate]);

  // 🆕 SỬA: Xử lý khi bấm vào suggestion - cũng navigate giống Search
    const handleSuggestionClick = useCallback(async (item) => {
    try {
      const type = item.entityType === "KANJI" ? "kanji" : "word"; // 🆕 SỬA: Gán string "kanji" hoặc "word"
      const id = item.entityId;

      if (item.entityType === "KANJI") { // 🆕 SỬA: Kiểm tra entityType trực tiếp
        await fetchKanjiDetail(id);
      } else {
        const detail = await fetchCompoundDetail(id);
        if (detail?.id) {
          await fetchCompoundKanji(detail.id);
        }
      }

      navigate(`/search/${type}/${id}`);
    } catch (error) {
      console.error("Error loading detail:", error);
    }
  }, [fetchCompoundDetail, fetchKanjiDetail, fetchCompoundKanji, navigate]);

    const loadHistoryAndSuggestions = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setSuggestionsLoading(true);
      setDebugInfo("Loading...");

      // FETCH HISTORY
      const historyData = await getSearchHistory(axiosPrivate, 0, 20);
      
      if (historyData && historyData.items) {
        setSearchHistory(historyData.items.slice(0, 20));
      } else {
        setSearchHistory([]);
      }

      // Đợi refresh token hoàn tất
      await new Promise(resolve => setTimeout(resolve, 500));

      // FETCH SUGGESTIONS
      try {
        const suggestionsData = await getSearchSuggestions(axiosPrivate);
        
        if (suggestionsData && suggestionsData.items && suggestionsData.items.length > 0) {
          // 🆕 THÊM: Shuffle và lấy 4 random items
          const shuffled = suggestionsData.items
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
          
          setSuggestedWords(shuffled);
          setDebugInfo(`✅ Loaded ${suggestionsData.items.length} suggestions`);
        } else {
          setSuggestedWords([]);
          setDebugInfo("⚠️ No suggestions returned from API");
        }
      } catch (suggestionError) {
        setDebugInfo(`❌ Error: ${suggestionError.message}`);
        
        if (suggestionError.response?.status === 401) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            const retryData = await getSearchSuggestions(axiosPrivate, 5);
            
            if (retryData && retryData.items && retryData.items.length > 0) {
              // 🆕 THÊM: Shuffle retry data cũng
              const shuffled = retryData.items
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
              
              setSuggestedWords(shuffled);
              setDebugInfo(`✅ Retry loaded ${retryData.items.length} suggestions`);
            } else {
              setSuggestedWords([]);
              setDebugInfo("⚠️ Retry returned empty");
            }
          } catch (retryError) {
            setSuggestedWords([]);
            setDebugInfo(`❌ Retry failed: ${retryError.message}`);
          }
        } else {
          setSuggestedWords([]);
        }
      }
    } catch (error) {
      setSearchHistory([]);
      setSuggestedWords([]);
      setDebugInfo(`❌ Fatal error: ${error.message}`);
    } finally {
      setHistoryLoading(false);
      setSuggestionsLoading(false);
    }
  }, [axiosPrivate, getSearchHistory, getSearchSuggestions]);

  useEffect(() => {
    if (isAuthenticated && user && accessToken && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadHistoryAndSuggestions();
    } else if (!isAuthenticated || !user || !accessToken) {
      hasLoadedRef.current = false;
      setSearchHistory([]);
      setSuggestedWords([]);
      setDebugInfo("");
    }
  }, [isAuthenticated, user?.id, accessToken, loadHistoryAndSuggestions]);

  if (!user || !accessToken) {
    return (
      <>
        <div className="p-6 bg-gradient-to-r from-[#2F4454]/5 via-[#DA7B93]/5 to-[#2F4454]/5 rounded-xl shadow-sm border border-[#DA7B93]/10">
          <h3 className="font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-3 text-xl">
            Study Tip of the Day
          </h3>
          <p className="leading-relaxed px-4 py-3 rounded-lg text-[#2F4454] font-medium bg-gradient-to-r from-[#2F4454]/10 via-[#DA7B93]/10 to-[#2F4454]/10 shadow-inner border border-[#DA7B93]/10">
            Practice writing Kanji characters daily to improve retention.
            Try the "spaced repetition" technique for better memory!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white">
            <h3 className="font-bold text-[#2F4454] mb-4 ml-6 text-lg">
              Gợi ý hôm nay
            </h3>
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-[#DA7B93] text-4xl">
                lock
              </span>
              <p className="text-[#2F4454]/70 text-center">
                Vui lòng <span className="font-semibold">đăng nhập</span> để xem gợi ý học tập
              </p>
            </div>
          </div>

          <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
            <h3 className="font-bold text-[#2F4454] mb-4 text-lg">Lịch sử đã tra</h3>
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-[#DA7B93] text-4xl">
                lock
              </span>
              <p className="text-[#2F4454]/70 text-center">
                Vui lòng <span className="font-semibold">đăng nhập</span> để xem lịch sử tìm kiếm
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-6 bg-gradient-to-r from-[#2F4454]/5 via-[#DA7B93]/5 to-[#2F4454]/5 rounded-xl shadow-sm border border-[#DA7B93]/10">
        <h3 className="font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-3 text-xl">
          Study Tip of the Day
        </h3>
        <p className="leading-relaxed px-4 py-3 rounded-lg text-[#2F4454] font-medium bg-gradient-to-r from-[#2F4454]/10 via-[#DA7B93]/10 to-[#2F4454]/10 shadow-inner border border-[#DA7B93]/10">
          Practice writing Kanji characters daily to improve retention.
          Try the "spaced repetition" technique for better memory!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gợi ý hôm nay */}
        <div className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white">
          <h3 className="font-bold text-[#2F4454] mb-4 ml-6 text-lg">
            Gợi ý hôm nay
          </h3>
          
          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined text-[#DA7B93] animate-spin">
                hourglass_empty
              </span>
              <p className="ml-2 text-sm text-[#DA7B93]">Đang tải...</p>
            </div>
          ) : suggestedWords.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {suggestedWords.map((word, i) => (
                <div key={i} className="flex items-start gap-2">
                  <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:text-[#DA7B93] transition-colors">
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "22px",
                        width: "24px",
                        height: "24px",
                        display: "inline-block",
                      }}
                      title="Play audio"
                    >
                      volume_up
                    </span>
                  </button>
                  <div 
                    className="flex-1 min-w-0 cursor-pointer hover:text-[#DA7B93] transition-colors"
                    onClick={() => handleSuggestionClick(word)} // 🆕 SỬA
                  >
                    <div className="text-lg font-bold text-[#2F4454]">
                      {word.display}
                    </div>
                    <div className="text-sm text-[#2F4454]">{word.meaning}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <span className="material-symbols-outlined text-[#DA7B93] text-3xl">
                inbox
              </span>
              <p className="text-[#2F4454]/70 text-center text-sm">Chưa có gợi ý nào.</p>
              {debugInfo && (
                <p className="text-xs text-red-500 mt-2 text-center bg-red-50 p-2 rounded">
                  {debugInfo}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Lịch sử đã tra */}
        <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
          <h3 className="font-bold text-[#2F4454] mb-4 text-lg">Lịch sử đã tra</h3>
          
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined text-[#DA7B93] animate-spin">
                hourglass_empty
              </span>
              <p className="ml-2 text-sm text-[#DA7B93]">Đang tải...</p>
            </div>
          ) : searchHistory.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryItemClick(item)} // 🆕 SỬA
                  className="px-3 py-1 bg-[#2F4454]/5 rounded-full text-sm text-[#2F4454] hover:bg-[#DA7B93]/10 hover:text-[#DA7B93] transition-all border border-[#2F4454]/10 group relative"
                  title={`${item.searchTerm} - ${item.resultType}`}
                >
                  {item.searchTerm}
                  <span className="hidden group-hover:inline-block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap text-xs bg-[#2F4454] text-white px-2 py-1 rounded">
                    {item.resultType}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[#2F4454]/70 text-center py-4">Chưa có lịch sử tìm kiếm.</p>
          )}
        </div>
      </div>
    </>
  );
}