// src/components/SearchResult.js
import React, { useEffect } from "react";
import WordResult from "../WordResult";
import KanjiResult from "../KanjiResult";
import useSearchStore from "../../../store/useSearchStore";

export default function SearchResult({ type, query }) {
  const {
    fetchWordDetail,
    wordDetail,
    isLoading,
    compoundPage,
    compoundTotalPages,
    setCompoundPage,
  } = useSearchStore();

  useEffect(() => {
    if (query) {
      fetchWordDetail(query, type, 0, 5); // ✅ truyền type
    }
  }, [query, type]);

  if (isLoading) {
    return <div className="p-6 text-gray-500 italic">Đang tải...</div>;
  }

  if (!wordDetail) {
    return <div className="p-6 text-gray-500 italic">Không có dữ liệu</div>;
  }

  if (type === "word") {
    return (
      <WordResult
        {...wordDetail}
        compoundPage={compoundPage}
        examples={wordDetail.examples || []}
        exampleMeaning={wordDetail.examples?.[0]?.meaning || ""}
        compoundTotalPages={compoundTotalPages}
        onCompoundPageChange={(page) => {
          setCompoundPage(page);
          fetchWordDetail(query, "word", page, 5);
        }}
      />
    );
  }

  if (type === "kanji") {
    if (!wordDetail.kanjis || wordDetail.kanjis.length === 0) {
      return (
        <div className="p-6 text-gray-500 italic">Không tìm thấy kanji</div>
      );
    }

    return (
      <KanjiResult
        kanjis={wordDetail.kanjis}
        examples={wordDetail.kanjiExamples || []} // 👈 dùng thẳng kanjiExamples
        compounds={wordDetail.compounds || []}
        relatedResults={wordDetail.relatedResults || []}
      />
    );
  }

  return null;
}
