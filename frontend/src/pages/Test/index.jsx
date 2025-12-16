import React, { useState, useEffect } from "react";
import Header from "../../layouts/Header";
import Sidebar from "../../layouts/Sidebar";
import QuizSetup from "../../components/Quiz/QuizSetup";
import QuizContainer from "../../components/Quiz/QuizContainer";
import LoginModal from "../../components/Login";
import useQuizStore from "../../store/useQuizStore";
import { useAuthStore } from "../../store/useAuthStore";
import useDarkModeStore from "../../store/useDarkModeStore";

const Test = () => {
  const [showQuizSetup, setShowQuizSetup] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    level: "5",
    numberOfQuestions: 10,
  });
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // 🎯 THÊM: State cho modal chào mừng
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeCountdown, setWelcomeCountdown] = useState(3);
  
  const { questions, loading, resetQuiz, jumpToQuestion } = useQuizStore();
  const { user } = useAuthStore(); // 🎯 THÊM: Lấy thông tin user
  const isDark = useDarkModeStore((state) => state.isDark);

  // 🎯 THÊM: Effect cho countdown modal chào mừng
  useEffect(() => {
    let interval;
    if (showWelcomeModal && welcomeCountdown > 0) {
      interval = setInterval(() => {
        setWelcomeCountdown((prev) => prev - 1);
      }, 1000);
    } else if (welcomeCountdown === 0) {
      setShowWelcomeModal(false);
      setWelcomeCountdown(3); // Reset cho lần sau
    }
    return () => clearInterval(interval);
  }, [showWelcomeModal, welcomeCountdown]);

  const handleStartQuiz = (settings) => {
    setQuizSettings(settings);
    setShowQuizSetup(false);
    setShowQuiz(true);
    setIsReviewMode(false);
  };

  const handleStartReviewQuiz = (reviewData) => {
    setQuizSettings({
      level: reviewData.level,
      numberOfQuestions: reviewData.numberOfQuestions,
      type: reviewData.type,
      originalResults: reviewData.originalResults
    });
    
    setIsReviewMode(true);
  };

  const handleQuestionSelect = (questionIndex) => {
    jumpToQuestion(questionIndex);
  };

  const handleBackToSetup = () => {
    setShowQuiz(false);
    setShowQuizSetup(true);
    setIsReviewMode(false);
    resetQuiz();
  };

  const handleQuizComplete = (results) => {
    if (results.submissionResult?.detailedResults) {
      try {
        const savedResults = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        savedResults.push({
          timestamp: new Date().toISOString(),
          level: quizSettings.level,
          quizType: isReviewMode ? 'REVIEW_QUIZ' : 'KANJI_QUIZ',
          results: results
        });
        
        if (savedResults.length > 10) {
          savedResults.splice(0, savedResults.length - 10);
        }
        
        localStorage.setItem('quizHistory', JSON.stringify(savedResults));
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // Silent fail for localStorage
      }
    }

    handleBackToSetup();
  };

  const handleShowLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  // 🎯 SỬA: Cập nhật handler login success
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Hiển thị modal chào mừng
    setShowWelcomeModal(true);
    setWelcomeCountdown(3);
  };

  const handleSwitchToRegister = () => {
    console.log("Switch to register modal");
  };

  // 🎯 THÊM: Component Modal chào mừng
  const WelcomeModal = () => {
    if (!showWelcomeModal) return null;

    return (
      <div className="fixed top-4 right-4 z-[10001]">
        <div className={`rounded-2xl shadow-2xl border p-6 max-w-sm transform animate-slide-in-right transition-colors duration-300 ${
          isDark
            ? "bg-slate-800 border-rose-700/30"
            : "bg-white border-rose-300/30"
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-rose-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-lg">
                waving_hand
              </span>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">
                Chào mừng!
              </h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                {user?.fullName}
              </p>
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                isDark ? "text-slate-500" : "text-gray-500"
              }`}>
                Bạn có thể làm quiz ngay bây giờ
              </p>
            </div>

            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative transition-colors duration-300 ${
                isDark
                  ? "border-rose-700/30"
                  : "border-rose-300/30"
              }`}>
                <span className={`font-bold text-sm transition-colors duration-300 ${
                  isDark ? "text-rose-400" : "text-rose-500"
                }`}>
                  {welcomeCountdown}
                </span>
                <div 
                  className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin transition-colors duration-300 ${
                    isDark ? "border-rose-700" : "border-rose-400"
                  }`}
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
              className={`text-xs transition-colors duration-300 ${
                isDark
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
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
      <div className={`flex h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      }`}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onOpenLogin={handleShowLoginModal}
            isModalOpen={showLoginModal}
          />
          <main className="flex-1 overflow-y-auto p-8">
            {showQuizSetup && (
              <div className="h-full flex items-center justify-center">
                <QuizSetup 
                  onStartQuiz={handleStartQuiz}
                  onShowLoginModal={handleShowLoginModal}
                />
              </div>
            )}

            {showQuiz && (
              <div className="flex gap-6 h-full">
                <div className="flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full p-12 border transition-colors duration-300 ${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-gray-100"
                      }`}>
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-6xl text-rose-400 animate-spin">
                            hourglass_empty
                          </span>
                          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                            isDark ? "text-slate-100" : "text-slate-800"
                          }`}>
                            {isReviewMode ? "Đang tải câu ôn tập..." : "Đang tải câu hỏi..."}
                          </h2>
                          <p className={`transition-colors duration-300 ${
                            isDark ? "text-slate-400" : "text-gray-600"
                          }`}>
                            Vui lòng chờ trong giây lát
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : questions.length > 0 ? (
                    <QuizContainer
                      questions={questions}
                      onQuizComplete={handleQuizComplete}
                      quizLevel={quizSettings.level}
                      onStartReviewQuiz={handleStartReviewQuiz}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full p-12 border transition-colors duration-300 ${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-gray-100"
                      }`}>
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-6xl text-red-400">
                            error
                          </span>
                          <h2 className="text-2xl font-bold text-red-600">
                            Có lỗi xảy ra
                          </h2>
                          <p className={`transition-colors duration-300 ${
                            isDark ? "text-slate-400" : "text-gray-600"
                          }`}>
                            Không thể tải câu hỏi. Vui lòng thử lại.
                          </p>
                          <button
                            onClick={handleBackToSetup}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white rounded-full hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105"
                          >
                            Thử lại
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-100 flex-shrink-0 pr-8">
                  <div className="sticky top-0">
                    <QuizSetup
                      onStartQuiz={handleStartQuiz}
                      isMinimized={true}
                      onBackToSetup={handleBackToSetup}
                      level={quizSettings.level}
                      numberOfQuestions={quizSettings.numberOfQuestions}
                      onQuestionSelect={handleQuestionSelect}
                      onShowLoginModal={handleShowLoginModal}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {/* 🎯 THÊM: Welcome Modal */}
      <WelcomeModal />
    </div>
  );
};

export default Test;