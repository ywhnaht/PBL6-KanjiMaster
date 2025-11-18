import React, { useState } from "react";
import Header from "../../layouts/Header";
import Sidebar from "../../layouts/Sidebar";
import QuizSetup from "../../components/Quiz/QuizSetup";
import QuizContainer from "../../components/Quiz/QuizContainer";
import LoginModal from "../../components/Login";
import useQuizStore from "../../store/useQuizStore";

const Test = () => {
  const [showQuizSetup, setShowQuizSetup] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    level: "5",
    numberOfQuestions: 10,
  });
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const { questions, loading, resetQuiz, jumpToQuestion } = useQuizStore();

  const handleStartQuiz = (settings) => {
    // 🎯 SỬA: Bỏ kiểm tra đăng nhập ở đây vì đã kiểm tra trong QuizSetup
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

  // 🎯 Handler cho login modal
  const handleShowLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // 🎯 THÊM: Hiển thị thông báo thành công
    setTimeout(() => {
      alert("Đăng nhập thành công! Bạn có thể làm quiz ngay bây giờ.");
    }, 100);
  };

  // 🎯 Handler chuyển sang đăng ký
  const handleSwitchToRegister = () => {
    // Logic chuyển sang modal đăng ký nếu có
    console.log("Switch to register modal");
  };

  return (
    <div id="webcrumbs">
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
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
                      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-12 border border-gray-100 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-6xl text-[#DA7B93] animate-spin">
                            hourglass_empty
                          </span>
                          <h2 className="text-2xl font-bold text-[#2F4454]">
                            {isReviewMode ? "Đang tải câu ôn tập..." : "Đang tải câu hỏi..."}
                          </h2>
                          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
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
                      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-12 border border-gray-100 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-6xl text-red-400">error</span>
                          <h2 className="text-2xl font-bold text-red-600">Có lỗi xảy ra</h2>
                          <p className="text-gray-600">Không thể tải câu hỏi. Vui lòng thử lại.</p>
                          <button
                            onClick={handleBackToSetup}
                            className="mt-4 px-6 py-3 bg-[#DA7B93] text-white rounded-full hover:bg-[#DA7B93]/80 transition-all duration-300 font-semibold"
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
    </div>
  );
};

export default Test;