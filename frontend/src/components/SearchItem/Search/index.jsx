import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DrawBoard from "../DrawBoard";
import useSearchStore from "../../../store/useSearchStore";
import useDarkModeStore from "../../../store/useDarkModeStore";
import Tesseract from "tesseract.js";


export default function Search({ placeholder = "日本, nihon, ひらがな" }) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const isDark = useDarkModeStore((state) => state.isDark);
    const {
        query,
        results,
        setQuery,
        fetchSuggest,
        fetchCompoundDetail,
        fetchKanjiDetail,
        fetchCompoundKanji,
        isLoading,
    } = useSearchStore();

    const [showDrawBoard, setShowDrawBoard] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // State hiển thị khung upload
    const [showImageUpload, setShowImageUpload] = useState(false);
    // State kéo thả
    const [isDragging, setIsDragging] = useState(false);
    // State đang xử lý
    const [isScanning, setIsScanning] = useState(false);
    // 🆕 State lưu kết quả ngay tại đây
    const [scanResult, setScanResult] = useState(null);

    const icons = ["keyboard", "draw", "mic", "document_scanner"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                if (!isScanning && !scanResult) { // Chỉ đóng khi không đang quét và không có kết quả
                     if (showImageUpload && !event.target.closest('.upload-dropzone')) {
                        setShowImageUpload(false);
                     }
                }
            }
        };
        if (showDropdown || showImageUpload) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown, showImageUpload, isScanning, scanResult]);

    // --- Logic Search/Draw cũ ---
    const triggerSuggestSearch = useCallback(async (value) => {
        setShowDropdown(true);
        if (value.trim() === "") { setShowDropdown(false); return; }
        try { await fetchSuggest(value); } catch (error) { console.error(error); }
    }, [fetchSuggest]);

    const handleChange = async (e) => {
        const value = e.target.value;
        setQuery(value); await triggerSuggestSearch(value);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter" && query.trim() !== "") {
            if (results.length > 0) await handleSelect(results[0]);
        }
    };

    const handleSelect = async (item) => {
        setShowDropdown(false); setShowDrawBoard(false); setShowImageUpload(false); setScanResult(null);
        const type = item.type === "KANJI" ? "kanji" : "word";
        if (type === "kanji") await fetchKanjiDetail(item.id);
        else {
            const detail = await fetchCompoundDetail(item.id);
            if (detail?.id) await fetchCompoundKanji(detail.id);
        }
        navigate(`/search/${type}/${item.id}`);
    };

    const handleDrawComplete = useCallback(async (text) => {
        setQuery(text); await triggerSuggestSearch(text); setShowDropdown(true); 
    }, [setQuery, triggerSuggestSearch]);

   // 🔥 GỌI BACKEND THAY VÌ GỌI GEMINI TRỰC TIẾP
    const BACKEND_TRANSLATE_URL = "https://web-production-a4fdd2.up.railway.app/api/gemini/translate/";

    const processFile = async (file) => {
        if (!file.type.startsWith("image/")) {
            alert("Chỉ hỗ trợ ảnh");
            return;
        }

        setIsScanning(true);
        setScanResult(null);

        try {
            const imageUrl = URL.createObjectURL(file);

            // 1️⃣ OCR
            const { data: { text } } = await Tesseract.recognize(file, "jpn");
            const ocrText = text.trim();

            if (!ocrText) {
                alert("Không nhận diện được chữ");
                return;
            }

            // 2️⃣ CALL BACKEND
            const res = await fetch(BACKEND_TRANSLATE_URL, {
                method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: ocrText
            })
        });

        if (!res.ok) {
            throw new Error(`Backend error ${res.status}`);
        }

        const result = await res.json();

        // 3️⃣ HIỂN THỊ
        setScanResult({
            image: imageUrl,
            japanese: result.japanese || ocrText,
            vietnamese: result.vietnamese || "Không thể dịch"
        });

    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra");
    } finally {
        setIsScanning(false);
    }
};


    // ... Drag handlers ...
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };
    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget.contains(e.relatedTarget)) return; setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };
    const handleFileSelect = (e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = null; };

    return (
        <div className="relative group z-30" ref={dropdownRef}>
            {/* Input Search - GIỮ NGUYÊN */}
            <input 
                type="text" 
                value={query} 
                onChange={handleChange} 
                onKeyDown={handleKeyDown} 
                placeholder={placeholder} 
                className={`w-full py-4 px-5 pr-16 border rounded-2xl focus:outline-none focus:ring-3 focus:ring-primary-500 shadow-sm group-hover:shadow-md transition-all duration-300 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-primary-500'}`} 
            />

            {/* Icons Action - GIỮ NGUYÊN */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {icons.map((icon, i) => (
                    <button 
                        key={i} 
                        disabled={isScanning} 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (icon === "draw") { setShowDrawBoard(!showDrawBoard); setShowDropdown(false); setShowImageUpload(false); }
                            else if (icon === "document_scanner") { 
                                setShowImageUpload(!showImageUpload); setShowDrawBoard(false); setShowDropdown(false); 
                                if(!showImageUpload) setScanResult(null);
                            }
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${isDark ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-gray-100 text-gray-700'} ${showImageUpload && icon === 'document_scanner' ? (isDark ? 'bg-slate-600 text-blue-400' : 'bg-gray-200 text-primary-500') : ''}`}
                    >
                        <span className="material-symbols-outlined">{icon}</span>
                    </button>
                ))}
            </div>

            {/* === KHUNG UPLOAD & KẾT QUẢ (ĐÃ SỬA GIAO DIỆN) === */}
            {showImageUpload && (
                <div 
                    className={`upload-dropzone absolute top-full left-0 mt-4 w-full h-[500px] rounded-3xl border shadow-2xl z-[5000] backdrop-blur-md transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-top-5 ${isDark ? isDragging ? 'border-blue-400 bg-slate-800' : 'border-slate-600 bg-slate-800' : isDragging ? 'border-primary-500 bg-white' : 'border-gray-200 bg-white'}`}
                    onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
                >
                    {/* TRƯỜNG HỢP 1: ĐANG QUÉT (Loading) */}
                    {isScanning ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-pulse">
                            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500">
                                AI đang đọc ảnh...
                            </h3>
                        </div>
                    ) : scanResult ? (
                        // TRƯỜNG HỢP 2: HIỂN THỊ KẾT QUẢ (LAYOUT MỚI)
                        <div className="flex flex-col h-full">
                            
                            {/* --- Header (Toolbar) --- */}
                            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/80'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined ${isDark ? 'text-green-400' : 'text-green-600'}`}>check_circle</span>
                                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Hoàn tất</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setScanResult(null); }}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                        Quét lại
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowImageUpload(false); setScanResult(null); }}
                                        className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'hover:bg-red-100 text-gray-400 hover:text-red-500'}`}
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            {/* --- Body (Split View) --- */}
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                
                                {/* Cột Trái: Ảnh (Nền tối để nổi bật ảnh) */}
                                <div className={`w-full md:w-1/2 h-48 md:h-full flex items-center justify-center p-4 ${isDark ? 'bg-black/40' : 'bg-gray-100'}`}>
                                    <img 
                                        src={scanResult.image} 
                                        alt="Original" 
                                        className="max-h-full max-w-full object-contain shadow-lg rounded-lg border border-white/10" 
                                    />
                                </div>
                                
                                {/* Cột Phải: Text (Scrollable) */}
                                <div className={`w-full md:w-1/2 h-full overflow-y-auto p-5 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                    
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                                Tiếng Việt
                                            </span>
                                        </div>
                                        {/* 👇 QUAN TRỌNG: STYLE DÙNG PRE-LINE */}
                                        <div 
                                            className={`text-lg leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-100' : 'text-gray-800'}`}
                                            style={{ whiteSpace: 'pre-line' }}
                                        >
                                            {scanResult.vietnamese}
                                        </div>
                                    </div>
                                    
                                    {/* (Optional) Thích thì hiện tiếng Nhật gốc bên dưới mờ mờ */}
                                    {/* <div className={`pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                                        <p className="text-xs text-gray-400 mb-1">Gốc:</p>
                                        <p className="text-sm text-gray-500 whitespace-pre-line">{scanResult.japanese}</p>
                                    </div> */}

                                </div>
                            </div>
                        </div>
                    ) : (
                        // TRƯỜNG HỢP 3: CHƯA UPLOAD (Drag & Drop)
                        <div className="w-full h-full flex flex-col relative">
                            {/* Nút đóng cho trạng thái upload */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowImageUpload(false); }} 
                                className={`absolute top-4 right-4 p-2 rounded-full z-10 ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>

                            <div 
                                className="flex-1 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-opacity-50 transition-colors"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-primary-500'}`}>
                                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                </div>
                                
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                                    Tải ảnh lên
                                </h3>
                                <p className={`text-sm text-center max-w-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Nhấp để chọn hoặc kéo thả ảnh chụp tiếng Nhật vào đây để dịch
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Dropdown kết quả search thường - GIỮ NGUYÊN */}
            {showDropdown && (query || results.length > 0) && !showImageUpload && (
                <div className={`absolute top-full left-0 mt-2 w-full bg-opacity-100 border rounded-xl shadow-2xl overflow-hidden z-[4000] pointer-events-auto transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <ul className={`divide-y max-h-80 overflow-y-auto ${isDark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                        {isLoading ? (<li className="p-4 text-center italic text-gray-500">Đang tìm...</li>) : results.map((item) => (
                            <li key={item.id} className={`flex items-start gap-3 p-3 cursor-pointer ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`} onClick={() => handleSelect(item)}>
                                <span className="material-symbols-outlined">history</span>
                                <div><div className="font-bold">{item.text}</div><div className="text-sm">{item.meaning}</div></div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {showDrawBoard && <DrawBoard onSearchComplete={handleDrawComplete} onClose={() => setShowDrawBoard(false)} />}
        </div>
    );
}