import React from "react";

export default function DailyWord({ history = [] }) {
  // ví dụ demo word list
  const demoWords = [
    { kanji: "優勝", reading: "ゆうしょう", meaning: "sự chiến thắng tất cả" },
    { kanji: "機械", reading: "きかい", meaning: "bộ máy" },
    { kanji: "施設", reading: "しせつ", meaning: "cơ sở; cơ sở vật chất" },
    { kanji: "た", reading: "", meaning: "thể quá khứ" },
  ];

  return (
    <>
      {/* Tip of the Day */}
      <div className="p-6 bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 rounded-xl shadow-sm">
        <h3 className="font-bold text-purple-700 mb-3 text-xl">
          Study Tip of the Day
        </h3>
        <p className="leading-relaxed px-4 py-3 rounded-lg text-gray-800 font-medium bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 shadow-inner">
          Practice writing Kanji characters daily to improve retention.
          Try the "spaced repetition" technique for better memory!
        </p>
      </div>

      {/* 2 phần chia đôi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Từ vựng hôm nay */}
        <div className="p-4 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 ml-6 text-lg">
            Từ vựng hôm nay
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {demoWords.map((word, i) => (
              <div key={i} className="flex items-start">
                <button className="w-8 h-8 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "22px",
                      width: "24px",
                      height: "24px",
                      display: "inline-block",
                    }}
                    title="Play audio"
                  >
                    volume_up
                  </span>
                </button>
                <div>
                  <div className="text-lg font-bold">{word.kanji}</div>
                  <div className="text-sm text-gray-500">{word.reading}</div>
                  <div className="text-sm text-gray-700">{word.meaning}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch sử đã tra */}
        <div className="p-6 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Lịch sử đã tra</h3>
          {history.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-all"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có lịch sử tìm kiếm.</p>
          )}
        </div>
      </div>
    </>
  );
}
