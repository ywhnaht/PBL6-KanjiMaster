import React from "react";
import DailyWord from "../DailyWord";
import SearchResult from "../SearchResult";

export default function ContentSection({ query, type, results = [], history = [] }) {
  const firstResult = results[0];

  // Chuẩn hóa data word
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

  // Tách query thành từng kanji (ví dụ 恋愛 => ["恋", "愛"])
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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="space-y-6">
        {!query ? (
          <DailyWord history={history} />
        ) : (
          <SearchResult
            type={type}
            query={query}
            wordData={wordData}
            kanjiData={kanjiList} // 👈 truyền danh sách kanji
            examples={wordData.examples}
            compounds={wordData.compounds}
            relatedResults={wordData.relatedResults}
          />
        )}
      </div>
    </div>
  );
}
