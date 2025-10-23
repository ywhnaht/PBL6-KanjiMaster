import React, { useState, useMemo, useEffect } from "react"; 
import KanjiStroke from "../../../ultis/KanjiStroke"; 
import { useNavigate } from "react-router-dom"; 
import useSearchStore from "../../../store/useSearchStore"; 

export default function KanjiResult({ 
  kanjis = [], 
  examples = [], 
  compounds = [], 
  query = "", 
  hideHeader = false // 🆕 Thêm prop mới

}) { 
  const navigate = useNavigate(); 
  const { 
    setQuery, 
    setCurrentWordId, 
    setCurrentKanjiId, 
    fetchKanjiDetail, 
    compoundKanjis, 
  } = useSearchStore(); 

  const [selected, setSelected] = useState(0); 
  const [compoundPage, setCompoundPage] = useState(0); 
  const [kanjiStrokeKey, setKanjiStrokeKey] = useState(0); 

  const pageSize = 4; 
  const mainKanji = kanjis[selected]; 
  const displayQuery = query || mainKanji?.kanji || "-"; 

  useEffect(() => { 
    setCompoundPage(0); 
    setKanjiStrokeKey((prev) => prev + 1); 
  }, [selected, kanjis]); 

  // Chỉ lọc compounds liên quan đến Kanji đang chọn 
  const compoundsForSelected = useMemo(() => { 
    if (!mainKanji) return []; 
    if (Array.isArray(compounds) && compounds.length > 0) { 
      const filtered = compounds.filter((c) => 
        c.word?.includes(mainKanji.kanji) 
      ); 
      return filtered.length > 0 ? filtered : compounds; 
    } 
    return []; 
  }, [compounds, mainKanji]); 

  const totalPages = Math.max( 
    1, 
    Math.ceil(compoundsForSelected.length / pageSize) 
  ); 

  const paginatedCompounds = compoundsForSelected.slice( 
    compoundPage * pageSize, 
    (compoundPage + 1) * pageSize 
  ); 

  const prevPage = () => setCompoundPage((p) => Math.max(0, p - 1)); 
  const nextPage = () => 
    setCompoundPage((p) => Math.min(totalPages - 1, p + 1)); 
  const goToPage = (i) => setCompoundPage(i); 

  // Function để trigger vẽ lại animation 
  const handleRedrawStrokes = () => { 
    setKanjiStrokeKey((prev) => prev + 1); 
  }; 

  const getJLPTColor = (level) => { 
    const colors = { 
      N5: "bg-green-100 text-green-800 border-green-200", 
      N4: "bg-blue-100 text-blue-800 border-blue-200", 
      N3: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      N2: "bg-orange-100 text-orange-800 border-orange-200", 
      N1: "bg-red-100 text-red-800 border-red-200", 
    }; 
    return colors[level] || "bg-gray-100 text-gray-800 border-gray-200"; 
  }; 

  // Khi click vào từ ghép: navigate thẳng sang /search/word/{id} và cập nhật input 
  const handleCompoundClick = (item) => { 
    if (!item?.id) return; 
    if (item.word) { 
      setQuery(item.word); 
    } 
    setCurrentWordId(item.id); 
    navigate(`/search/word/${item.id}`); 
  }; 

  // Hàm xử lý khi click vào Kanji cấu thành (từ tab Word) 
  const handleKanjiClick = async (kanji) => { 
    if (!kanji?.id) return; 
    // Cập nhật input với chữ kanji 
    if (kanji.kanji) { 
      setQuery(kanji.kanji); 
    } 
    // Lưu kanjiId và fetch chi tiết 
    setCurrentKanjiId(kanji.id); 
    await fetchKanjiDetail(kanji.id); 
    navigate(`/search/kanji/${kanji.id}`); 
  }; 

  // Hàm phân tách Onyomi (Katakana) và Kunyomi (Hiragana)
  const separateReadings = (joyoReading) => {
    if (!joyoReading) return { onyomi: "-", kunyomi: "-" };
    
    const katakanaRegex = /[\u30A0-\u30FF]/; // Unicode range cho katakana
    const hiraganaRegex = /[\u3040-\u309F]/; // Unicode range cho hiragana
    
    const parts = joyoReading.split(/[、,]/).map(part => part.trim());
    
    let onyomi = []; // Âm On - Katakana
    let kunyomi = []; // Âm Kun - Hiragana
    
    parts.forEach(part => {
      if (katakanaRegex.test(part)) {
        onyomi.push(part);
      } else if (hiraganaRegex.test(part)) {
        kunyomi.push(part);
      }
    });
    
    return {
      onyomi: onyomi.length > 0 ? onyomi.join('、') : "-",
      kunyomi: kunyomi.length > 0 ? kunyomi.join('、') : "-"
    };
  };

  const readings = separateReadings(mainKanji?.joyoReading);

  return ( 
    <div className="w-full space-y-6"> 
      {/* Header */} 
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-gray-200"> 
        <h2 className="text-2xl font-bold text-gray-800"> 
          Kết quả cho:{" "} 
          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"> 
            {displayQuery} 
          </span> 
        </h2> 
        {!hideHeader && (<div className="flex items-center gap-3"> 
          {/* Kanji cấu thành */} 
          {compoundKanjis && compoundKanjis.length > 0 && ( 
            <div className="flex gap-2"> 
              {compoundKanjis.map((k, i) => ( 
                <button 
                  key={k.id || i} 
                  onClick={() => handleKanjiClick(k)} 
                  className="w-14 h-14 flex items-center justify-center text-2xl font-semibold text-gray-800 bg-white border-3 border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-100 active:bg-blue-200 transition-all" 
                  title={`${k.kanji} - ${k.hanViet}`} 
                  style={{ borderWidth: "3px" }} 
                > 
                  {k.kanji} 
                </button> 
              ))} 
            </div> 
          )} 
          {/* Kanji Selector */} 
          {kanjis.length > 1 && ( 
            <div className="flex gap-2"> 
              {kanjis.map((k, i) => ( 
                <button 
                  key={i} 
                  onClick={() => setSelected(i)} 
                  className={`px-4 py-2 rounded-lg transition-all ${ 
                    selected === i 
                      ? "bg-blue-600 text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-50" 
                  }`} 
                > 
                  {k.kanji} 
                </button> 
              ))} 
            </div> 
          )} 
        </div> )}
      </div> 

      {/* Main content */} 
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"> 
        <div className="xl:col-span-2"> 
          {mainKanji && ( 
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6 flex flex-col"> 
              {/* Kanji & info */} 
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 px-[62px]"> 
                <div className="flex-1 flex flex-col items-center md:items-start"> 
                  <div className="text-8xl font-light text-gray-800 select-text mb-4 pl-8"> 
                    {mainKanji.kanji} 
                  </div> 
                  <div className="flex items-center gap-3"> 
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getJLPTColor( 
                        mainKanji.level 
                      )}`} 
                    > 
                      JLPT N{mainKanji.level || "-"} 
                    </span> 
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"> 
                      {mainKanji.strokes ?? "-"} nét 
                    </span> 
                  </div> 
                </div> 
                {/* Buttons */} 
                <div className="flex md:flex-col justify-center items-center md:items-start gap-3 mt-4 md:mt-0"> 
                  <button className="group p-3 rounded-full bg-red-50 hover:bg-red-100 transition-colors"> 
                    <span className="material-symbols-outlined text-red-500 group-hover:text-red-600 text-2xl group-hover:font-variation-settings-FILL-1"> 
                      favorite 
                    </span> 
                  </button> 
                  <button className="group p-3 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"> 
                    <span className="material-symbols-outlined text-blue-500 group-hover:text-blue-600 text-2xl"> 
                      share 
                    </span> 
                  </button> 
                  <button className="group p-3 rounded-full bg-green-50 hover:bg-green-100 transition-colors"> 
                    <span className="material-symbols-outlined text-green-500 group-hover:text-green-600 text-2xl group-hover:font-variation-settings-FILL-1"> 
                      bookmark 
                    </span> 
                  </button> 
                </div> 
              </div> 

              {/* Meaning & Readings - ĐÃ SỬA */} 
              <div className="space-y-6"> 
                {/* Phần Âm On (Katakana) và Âm Kun (Hiragana) */} 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                  <div className="p-4 bg-purple-50 rounded-lg"> 
                    <h3 className="font-semibold text-purple-800 mb-2"> 
                      音読み (On-yomi) 
                    </h3> 
                    <p className="text-purple-700 font-medium text-lg"> 
                      {readings.onyomi}
                    </p> 
                  </div> 
                  <div className="p-4 bg-green-50 rounded-lg"> 
                    <h3 className="font-semibold text-green-800 mb-2"> 
                      訓読み (Kun-yomi) 
                    </h3> 
                    <p className="text-green-700 font-medium text-lg"> 
                      {readings.kunyomi}
                    </p> 
                  </div> 
                </div> 

                {/* Phần Bộ - ĐÃ ĐỔI TỪ THUẦN VIỆT */} 
                <div className="p-4 bg-orange-50 rounded-lg"> 
                  <h3 className="font-semibold text-orange-800 mb-3"> 
                    Thông tin Hán tự 
                  </h3> 
                  <div className="space-y-2"> 
                    <p className="text-orange-700"> 
                      <span className="font-semibold">Hán Việt:</span>{" "} 
                      {mainKanji.hanViet || "-"} 
                    </p> 
                    <p className="text-orange-700"> 
                      <span className="font-semibold">Bộ:</span>{" "} 
                      {mainKanji.radical || "-"} 
                    </p> 
                  </div> 
                </div> 
              </div> 
            </div> 
          )} 

          {/* Ví dụ */} 
          {examples.length > 0 && ( 
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6"> 
              <h3 className="font-bold text-lg text-gray-800 mb-4"> 
                Câu ví dụ 
              </h3> 
              <div className="space-y-4"> 
                {examples.map((ex, i) => ( 
                  <div 
                    key={ex.id || i} 
                    className="border-l-4 border-blue-200 pl-4 py-2" 
                  > 
                    <p className="text-lg font-medium text-gray-800"> 
                      {ex.sentence} 
                    </p> 
                    <p className="text-gray-500 text-sm italic">{ex.meaning}</p> 
                  </div> 
                ))} 
              </div> 
            </div> 
          )} 
        </div> 

        {/* Sidebar */} 
        <div className="space-y-6"> 
          {/* Stroke order SVG */} 
          {mainKanji?.svgLink && ( 
            <div className="bg-white rounded-xl shadow-lg p-6"> 
              <div className="flex items-center justify-between mb-4"> 
                <h3 className="font-bold text-lg text-gray-800"> 
                  Thứ tự nét viết 
                </h3> 
                <button 
                  onClick={handleRedrawStrokes} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  title="Vẽ lại nét" 
                > 
                  <span className="material-symbols-outlined text-base"> 
                    refresh 
                  </span> 
                </button> 
              </div> 
              <div className="flex flex-col items-center"> 
                <KanjiStroke 
                  key={kanjiStrokeKey} 
                  svgUrl={mainKanji.svgLink} 
                  width={260} 
                  height={260} 
                  strokeDuration={300} 
                  strokeDelay={400} 
                  autoPlay={true} 
                  loop={false} 
                /> 
              </div> 
            </div> 
          )} 

          {/* Compounds */} 
          <div className="bg-white rounded-xl shadow-lg p-6"> 
            <h3 className="font-bold text-lg text-gray-800 mb-4"> 
              Kết quả tương tự cho:{" "} 
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"> 
                {displayQuery} 
              </span> 
            </h3> 
            {compoundsForSelected.length === 0 ? ( 
              <p className="text-gray-500 italic">Không có từ ghép liên quan</p> 
            ) : ( 
              <> 
                <div className="space-y-3"> 
                  {paginatedCompounds.map((c, i) => ( 
                    <div 
                      key={i} 
                      role="button" 
                      tabIndex={0} 
                      onClick={() => handleCompoundClick(c)} 
                      onKeyDown={(e) => { 
                        if (e.key === "Enter" || e.key === " ") { 
                          e.preventDefault(); 
                          handleCompoundClick(c); 
                        } 
                      }} 
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer" 
                    > 
                      <div className="flex items-center justify-between mb-1"> 
                        <span className="text-xl font-semibold text-gray-800"> 
                          {c.word} 
                        </span> 
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded"> 
                          {c.hiragana || c.reading || ""} 
                        </span> 
                      </div> 
                      <p className="text-gray-600 text-sm"> 
                        {c.meaning || c.meaningEn || ""} 
                      </p> 
                    </div> 
                  ))} 
                </div> 
                {/* Pagination */} 
                {totalPages > 1 && ( 
                  <div className="mt-4 flex items-center justify-center gap-2"> 
                    <button 
                      onClick={prevPage} 
                      disabled={compoundPage === 0} 
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
                        compoundPage === 0 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-gray-700 hover:bg-gray-100 border" 
                      }`} 
                    > 
                      &lt; 
                    </button> 
                    {Array.from({ length: totalPages }).map((_, i) => ( 
                      <button 
                        key={i} 
                        onClick={() => goToPage(i)} 
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
                          compoundPage === i 
                            ? "bg-blue-600 text-white" 
                            : "bg-white text-gray-700 hover:bg-gray-100 border" 
                        }`} 
                      > 
                        {i + 1} 
                      </button> 
                    ))} 
                    <button 
                      onClick={nextPage} 
                      disabled={compoundPage === totalPages - 1} 
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${ 
                        compoundPage === totalPages - 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-gray-700 hover:bg-gray-100 border" 
                      }`} 
                    > 
                      &gt; 
                    </button> 
                  </div> 
                )} 
              </> 
            )} 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}