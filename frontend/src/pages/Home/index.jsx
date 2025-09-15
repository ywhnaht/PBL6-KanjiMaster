import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import ContentSection from "../../components/ResultItem/ContentSection";
import SearchSection from "../../components/SearchItem/SearchSection";

// dictionary mẫu
const dictionary = [
  { kanji: "恋愛", reading: "れんあい", meaning: "luyến ái; tình yêu" },
  {
    kanji: "恋水",
    reading: "こいみず / こいすい",
    meaning: "nước mắt tình yêu",
  },
  { kanji: "恋", reading: "こい", meaning: "tình yêu" },
  {
    kanji: "偶々",
    reading: "たまたま",
    meaning: "thỉnh thoảng; tình cờ; ngẫu nhiên",
  },
];

export default function Home() {
  const { type, value } = useParams(); // lấy cả type và value
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [history, setHistory] = useState(["優勝", "施設"]);

  useEffect(() => {
    if (value) {
      const filtered = dictionary.filter(
        (item) =>
          item.kanji.includes(value) ||
          item.reading.includes(value) ||
          item.meaning.includes(value)
      );
      setResults(filtered);

      if (!history.includes(value)) {
        setHistory((prev) => [...prev, value]);
      }
    } else {
      setResults([]);
    }
  }, [history, value, type]); // thêm type vào dependency

  const handleSearch = (word, searchType = "word") => {
    navigate(`/search/${searchType}/${word}`);
  };

  return (
    <div id="webcrumbs">
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <SearchSection currentType={type} onSelect={handleSearch} />
            <ContentSection
              query={value || ""}
              type={type} // 👈 thêm dòng này
              results={results}
              history={history}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
