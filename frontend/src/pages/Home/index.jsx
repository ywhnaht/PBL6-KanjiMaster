import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import ContentSection from "../../components/ResultItem/ContentSection";
import SearchSection from "../../components/SearchItem/SearchSection";
import LoginModal from "../../components/Login";
import RegisterModal from "../../components/Register";
import { useAuthStore } from "../../store/useAuthStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

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
  const axiosPrivateHook = useAxiosPrivate();

  const [activeModal, setActiveModal] = useState(null);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState(["優勝", "施設"]);
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeCountdown, setWelcomeCountdown] = useState(3);
  
  // 🎯 THÊM: Lấy cả isAuthenticated, user, accessToken
  const { user, isAuthenticated, accessToken } = useAuthStore();

  // 🎯 THÊM: Countdown timer cho welcome modal
  useEffect(() => {
    let interval;
    if (showWelcomeModal && welcomeCountdown > 0) {
      interval = setInterval(() => {
        setWelcomeCountdown((prev) => prev - 1);
      }, 1000);
    } else if (welcomeCountdown === 0) {
      setShowWelcomeModal(false);
      setWelcomeCountdown(3);
    }
    return () => clearInterval(interval);
  }, [showWelcomeModal, welcomeCountdown]);

  // 🎯 THÊM: Search filter logic
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

  const handleLoginSuccess = () => {
    handleCloseModal();
    setShowWelcomeModal(true);
    setWelcomeCountdown(3);
    console.log("✅ Login successful, showing welcome modal");
    // 🎯 THÊM: Log auth state để debug
    console.log("🔐 Auth state after login:", { isAuthenticated, user: user?.fullName, accessToken: !!accessToken });
  };

  const WelcomeModal = () => {
    if (!showWelcomeModal) return null;

    return (
      <div className="fixed top-4 right-4 z-[10001]">
        <div className="bg-white rounded-2xl shadow-2xl border border-[#DA7B93]/20 p-6 max-w-sm transform animate-slide-in-right">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2F4454] to-[#DA7B93] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-lg">
                waving_hand
              </span>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
                Chào mừng!
              </h3>
              <p className="text-[#2F4454]/80 text-sm leading-relaxed">
                {user?.fullName}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Bạn đã đăng nhập thành công
              </p>
            </div>

            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full border-2 border-[#DA7B93]/30 flex items-center justify-center relative">
                <span className="text-[#DA7B93] font-bold text-sm">
                  {welcomeCountdown}
                </span>
                <div 
                  className="absolute inset-0 rounded-full border-2 border-[#DA7B93] border-t-transparent animate-spin"
                  style={{
                    animation: `spin ${welcomeCountdown}s linear`
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="webcrumbs">
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
            
            {/* 🎯 SỬA: Truyền axios + isAuthenticated + accessToken xuống ContentSection */}
            <ContentSection
              query={value || ""}
              type={type}
              results={results}
              history={history}
              axiosPrivateHook={axiosPrivateHook}
              isAuthenticated={isAuthenticated}
              accessToken={accessToken}
            />
          </main>
        </div>
      </div>

      {/* Modal Backdrop + Login/Register */}
      {activeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/10 transition-all duration-200">
          <div className="relative z-[10000] w-full h-full flex items-center justify-center">
            {activeModal === 'login' && (
              <LoginModal
                onClose={handleCloseModal}
                onSwitchToRegister={() => setActiveModal('register')}
                onLoginSuccess={handleLoginSuccess}
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

      {/* Welcome Modal - hiển thị sau khi đăng nhập */}
      <WelcomeModal />
    </div>
  );
}