import React, { useState } from "react";
import Header from "../../layouts/Header";
import Sidebar from "../../layouts/Sidebar";
import QuizSetup from "../../components/Quiz/QuizSetup";
import useQuizStore from "../../store/useQuizStote";

const Test = () => {
  const [showQuizSetup, setShowQuizSetup] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const { questions, currentQuestion, loading } = useQuizStore();

  const handleStartQuiz = () => {
    setShowQuizSetup(false);
    setShowQuiz(true);
  };

  const handleBackToSetup = () => {
    setShowQuiz(false);
    setShowQuizSetup(true);
  };

  return (
    <div id="webcrumbs">
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto pt-15">
            {showQuizSetup && (
              <div className="h-full flex items-center justify-center p-8">
                <QuizSetup onStartQuiz={handleStartQuiz} />
              </div>
            )}
            
            {showQuiz && (
              <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 border border-gray-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-6xl text-[#DA7B93] animate-spin">
                          hourglass_empty
                        </span>
                        <h2 className="text-2xl font-bold text-[#2F4454]">Đang tải câu hỏi...</h2>
                        <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
                      </div>
                    </div>
                  ) : questions.length > 0 ? (
                    <div className="text-center">
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={handleBackToSetup}
                          className="flex items-center gap-2 px-4 py-2 text-[#2F4454] hover:bg-[#2F4454]/5 rounded-lg transition-all duration-300"
                        >
                          <span className="material-symbols-outlined">arrow_back</span>
                          Quay lại
                        </button>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
                          Quiz Started!
                        </h1>
                        <div className="w-24"></div> {/* Spacer */}
                      </div>
                      
                      <div className="bg-gradient-to-r from-[#2F4454]/5 to-[#DA7B93]/5 p-6 rounded-2xl border border-[#DA7B93]/20">
                        <p className="text-lg text-gray-700 mb-4">
                          ✅ Đã tải thành công <span className="font-bold text-[#DA7B93]">{questions.length}</span> câu hỏi
                        </p>
                        <p className="text-gray-600">
                          Bạn có thể bắt đầu làm quiz ngay bây giờ! 
                          <br />
                          <small>(Đây là demo - component quiz chi tiết sẽ được implement sau)</small>
                        </p>
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-[#DA7B93]">quiz</span>
                              <span className="font-semibold text-[#2F4454]">Tổng câu hỏi</span>
                            </div>
                            <div className="text-2xl font-bold text-[#DA7B93]">{questions.length}</div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-green-600">timer</span>
                              <span className="font-semibold text-[#2F4454]">Thời gian dự kiến</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{questions.length * 2} phút</div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-blue-600">psychology</span>
                              <span className="font-semibold text-[#2F4454]">Cấp độ</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {questions[0]?.level ? `N${questions[0].level}` : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleBackToSetup}
                          className="mt-6 px-8 py-3 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-semibold rounded-full hover:from-[#DA7B93] hover:to-[#2F4454] transition-all duration-300 hover:shadow-lg hover:scale-105"
                        >
                          Làm quiz khác
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-6xl text-red-400">
                          error
                        </span>
                        <h2 className="text-2xl font-bold text-red-600">Có lỗi xảy ra</h2>
                        <p className="text-gray-600">Không thể tải câu hỏi. Vui lòng thử lại.</p>
                        <button
                          onClick={handleBackToSetup}
                          className="mt-4 px-6 py-2 bg-[#DA7B93] text-white rounded-lg hover:bg-[#DA7B93]/80 transition-all duration-300"
                        >
                          Thử lại
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Test;