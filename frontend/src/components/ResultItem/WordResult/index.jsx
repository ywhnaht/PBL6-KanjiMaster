import React from "react";

export default function WordResult({
  word,
  hiragana,
  meaning,
  compounds = [],
  examples = [],
  relatedResults = [],
}) {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-7 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Kết quả cho:{" "}
          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            {word}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Word Content */}
        <div className="xl:col-span-2">
          {/* Main Word Display */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            {/* Word big display */}
            <div className="mb-8 text-left">
              <div className="flex justify-between items-start mb-4 px-[20px]">
                {/* Left side: Word + Reading */}
                <div className="text-center">
                  <div className="text-8xl font-light text-gray-800 select-text">
                    {word}
                  </div>
                  <div className="text-2xl text-gray-600 font-medium mt-3">
                    {hiragana}
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
            </div>

            {/* Meaning */}
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Ý nghĩa</h3>
                <p className="text-blue-700 font-medium">{meaning}</p>
              </div>
            </div>
          </div>

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

          {/* Related Words */}
          {relatedResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Từ liên quan
              </h3>
              <div className="space-y-3">
                {relatedResults.map((r, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className="text-2xl font-semibold text-gray-800">
                      {r.word}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{r.meaning}</p>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {r.hiragana}
                      </span>
                    </div>
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
