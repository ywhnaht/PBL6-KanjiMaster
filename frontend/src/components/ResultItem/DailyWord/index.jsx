import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useNotebookStore from "../../../store/useNotebookStore";
import useSearchStore from "../../../store/useSearchStore";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useAuthStore } from "../../../store/useAuthStore";
import useDarkModeStore from "../../../store/useDarkModeStore";

export default function DailyWord() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const isDark = useDarkModeStore((state) => state.isDark);
  const isAuthenticated = !!user && !!accessToken;
  
  const axiosPrivate = useAxiosPrivate();
  
  const { getSearchHistory, getSearchSuggestions } = useNotebookStore();
  const { 
    fetchCompoundDetail, 
    fetchKanjiDetail,
    fetchCompoundKanji
  } = useSearchStore();

  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const hasLoadedRef = useRef(false);

  const handleHistoryItemClick = useCallback(async (item) => {
    try {
      const type = item.resultType === "KANJI" ? "kanji" : "word";
      const id = item.entityId;

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

  const handleSuggestionClick = useCallback(async (item) => {
    try {
      const type = item.entityType === "KANJI" ? "kanji" : "word";
      const id = item.entityId;

      if (item.entityType === "KANJI") {
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

      await new Promise(resolve => setTimeout(resolve, 500));

      // FETCH SUGGESTIONS
      try {
        const suggestionsData = await getSearchSuggestions(axiosPrivate);
        
        if (suggestionsData && suggestionsData.items && suggestionsData.items.length > 0) {
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
        <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800/50 border-blue-400/20'
            : 'bg-gradient-to-r from-[#2F4454]/5 via-[#DA7B93]/5 to-[#2F4454]/5 border-[#DA7B93]/10'
        }`}>
          <h3 className={`font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-3 text-xl`}>
            Study Tip of the Day
          </h3>
          <p className={`leading-relaxed px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
            isDark
              ? 'bg-slate-700/50 text-slate-200 border border-slate-600'
              : 'text-[#2F4454] bg-gradient-to-r from-[#2F4454]/10 via-[#DA7B93]/10 to-[#2F4454]/10 border border-[#DA7B93]/10'
          }`}>
            Practice writing Kanji characters daily to improve retention.
            Try the "spaced repetition" technique for better memory!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${
            isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ml-6 text-lg transition-colors duration-300 ${
              isDark ? 'text-slate-100' : 'text-[#2F4454]'
            }`}>
              Gợi ý hôm nay
            </h3>
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-[#DA7B93] text-4xl">
                lock
              </span>
              <p className={`text-center transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-[#2F4454]/70'
              }`}>
                Vui lòng <span className="font-semibold">đăng nhập</span> để xem gợi ý học tập
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-300 ${
            isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 text-lg transition-colors duration-300 ${
              isDark ? 'text-slate-100' : 'text-[#2F4454]'
            }`}>Lịch sử đã tra</h3>
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-[#DA7B93] text-4xl">
                lock
              </span>
              <p className={`text-center transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-[#2F4454]/70'
              }`}>
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
      <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800/50 border-blue-400/20'
          : 'bg-gradient-to-r from-[#2F4454]/5 via-[#DA7B93]/5 to-[#2F4454]/5 border-[#DA7B93]/10'
      }`}>
        <h3 className={`font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-3 text-xl`}>
          Study Tip of the Day
        </h3>
        <p className={`leading-relaxed px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
          isDark
            ? 'bg-slate-700/50 text-slate-200 border border-slate-600'
            : 'text-[#2F4454] bg-gradient-to-r from-[#2F4454]/10 via-[#DA7B93]/10 to-[#2F4454]/10 border border-[#DA7B93]/10'
        }`}>
          Practice writing Kanji characters daily to improve retention.
          Try the "spaced repetition" technique for better memory!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gợi ý hôm nay */}
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800 border border-slate-700'
            : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`font-bold mb-4 ml-6 text-lg transition-colors duration-300 ${
            isDark ? 'text-slate-100' : 'text-[#2F4454]'
          }`}>
            Gợi ý hôm nay
          </h3>
          
          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined text-[#DA7B93] animate-spin">
                hourglass_empty
              </span>
              <p className={`ml-2 text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-[#DA7B93]'
              }`}>Đang tải...</p>
            </div>
          ) : suggestedWords.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {suggestedWords.map((word, i) => (
                <div key={i} className="flex items-start gap-2">
                  <button className={`w-8 h-8 flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${
                    isDark
                      ? 'hover:text-blue-400 text-slate-300'
                      : 'hover:text-[#DA7B93] text-gray-600'
                  }`}>
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
                    className={`flex-1 min-w-0 cursor-pointer transition-colors duration-300 ${
                      isDark
                        ? 'hover:text-blue-400 text-slate-200'
                        : 'hover:text-[#DA7B93] text-gray-900'
                    }`}
                    onClick={() => handleSuggestionClick(word)}
                  >
                    <div className="text-lg font-bold">
                      {word.display}
                    </div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>{word.meaning}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <span className="material-symbols-outlined text-[#DA7B93] text-3xl">
                inbox
              </span>
              <p className={`text-center text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-[#2F4454]/70'
              }`}>Chưa có gợi ý nào.</p>
              {debugInfo && (
                <p className={`text-xs mt-2 text-center p-2 rounded transition-colors duration-300 ${
                  isDark
                    ? 'text-red-400 bg-red-900/30'
                    : 'text-red-500 bg-red-50'
                }`}>
                  {debugInfo}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Lịch sử đã tra */}
        <div className={`p-6 rounded-xl shadow-sm transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800 border border-slate-700'
            : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`font-bold mb-4 text-lg transition-colors duration-300 ${
            isDark ? 'text-slate-100' : 'text-[#2F4454]'
          }`}>Lịch sử đã tra</h3>
          
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined text-[#DA7B93] animate-spin">
                hourglass_empty
              </span>
              <p className={`ml-2 text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-[#DA7B93]'
              }`}>Đang tải...</p>
            </div>
          ) : searchHistory.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryItemClick(item)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 border ${
                    isDark
                      ? 'bg-slate-700/50 text-slate-200 border-slate-600 hover:bg-blue-600/30 hover:text-blue-300 hover:border-blue-500'
                      : 'bg-[#2F4454]/5 text-[#2F4454] border-[#2F4454]/10 hover:bg-[#DA7B93]/10 hover:text-[#DA7B93] hover:border-[#DA7B93]'
                  }`}
                  title={`${item.searchTerm} - ${item.resultType}`}
                >
                  {item.searchTerm}
                  <span className={`hidden group-hover:inline-block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap text-xs px-2 py-1 rounded transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-600 text-slate-100'
                      : 'bg-[#2F4454] text-white'
                  }`}>
                    {item.resultType}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className={`text-center py-4 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-[#2F4454]/70'
            }`}>Chưa có lịch sử tìm kiếm.</p>
          )}
        </div>
      </div>
    </>
  );
}