import React, { useState } from "react";

export default function KanjiResult({
  kanjis = [],
  examples = [],
  compounds = [],
}) {
  const [selected, setSelected] = useState(0);
  const mainKanji = kanjis[selected];

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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Kết quả cho:{" "}
          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            {mainKanji.kanji}
          </span>
        </h2>

        {/* Kanji Selector */}
        {kanjis.length > 1 && (
          <div className="flex gap-2">
            {kanjis.map((k, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selected === i
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {k.kanji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Kanji */}
        <div className="xl:col-span-2">
          {mainKanji && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              {/* Kanji big display */}
              <div className="flex justify-between items-start mb-8">
                <div className="text-center">
                  <div className="text-8xl font-light text-gray-800 mb-4 select-text">
                    {mainKanji.kanji}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getJLPTColor(
                        mainKanji.jlpt
                      )}`}
                    >
                      JLPT {mainKanji.jlpt}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {mainKanji.strokes} nét
                    </span>
                  </div>
                </div>

                {/* Right side: Action buttons */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <button className="group p-1 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                    <span className="material-symbols-outlined text-red-500 group-hover:text-red-600 text-base group-hover:font-variation-settings-FILL-1">
                      favorite
                    </span>
                  </button>
                  <button className="group p-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                    <span className="material-symbols-outlined text-blue-500 group-hover:text-blue-600 text-base">
                      share
                    </span>
                  </button>
                  <button className="group p-1 rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                    <span className="material-symbols-outlined text-green-500 group-hover:text-green-600 text-base group-hover:font-variation-settings-FILL-1">
                      bookmark
                    </span>
                  </button>
                </div>
              </div>

              {/* Meaning & Readings */}
              <div className="space-y-6">
                {/* English Meaning */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Ý nghĩa (English)
                  </h3>
                  <p className="text-blue-700 font-medium">
                    {mainKanji.meaning}
                  </p>
                </div>

                {/* Readings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">
                      音読み (On-yomi)
                    </h3>
                    <p className="text-purple-700 font-medium text-lg">
                      {mainKanji.onyomi}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      訓読み (Kun-yomi)
                    </h3>
                    <p className="text-green-700 font-medium text-lg">
                      {mainKanji.kunyomi}
                    </p>
                  </div>
                </div>

                {/* Vietnamese */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-3">
                    Dịch nghĩa Tiếng Việt
                  </h3>
                  <div className="space-y-2">
                    <p className="text-orange-700">
                      <span className="font-semibold">Hán Việt:</span>{" "}
                      {mainKanji.sinoViet}
                    </p>
                    <p className="text-orange-700">
                      <span className="font-semibold">Thuần Việt:</span>{" "}
                      {mainKanji.nativeViet}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          {examples.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Câu ví dụ
              </h3>
              <div className="space-y-4">
                {examples.map((ex, i) => (
                  <div key={i} className="border-l-4 border-blue-200 pl-4 py-2">
                    <p className="text-lg font-medium text-gray-800">{ex.jp}</p>
                    <p className="text-blue-600 mb-1 font-medium">{ex.vi}</p>
                    <p className="text-gray-500 text-sm italic">{ex.en}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compounds */}
          {compounds.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Từ ghép liên quan
              </h3>
              <div className="space-y-3">
                {compounds.map((c, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl font-semibold text-gray-800">
                        {c.word}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {c.hiragana}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{c.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
