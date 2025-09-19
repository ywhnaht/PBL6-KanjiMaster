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

  // ✅ mock nhiều câu ví dụ
  const examples = [
    {
      jp: "日本語を学びます。",
      vi: "Tôi học tiếng Nhật.",
    },
    {
      jp: "学生が図書館で勉強しています。",
      vi: "Sinh viên đang học trong thư viện.",
    },
    {
      jp: "私は毎日新しいことを学ぶ。",
      vi: "Tôi học điều mới mỗi ngày.",
    },
  ];

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
        examples={examples} // ✅ ép dùng mock ví dụ ở đây
        compounds={wordDetail.compounds || []}
        relatedResults={wordDetail.relatedResults || []}
      />
    );
  }

  return null;
}
