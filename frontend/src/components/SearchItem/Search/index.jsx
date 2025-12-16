import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DrawBoard from "../DrawBoard";
import useSearchStore from "../../../store/useSearchStore";
import useDarkModeStore from "../../../store/useDarkModeStore";

export default function Search({ placeholder = "日本, nihon, ひらがな" }) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const isDark = useDarkModeStore((state) => state.isDark);
    const {
        query,
        results,
        setQuery,
        fetchSuggest,
        // eslint-disable-next-line no-unused-vars
        reset,
        fetchCompoundDetail,
        fetchKanjiDetail,
        fetchCompoundKanji,
        isLoading,
    } = useSearchStore();

    const [showDrawBoard, setShowDrawBoard] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const icons = ["keyboard", "draw", "mic", "document_scanner"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const triggerSuggestSearch = useCallback(async (value) => {
        setShowDropdown(true);

        if (value.trim() === "") {
            // 🆕 Chỉ ẩn dropdown khi input rỗng, không reset dữ liệu
            setShowDropdown(false);
            return;
        }

        try {
            await fetchSuggest(value);
        } catch (error) {
            console.error("❌ Lỗi khi gọi API:", error);
        }
    }, [fetchSuggest]);

    const handleChange = async (e) => {
        const value = e.target.value;
        setQuery(value);
        await triggerSuggestSearch(value);
    };
    
    const handleDrawComplete = useCallback(async (text) => {
        setQuery(text);
        await triggerSuggestSearch(text);
        setShowDropdown(true); 
    }, [setQuery, triggerSuggestSearch]);

    const handleSelect = async (item) => {
        setShowDropdown(false);
        setShowDrawBoard(false);

        const type = item.type === "KANJI" ? "kanji" : "word";

        if (type === "kanji") {
            await fetchKanjiDetail(item.id);
        } else {
            const detail = await fetchCompoundDetail(item.id);
            if (detail?.id) {
                await fetchCompoundKanji(detail.id);
            }
        }

        navigate(`/search/${type}/${item.id}`);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter" && query.trim() !== "") {
            if (results.length > 0) {
                await handleSelect(results[0]);
            }
        }
    };

    return (
        <div className="relative group z-10" ref={dropdownRef}>
            {/* Ô tìm kiếm */}
            <input
                type="text"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full py-4 px-5 pr-16 border rounded-2xl 
                            focus:outline-none focus:ring-3 focus:ring-primary-500 
                            focus:border-transparent transition-all duration-300 
                            shadow-sm group-hover:shadow-md ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-primary-500'
                }`}
            />

            {/* Icons bên phải */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {icons.map((icon, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (icon === "draw") {
                                setShowDrawBoard(!showDrawBoard);
                                setShowDropdown(false);
                            }
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-full 
                                transition-all duration-300 hover:scale-110 ${
                          isDark
                            ? 'hover:bg-slate-600 text-slate-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <span className="material-symbols-outlined">{icon}</span>
                    </button>
                ))}
            </div>

            {/* Dropdown gợi ý */}
            {showDropdown && (query || results.length > 0) && (
                <div
                    className={`absolute top-full left-0 mt-2 w-full 
                                 bg-opacity-100 border rounded-xl shadow-2xl overflow-hidden 
                                 z-[5000] pointer-events-auto transition-colors duration-300 ${
                      isDark
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-gray-200'
                    }`}
                >
                    <ul className={`divide-y max-h-80 overflow-y-auto ${
                      isDark ? 'divide-slate-700' : 'divide-gray-100'
                    }`}>
                        {isLoading ? (
                            <li className={`p-3 text-sm italic transition-colors duration-300 ${
                              isDark ? 'text-slate-400' : 'text-gray-500'
                            }`}>Đang tìm...</li>
                        ) : results.length > 0 ? (
                            results.map((item) => (
                                <li
                                    key={item.id}
                                    className={`flex items-start gap-3 p-3 cursor-pointer transition-all duration-200 ${
                                      isDark
                                        ? 'hover:bg-slate-700 text-slate-100'
                                        : 'hover:bg-primary-50 text-gray-800'
                                    }`}
                                    onClick={() => handleSelect(item)}
                                >
                                    <span className={`material-symbols-outlined ${
                                      isDark ? 'text-slate-500' : 'text-gray-400'
                                    }`}>
                                        history
                                    </span>
                                    <div>
                                        <div className="text-lg font-semibold">
                                            {item.text}
                                        </div>
                                        <div className={`text-sm transition-colors duration-300 ${
                                          isDark ? 'text-slate-400' : 'text-gray-500'
                                        }`}>{item.reading}</div>
                                        <div className={`text-sm transition-colors duration-300 ${
                                          isDark ? 'text-slate-300' : 'text-gray-700'
                                        }`}>{item.meaning}</div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className={`p-3 text-sm italic transition-colors duration-300 ${
                              isDark ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                                Không tìm thấy từ nào
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* DrawBoard */}
            {showDrawBoard && (
                <DrawBoard
                    onSearchComplete={handleDrawComplete} 
                    onClose={() => setShowDrawBoard(false)}
                />
            )}
        </div>
    );
}