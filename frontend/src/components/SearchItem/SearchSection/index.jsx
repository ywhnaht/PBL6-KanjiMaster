// src/components/SearchSection.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Search from "../Search";
import useSearchStore from "../../../store/useSearchStore";

export default function SearchSection() {
  const navigate = useNavigate();
  const { type, value } = useParams();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();
  const { fetchWordDetail } = useSearchStore();

  const currentTab = type === "kanji" ? "Kanji" : "Word";
  const tabs = ["Word", "Kanji"];

  // 🔄 mỗi khi đổi tab hoặc value thì gọi API
  useEffect(() => {
    if (value) {
      fetchWordDetail(value, type); // ✅ truyền type để tách API
    }
  }, [type, value]);

  const handleTabClick = (tab) => {
    if (!value) return;
    const path = `/search/${tab.toLowerCase()}/${encodeURIComponent(value)}`;
    navigate(path);
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
