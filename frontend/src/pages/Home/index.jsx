import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import ContentSection from "../../components/ResultItem/ContentSection";
import SearchSection from "../../components/SearchItem/SearchSection";
import LoginModal from "../../components/Login";
import RegisterModal from "../../components/Register";

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
  const { type, value } = useParams();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
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
  }, [history, value, type]);

  const handleSearch = (word, searchType = "word") => {
    navigate(`/search/${searchType}/${word}`);
  };

  const handleOpenLogin = () => setActiveModal('login');
  const handleOpenRegister = () => setActiveModal('register');
  const handleCloseModal = () => setActiveModal(null);

  return (
    <div id="webcrumbs">
      {/* SỬA: Tăng brightness lên 95 và bỏ transition để tránh lag */}
      <div className={`flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 ${
        activeModal ? 'brightness-95' : 'brightness-100'
      }`}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
          <main className="flex-1 overflow-y-auto p-8">
            <SearchSection currentType={type} onSelect={handleSearch} />
            <ContentSection
              query={value || ""}
              type={type}
              results={results}
              history={history}
            />
          </main>
        </div>
      </div>

      {/* SỬA: Giảm opacity backdrop và bỏ backdrop-blur để tăng performance */}
      {activeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/10 transition-all duration-200">
          <div className="relative z-[10000] w-full h-full flex items-center justify-center">
            {activeModal === 'login' && (
              <LoginModal
                onClose={handleCloseModal}
                onSwitchToRegister={() => setActiveModal('register')}
                onLoginSuccess={() => {
                  handleCloseModal();
                  setTimeout(() => window.location.reload(), 300);
                }}
              />
            )}

            {activeModal === 'register' && (
              <RegisterModal
                onClose={handleCloseModal}
                onSwitchToLogin={() => setActiveModal('login')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}