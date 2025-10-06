// src/components/SearchSection.jsx
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Search from "../Search";
import useSearchStore from "../../../store/useSearchStore";

export default function SearchSection() {
  const navigate = useNavigate();
  const { type, value } = useParams();
  const {
    wordDetail,
    kanjiDetail,
    fetchKanjiDetail,
    fetchCompoundDetail,
    fetchCompoundKanji,
    currentWordId,
    currentKanjiId,
    compoundKanjis,
  } = useSearchStore();

  const tabs = ["Word", "Kanji"];

  // Xác định tab hiện tại
  const currentTab = type === "kanji" ? "Kanji" : "Word";

  // 🔄 gọi API riêng theo type và lưu ID hiện tại
  useEffect(() => {
    if (!value) return;

    if (type === "kanji") {
      fetchKanjiDetail(value);
    } else {
      fetchCompoundDetail(value);
      fetchCompoundKanji(value);
    }
  }, [type, value]);

  // Khi click tab, chuyển đổi giữa Word và Kanji dựa trên ID đã lưu
  const handleTabClick = async (tab) => {
    if (tab === currentTab) return; // Đã ở tab này rồi thì không làm gì

    if (tab === "Word") {
      // Chuyển từ Kanji sang Word - sử dụng wordId đã lưu
      const targetWordId = currentWordId || wordDetail?.id;
      if (targetWordId) {
        // Gọi API để cập nhật dữ liệu mới nhất
        await fetchCompoundDetail(targetWordId);
        await fetchCompoundKanji(targetWordId);
        navigate(`/search/word/${targetWordId}`);
      } else {
        console.warn("Không tìm thấy wordId để chuyển tab");
      }
    } else if (tab === "Kanji") {
      // Chuyển từ Word sang Kanji - sử dụng kanjiId đã lưu hoặc lấy từ đầu tiên
      let targetKanjiId = currentKanjiId || kanjiDetail?.id;
      
      // Nếu không có kanjiId, lấy kanji đầu tiên từ compoundKanjis
      if (!targetKanjiId && compoundKanjis && compoundKanjis.length > 0) {
        targetKanjiId = compoundKanjis[0].id;
        console.log("📝 Lấy kanji đầu tiên từ compoundKanjis:", targetKanjiId);
      }
      
      if (targetKanjiId) {
        // Gọi API để cập nhật dữ liệu mới nhất
        await fetchKanjiDetail(targetKanjiId);
        navigate(`/search/kanji/${targetKanjiId}`);
      } else {
        console.warn("Không tìm thấy kanjiId để chuyển tab và không có compoundKanjis");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex flex-col gap-6">
        {/* Search Input */}
        <Search placeholder="日本, nihon, Nhật Bản" />

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(tab)}
              className={`px-5 py-3 whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                currentTab === tab
                  ? "text-primary-600 border-b-2 border-primary-600 font-medium hover:bg-primary-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}