// src/components/SearchResult.js
import React, { useEffect } from "react";
import WordResult from "../WordResult";
import KanjiResult from "../KanjiResult";
import useSearchStore from "../../../store/useSearchStore";

export default function SearchResult({ type, query }) {
  const { fetchWordDetail, wordDetail, isLoading } = useSearchStore();

  useEffect(() => {
    if (query) {
      fetchWordDetail(query, 0, 5);
    }
  }, [query, fetchWordDetail]);

  if (isLoading)
    return <div className="p-6 text-gray-500 italic">Đang tải...</div>;

  if (!wordDetail)
    return <div className="p-6 text-gray-500 italic">Không có dữ liệu</div>;

  // Nếu type là "word" thì dùng WordResult
  if (type === "word") {
    return <WordResult {...wordDetail} />;
  }

  // Nếu type là "kanji" thì map dữ liệu cho KanjiResult
  const kanjiData = wordDetail.word && wordDetail.reading
    ? [
        {
          kanji: wordDetail.word,
          onyomi: wordDetail.onyomi || "",
          kunyomi: wordDetail.kunyomi || "",
          meaning: wordDetail.meaning || "Chưa có nghĩa",
          jlpt: wordDetail.jlpt || "",
          strokes: wordDetail.strokes || "",
          sinoViet: wordDetail.sinoViet || "",
          nativeViet: wordDetail.nativeViet || "",
        },
      ]
    : [];

  return (
    <KanjiResult
      kanjis={kanjiData}
      examples={wordDetail.examples || []}
      compounds={wordDetail.compounds || []}
      relatedResults={wordDetail.relatedResults || []}
    />
  );
}
