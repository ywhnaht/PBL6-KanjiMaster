import React from "react";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../../../store/useSearchStore";

export default function WordResult({
  word,
  hiragana,
  meaning,
  examples = [],
  relatedWords = [],
  query = "",
}) {
  const navigate = useNavigate();
  const {
    compoundKanjis,
    fetchKanjiDetail,
    fetchCompoundDetail,
    fetchCompoundKanji,
    setQuery,
    setCurrentWordId,
    query: queryFromStore, // 🆕 Lấy query từ store
  } = useSearchStore();

  // 🔧 Ưu tiên query từ store (giá trị gốc người dùng gõ)
  const displayQuery = queryFromStore || query || word || "-";

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

  return (
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
                  <button className="group p-1 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
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
  );
}