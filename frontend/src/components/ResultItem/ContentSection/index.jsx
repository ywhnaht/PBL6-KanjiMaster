import React from "react";
import DailyWord from "../DailyWord";
import SearchResult from "../SearchResult";
import useDarkModeStore from "../../../store/useDarkModeStore";

export default function ContentSection({ 
  query, 
  type, 
  results = [], 
  history = [],
  axiosPrivateHook,
  isAuthenticated,
  accessToken
}) {
  const isDark = useDarkModeStore((state) => state.isDark);
  const firstResult = results[0];

  const wordData = {
    word: firstResult?.word || query,
    reading: firstResult?.reading || "",
    meaning: firstResult?.meaning || "",
    compounds: [
      { word: "恋愛", reading: "れんあい", meaning: "tình yêu, romance" },
      { word: "片思い", reading: "かたおもい", meaning: "yêu đơn phương" },
    ],
    examples: [
      {
        jp: "彼女に恋をしています。",
        vi: "Tôi đang yêu cô ấy.",
        en: "I am in love with her.",
      },
      {
        jp: "初恋は忘れられません。",
        vi: "Mối tình đầu không thể quên.",
        en: "First love is unforgettable.",
      },
    ],
    relatedResults: [
      { word: "愛", reading: "あい", meaning: "ái, tình yêu" },
      { word: "情", reading: "じょう", meaning: "tình cảm" },
    ],
  };

  const kanjiList = (firstResult?.kanji || query || "")
    .split("")
    .map((char) => {
      switch (char) {
        case "恋":
          return {
            kanji: "恋",
            jlpt: "N5",
            strokes: 10,
            meaning: "love, romance, affection",
            onyomi: "レン (REN)",
            kunyomi: "こい (koi), こい.する (koi suru)",
            sinoViet: "luyến, liên",
            nativeViet: "tình yêu, sự yêu đương",
          };
        case "愛":
          return {
            kanji: "愛",
            jlpt: "N4",
            strokes: 13,
            meaning: "love, affection",
            onyomi: "アイ (AI)",
            kunyomi: "いと.しい (itoshii)",
            sinoViet: "ái",
            nativeViet: "tình yêu, yêu thương",
          };
        default:
          return {
            kanji: char,
            jlpt: "N?",
            strokes: "?",
            meaning: "Chưa có dữ liệu",
            onyomi: "-",
            kunyomi: "-",
            sinoViet: "-",
            nativeViet: "-",
          };
      }
    });

  return (
    <div className={`rounded-2xl shadow-lg p-8 transition-colors duration-300 ${
      isDark
        ? 'bg-slate-800 border border-slate-700'
        : 'bg-white'
    }`}>
      <div className="space-y-6">
        {!query ? (
          // 🎯 DailyWord nhận đầy đủ props
          <DailyWord 
            history={history}
            axiosPrivateHook={axiosPrivateHook}
            isAuthenticated={isAuthenticated}
            accessToken={accessToken}
          />
        ) : (
          <SearchResult
            type={type}
            query={query}
            wordData={wordData}
            kanjiData={kanjiList}
            examples={wordData.examples}
            compounds={wordData.compounds}
            relatedResults={wordData.relatedResults}
          />
        )}
      </div>
    </div>
  );
}