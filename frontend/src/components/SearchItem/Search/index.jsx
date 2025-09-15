import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DrawBoard from "../DrawBoard";

export default function Search({ placeholder = "日本, nihon, Nhật Bản", onUpdate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDrawBoard, setShowDrawBoard] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // Thêm state mới
  const navigate = useNavigate();

  const dictionary = [
    { kanji: "恋愛", reading: "れんあい", meaning: "luyến ái; tình yêu" },
    { kanji: "恋水", reading: "こいみず / こいすい", meaning: "nước mắt tình yêu" },
    { kanji: "恋", reading: "こい", meaning: "tình yêu" },
    { kanji: "偶々", reading: "たまたま", meaning: "thỉnh thoảng; tình cờ; ngẫu nhiên" },
  ];

  const predictions = ["大夫", "大人", "大丈夫", "大米", "大天", "大入"];
  const icons = ["keyboard", "draw", "mic", "document_scanner"];

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true); // Hiển thị dropdown khi gõ

    if (value.trim() === "") {
      setResults([]);
      onUpdate?.(value, []); 
      return;
    }

    const filtered = dictionary.filter(
      (item) =>
        item.kanji.includes(value) ||
        item.reading.includes(value) ||
        item.meaning.includes(value)
    );
    setResults(filtered);
    onUpdate?.(value, filtered);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim() !== "") {
      // Navigate tới /search/kanji/恋水 khi bấm Enter
      navigate(`/search/word/${encodeURIComponent(query)}`);
      setShowDropdown(false); // Tắt dropdown
      setShowDrawBoard(false); // Đóng DrawBoard
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
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          <ul className="divide-y divide-gray-100">
            {/* Khi có query */}
            {query.trim() !== "" ? (
              results.length > 0 ? (
                results.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 hover:bg-primary-50 cursor-pointer transition-all duration-200"
                    onClick={() => {
                      // Khi click vào suggestion, set query và navigate
                      setQuery(item.kanji);
                      setResults([item]);
                      onUpdate?.(item.kanji, [item]);
                      navigate(`/search/word/${encodeURIComponent(item.kanji)}`);
                      setShowDropdown(false); // Tắt dropdown khi click suggestion
                    }}
                  >
                    <span className="material-symbols-outlined text-gray-400">history</span>
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{item.kanji}</div>
                      <div className="text-sm text-gray-500">{item.reading}</div>
                      <div className="text-sm text-gray-700">{item.meaning}</div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-3 text-gray-500 text-sm italic">Không tìm thấy từ nào</li>
              )
            ) : (
              /* Khi chưa nhập query → show predictions */
              predictions.map((p, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 p-3 hover:bg-primary-50 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    // Khi click vào prediction, set query và navigate
                    setQuery(p);
                    const filtered = dictionary.filter(
                      (item) =>
                        item.kanji.includes(p) ||
                        item.reading.includes(p) ||
                        item.meaning.includes(p)
                    );
                    setResults(filtered);
                    onUpdate?.(p, filtered);
                    navigate(`/search/word/${encodeURIComponent(p)}`);
                    setShowDropdown(false); // Tắt dropdown khi click prediction
                  }}
                >
                  <span className="material-symbols-outlined text-gray-400">search</span>
                  <span className="text-gray-700">{p}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* DrawBoard */}
      {showDrawBoard && (
        <DrawBoard predictions={predictions} onClose={() => setShowDrawBoard(false)} />
      )}
    </div>
  );
}