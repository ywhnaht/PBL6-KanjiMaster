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
      <div className="p-6 bg-gradient-to-r from-[#2F4454]/5 via-[#DA7B93]/5 to-[#2F4454]/5 rounded-xl shadow-sm border border-[#DA7B93]/10">
        <h3 className="font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-3 text-xl">
          Study Tip of the Day
        </h3>
        <p className="leading-relaxed px-4 py-3 rounded-lg text-[#2F4454] font-medium bg-gradient-to-r from-[#2F4454]/10 via-[#DA7B93]/10 to-[#2F4454]/10 shadow-inner border border-[#DA7B93]/10">
          Practice writing Kanji characters daily to improve retention.
          Try the "spaced repetition" technique for better memory!
        </p>
      </div>

      {/* 2 phần chia đôi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Từ vựng hôm nay */}
        <div className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white">
          <h3 className="font-bold text-[#2F4454] mb-4 ml-6 text-lg">
            Từ vựng hôm nay
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {demoWords.map((word, i) => (
              <div key={i} className="flex items-start">
                <button className="w-8 h-8 flex items-center justify-center hover:text-[#DA7B93] transition-colors">
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
                  <div className="text-lg font-bold text-[#2F4454]">{word.kanji}</div>
                  <div className="text-sm text-[#2F4454]/70">{word.reading}</div>
                  <div className="text-sm text-[#2F4454]">{word.meaning}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch sử đã tra */}
        <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
          <h3 className="font-bold text-[#2F4454] mb-4 text-lg">Lịch sử đã tra</h3>
          {history.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  className="px-3 py-1 bg-[#2F4454]/5 rounded-full text-sm text-[#2F4454] hover:bg-[#DA7B93]/10 hover:text-[#DA7B93] transition-all border border-[#2F4454]/10"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[#2F4454]/70">Chưa có lịch sử tìm kiếm.</p>
          )}
        </div>
      </div>
    </>
  );
}