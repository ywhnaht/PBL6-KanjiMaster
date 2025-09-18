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

  // 🔄 refetch khi query hoặc type thay đổi
  useEffect(() => {
    if (query) {
      fetchWordDetail(query, 0, 5); // reset về trang 0 mỗi khi đổi tab / query
    }
  }, [query, type, fetchWordDetail]);

  if (isLoading) {
    return <div className="p-6 text-gray-500 italic">Đang tải...</div>;
  }

  if (!wordDetail) {
    return <div className="p-6 text-gray-500 italic">Không có dữ liệu</div>;
  }

  // ✅ Nếu type = "word" thì render WordResult + truyền pagination
  if (type === "word") {
    return (
      <WordResult
        {...wordDetail}
        compoundPage={compoundPage}
        compoundTotalPages={compoundTotalPages}
        onCompoundPageChange={(page) => {
          setCompoundPage(page);
          fetchWordDetail(query, page, 5); // gọi lại API với trang mới
        }}
      />
    );
  }

  // ✅ Nếu type = "kanji" thì render KanjiResult
  return (
    <KanjiResult
      kanjis={wordDetail.kanjis || []}
      examples={wordDetail.examples || []}
      compounds={wordDetail.compounds || []}
      relatedResults={wordDetail.relatedResults || []}
    />
  );
}
