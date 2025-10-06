import React, { useEffect } from "react";
import WordResult from "../WordResult";
import KanjiResult from "../KanjiResult";
import useSearchStore from "../../../store/useSearchStore";

export default function SearchResult({ type, queryOrId }) {
  const {
    fetchCompoundDetail,
    fetchKanjiDetail,
    fetchCompoundKanji,
    wordDetail,
    kanjiDetail,
    compoundKanjis,
    isLoading,
    compoundPage,
    compoundTotalPages,
    setCompoundPage,
  } = useSearchStore();

  useEffect(() => {
    if (!queryOrId) return;

    if (type === "word") {
      // Lấy chi tiết từ ghép
      fetchCompoundDetail(queryOrId, "word", 0, 5);

      // Lấy luôn các Kanji cấu thành
      fetchCompoundKanji(queryOrId);
    } else if (type === "kanji") {
      fetchKanjiDetail(queryOrId);
    }
  }, [queryOrId, type]);

  if (isLoading) {
    return <div className="p-6 text-gray-500 italic">Đang tải...</div>;
  }

  if (type === "word" && wordDetail) {
    return (
      <WordResult
        {...wordDetail}
        compoundPage={compoundPage}
        compoundTotalPages={compoundTotalPages}
        compoundKanjis={compoundKanjis || []} // đảm bảo luôn có mảng
        onCompoundPageChange={(page) => {
          setCompoundPage(page);
          fetchCompoundDetail(queryOrId, "word", page, 5);
          fetchCompoundKanji(queryOrId); // cập nhật Kanji khi đổi trang
        }}
      />
    );
  }

  if (type === "kanji" && kanjiDetail) {
  return (
    <KanjiResult
      kanjis={[kanjiDetail]} // đưa kanjiDetail vào mảng để KanjiResult vẫn dùng selected index
      examples={kanjiDetail.kanjiExamples || []}
      compounds={kanjiDetail.compoundWords || []} // từ ghép liên quan
    />
  );
}


  return <div className="p-6 text-gray-500 italic">Không có dữ liệu</div>;
}
