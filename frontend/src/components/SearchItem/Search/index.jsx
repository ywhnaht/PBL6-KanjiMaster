import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DrawBoard from "../DrawBoard";
import useSearchStore from "../../../store/useSearchStore";

export default function Search({ placeholder = "日本, nihon, Nhật Bản" }) {
  const navigate = useNavigate();
  const { query, results, setQuery, fetchResults, reset, isLoading } = useSearchStore();
  const [showDrawBoard, setShowDrawBoard] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const icons = ["keyboard", "draw", "mic", "document_scanner"];

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    console.log("🔍 Gửi request với value:", value, "Encoded:", encodeURIComponent(value));

    if (value.trim() === "") {
      reset();
      return;
    }

    try {
      const res = await fetchResults(value);
      console.log("✅ API trả về:", res);
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim() !== "") {
      navigate(`/search/word/${encodeURIComponent(query)}`);
      setShowDropdown(false);
      setShowDrawBoard(false);
    }
  };

  return (
    <div className="relative group">
      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full py-4 px-5 pr-16 border border-gray-300 rounded-2xl 
                   focus:outline-none focus:ring-3 focus:ring-primary-500 
                   focus:border-transparent transition-all duration-300 
                   shadow-sm group-hover:shadow-md"
      />

      {/* Icons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {icons.map((icon, i) => (
          <button
            key={i}
            onClick={() => icon === "draw" && setShowDrawBoard(!showDrawBoard)}
            className="w-10 h-10 flex items-center justify-center rounded-full 
                       hover:bg-gray-100 transition-all duration-300 hover:scale-110"
          >
            <span className="material-symbols-outlined">{icon}</span>
          </button>
        ))}
      </div>

      {/* Suggestion Dropdown */}
      {showDropdown && (query || results.length > 0) && (
        <div>
          {console.log("📊 Rendering dropdown with results:", results, "isLoading:", isLoading)}
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[1000]">
            <ul className="divide-y divide-gray-100">
              {isLoading ? (
                <li className="p-3 text-gray-500 text-sm italic">Đang tìm...</li>
              ) : results.length > 0 ? (
                results.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 p-3 hover:bg-primary-50 cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setQuery(item.text);
                      navigate(`/search/word/${encodeURIComponent(item.text)}`);
                      setShowDropdown(false);
                    }}
                  >
                    {console.log("📊 Rendering item:", item)}
                    <span className="material-symbols-outlined text-gray-400">history</span>
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{item.text}</div>
                      <div className="text-sm text-gray-500">{item.reading}</div>
                      <div className="text-sm text-gray-700">{item.meaning}</div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-3 text-gray-500 text-sm italic">Không tìm thấy từ nào</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* DrawBoard */}
      {showDrawBoard && (
        <DrawBoard
          predictions={results.map((r) => r.text)}
          onClose={() => setShowDrawBoard(false)}
        />
      )}
    </div>
  );
}