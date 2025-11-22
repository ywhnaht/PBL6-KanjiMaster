/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import useQuizStore from "../../store/useQuizStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosPublic from "../../apis/axios";

const QuizContainer = ({
  questions,
  onQuizComplete,
  quizLevel,
  onStartReviewQuiz,
}) => {
  const {
    currentIndex,
    score,
    currentAnswer,
    showResult,
    answerQuestion,
    nextQuestion,
    isLastQuestion,
    isCompleted,
    userAnswers,
    submitQuizHistory,
    fetchReviewQuestions,
  } = useQuizStore();

  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  const axiosPrivateHook = useAxiosPrivate();
  const currentQuestion = questions[currentIndex];

  const isAllQuestionsAnswered = () => {
    return (
      userAnswers.length === questions.length &&
      !userAnswers.includes(undefined)
    );
  };

  useEffect(() => {
    const savedAnswer = userAnswers[currentIndex];
    if (savedAnswer !== undefined) {
      useQuizStore.setState({
        currentAnswer: savedAnswer,
        showResult: true,
      });
    } else {
      useQuizStore.setState({
        currentAnswer: null,
        showResult: false,
      });
    }
  }, [currentIndex, userAnswers]);

  const handleAnswerSelect = async (answerIndex) => {
    setIsAnimating(true);
    await answerQuestion(answerIndex);
    setIsAnimating(false);
  };

  const handleNextQuestion = () => {
    setIsAnimating(true);
    setTimeout(() => {
      nextQuestion();
      setIsAnimating(false);
    }, 300);
  };

  const handleCompleteQuiz = async () => {
    if (!isAllQuestionsAnswered()) {
      return;
    }

    setIsSubmittingResult(true);
    try {
      let submissionResult;
      try {
        submissionResult = await submitQuizHistory(axiosPrivateHook, quizLevel);
      } catch (error) {
        submissionResult = await submitQuizHistory(axiosPublic, quizLevel);
      }

      setQuizResults({
        totalQuestions: questions.length,
        correctAnswers: score,
        userAnswers: useQuizStore.getState().userAnswers,
        submissionResult,
      });
      setShowResultModal(true);
    } catch (error) {
      setQuizResults({
        totalQuestions: questions.length,
        correctAnswers: score,
        userAnswers: useQuizStore.getState().userAnswers,
        error: `Không thể lưu kết quả: ${error.message}`,
      });
      setShowResultModal(true);
    } finally {
      setIsSubmittingResult(false);
    }
  };

  const handleRetryIncorrectQuestions = async () => {
    if (!quizResults?.submissionResult?.detailedResults) {
      return;
    }

    const incorrectQuestions =
      quizResults.submissionResult.detailedResults.filter((q) => !q.isCorrect);

    if (incorrectQuestions.length === 0) {
      handleBackToSetup();
      return;
    }

    setIsLoadingReview(true);
    try {
      let reviewQuestions;
      try {
        reviewQuestions = await fetchReviewQuestions(
          axiosPrivateHook,
          quizLevel,
          incorrectQuestions.length
        );
      } catch (error) {
        reviewQuestions = await fetchReviewQuestions(
          axiosPublic,
          quizLevel,
          incorrectQuestions.length
        );
      }

      setShowResultModal(false);
      onStartReviewQuiz?.({
        type: "REVIEW_QUIZ",
        level: quizLevel,
        numberOfQuestions: incorrectQuestions.length,
        originalResults: quizResults,
      });
    } catch (error) {
      return;
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleBackToSetup = () => {
    setShowResultModal(false);
    onQuizComplete?.(quizResults);
  };

  const ResultModal = () => {
    if (!showResultModal || !quizResults) return null;

    const { totalQuestions, correctAnswers, submissionResult, error } =
      quizResults;
    const incorrectCount =
      submissionResult?.summary?.incorrectCount ||
      totalQuestions - correctAnswers;
    const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(1);

    const grade =
      percentage >= 90
        ? "Xuất sắc"
        : percentage >= 80
        ? "Rất tốt"
        : percentage >= 70
        ? "Tốt"
        : percentage >= 60
        ? "Khá"
        : percentage >= 50
        ? "Trung bình"
        : "Cần cải thiện";

    const gradeColor =
      percentage >= 90
        ? "text-emerald-600"
        : percentage >= 80
        ? "text-green-600"
        : percentage >= 70
        ? "text-blue-600"
        : percentage >= 60
        ? "text-amber-600"
        : percentage >= 50
        ? "text-orange-600"
        : "text-red-600";

    const gradeIcon =
      percentage >= 90
        ? "emoji_events"
        : percentage >= 80
        ? "military_tech"
        : percentage >= 70
        ? "star"
        : percentage >= 60
        ? "thumb_up"
        : percentage >= 50
        ? "psychology"
        : "auto_awesome";

    const getConfettiColor = () => {
      if (percentage >= 90) return "from-emerald-400 to-green-500";
      if (percentage >= 80) return "from-green-400 to-emerald-500";
      if (percentage >= 70) return "from-blue-400 to-cyan-500";
      if (percentage >= 60) return "from-amber-400 to-orange-500";
      return "from-gray-400 to-slate-500";
    };

    // Sửa lỗi click outside: đóng modal khi click vào overlay
    const handleOverlayClick = () => {
      setShowResultModal(false);
    };

    // Ngăn sự kiện click lan ra ngoài khi click vào modal
    const handleModalClick = (e) => {
      e.stopPropagation();
    };

    return (
      <div 
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
        onClick={handleOverlayClick} // Click vào bất kỳ đâu trong overlay sẽ đóng modal
      >
        {/* Overlay tối */}
        <div className="absolute inset-0 bg-gray-900/10"></div>
        
        {/* Modal - ngăn sự kiện click lan ra ngoài */}
        <div 
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto transform animate-scale-in overflow-hidden z-[10002]"
          onClick={handleModalClick} // Quan trọng: ngăn sự kiện click lan lên overlay
        >
          {/* Close button */}
          <button
            onClick={() => setShowResultModal(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8  rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
          >
            <span className="material-symbols-outlined text-gray-600 group-hover:text-gray-800 text-lg">
              close
            </span>
          </button>

          {/* Header với gradient */}
          <div className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] p-8 text-center relative overflow-hidden">
            {/* Hiệu ứng confetti */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-4 w-3 h-3 bg-white rounded-full"></div>
              <div className="absolute top-4 right-6 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute bottom-6 left-8 w-3 h-3 bg-white rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            <div className={`w-24 h-24 bg-gradient-to-r ${getConfettiColor()} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white/20`}>
              <span className="material-symbols-outlined text-4xl text-white">
                {gradeIcon}
              </span>
            </div>

            <h3 className="text-3xl font-bold text-white mb-2">
              {error ? "Hoàn thành" : "Chúc mừng!"}
            </h3>
            <p className="text-white/90 text-lg">Bạn đã hoàn thành bài quiz</p>
          </div>

          {/* Nội dung kết quả */}
          <div className="p-8">
            {/* Thông tin điểm số */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent mb-2">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className={`text-lg font-medium ${gradeColor} mb-4`}>
                {grade}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {incorrectCount > 0 ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-blue-800 mb-1">
                      <span className="material-symbols-outlined text-sm">lightbulb</span>
                      <span className="text-sm font-medium">Gợi ý học tập</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Bạn có <span className="font-semibold">{incorrectCount} câu sai</span>. 
                      Hãy ôn tập để cải thiện kết quả!
                    </p>
                  </div>

                  <button
                    onClick={handleRetryIncorrectQuestions}
                    disabled={isLoadingReview}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoadingReview ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                        Đang tải câu ôn tập...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">replay</span>
                        Làm lại {incorrectCount} câu sai
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBackToSetup}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Ôn tập sau
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-emerald-800 mb-1">
                      <span className="material-symbols-outlined text-sm">emoji_events</span>
                      <span className="text-sm font-medium">Xuất sắc!</span>
                    </div>
                    <p className="text-emerald-700 text-sm">
                      Bạn đã làm đúng tất cả câu hỏi. Thật ấn tượng! 🎉
                    </p>
                  </div>

                  <button
                    onClick={handleBackToSetup}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">home</span>
                    Quay về Setup
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSentence = () => {
    if (!currentQuestion?.sentence) {
      return (
        <div className="text-lg text-gray-800 leading-relaxed">
          {currentQuestion?.sentence}
        </div>
      );
    }

    if (
      currentQuestion.sentence.includes("<u>") &&
      currentQuestion.sentence.includes("</u>")
    ) {
      const parts = currentQuestion.sentence.split(/(<u>.*?<\/u>)/g);

      return (
        <div className="text-lg text-gray-800 leading-relaxed">
          {parts.map((part, index) => {
            if (part.startsWith("<u>") && part.endsWith("</u>")) {
              const content = part.slice(3, -4);
              return (
                <span
                  key={index}
                  className="font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent relative"
                  style={{
                    textDecoration: "underline",
                    textDecorationThickness: "2px",
                    textUnderlineOffset: "6px",
                    textDecorationColor: "#DA7B93",
                  }}
                >
                  {content}
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      );
    }

    if (!currentQuestion.targetWord) {
      return (
        <div className="text-lg text-gray-800 leading-relaxed">
          {currentQuestion.sentence}
        </div>
      );
    }

    const parts = currentQuestion.sentence.split(
      new RegExp(`(${currentQuestion.targetWord})`, "gi")
    );

    return (
      <div className="text-lg text-gray-800 leading-relaxed">
        {parts.map((part, index) =>
          part.toLowerCase() === currentQuestion.targetWord.toLowerCase() ? (
            <span
              key={index}
              className="font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent relative"
              style={{
                textDecoration: "underline",
                textDecorationThickness: "2px",
                textUnderlineOffset: "6px",
                textDecorationColor: "#DA7B93",
              }}
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </div>
    );
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-3">
            Không có câu hỏi
          </h2>
          <p className="text-gray-500 text-base">
            Vui lòng quay lại setup và thử lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-3">
        <div
          className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transition-all duration-500 min-h-[680px] flex flex-col ${
            isAnimating
              ? "opacity-0 transform scale-95"
              : "opacity-100 transform scale-100"
          }`}
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div className="flex-1 mr-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Câu {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  Điểm: <span className="text-[#2F4454]">{score}</span>/
                  {questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-xl h-2 shadow-inner">
                <div
                  className="bg-gradient-to-r from-[#2F4454] via-[#376E6F] to-[#DA7B93] h-2 rounded-xl transition-all duration-700 ease-out shadow-sm"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#2F4454] mb-5 leading-tight">
                {currentQuestion.questionText}
              </h3>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm mb-6">
                {renderSentence()}
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = currentAnswer === index;
                  const isCorrectOption =
                    index === currentQuestion.correctAnswerIndex;
                  const showCorrect = showResult && isCorrectOption;
                  const showIncorrect =
                    showResult && isSelected && !isCorrectOption;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult || isAnimating}
                      className={`
                        p-5 text-left rounded-xl border-2 transition-all duration-300 transform hover:scale-102
                        relative overflow-hidden group
                        ${
                          showCorrect
                            ? "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400 text-emerald-900 shadow-lg ring-2 ring-emerald-200/50"
                            : showIncorrect
                            ? "bg-gradient-to-br from-rose-50 to-red-100 border-rose-400 text-rose-900 shadow-lg ring-2 ring-rose-200/50"
                            : isSelected
                            ? "bg-gradient-to-br from-[#2F4454] to-[#376E6F] border-[#2F4454] text-white shadow-xl scale-105 ring-2 ring-[#DA7B93]/30"
                            : "bg-white border-gray-200 text-gray-800 hover:border-[#DA7B93] hover:shadow-lg hover:bg-gray-50"
                        }
                        ${!showResult && "active:scale-98"}
                      `}
                    >
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          !showResult && !isSelected
                            ? "bg-gradient-to-br from-[#2F4454]/5 to-[#DA7B93]/5"
                            : ""
                        }`}
                      ></div>

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-sm ${
                              showCorrect
                                ? "bg-emerald-500 text-white shadow-emerald-200"
                                : showIncorrect
                                ? "bg-rose-500 text-white shadow-rose-200"
                                : isSelected
                                ? "bg-white text-[#2F4454] shadow-md"
                                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-[#2F4454]/10 group-hover:to-[#DA7B93]/10"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-lg font-medium">{option}</span>
                        </div>

                        {showResult && (
                          <div className="flex items-center gap-2">
                            {showCorrect && (
                              <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-white text-base">
                                  check
                                </span>
                              </div>
                            )}
                            {showIncorrect && (
                              <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-white text-base">
                                  close
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto">
              {!showResult && (
                <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-5 rounded-xl border border-amber-200/50 backdrop-blur-sm mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-white text-sm">
                        psychology
                      </span>
                    </div>
                    <h4 className="font-bold text-amber-900 text-lg">
                      Hướng dẫn
                    </h4>
                  </div>
                  <p className="text-amber-800 leading-relaxed text-base mb-3">
                    Đọc kỹ câu và từ được gạch chân, sau đó chọn đáp án phù hợp
                    nhất.
                  </p>
                  <div className="flex items-center gap-2 text-amber-700 text-sm">
                    <span className="material-symbols-outlined text-xs">
                      info
                    </span>
                    <span>Bạn sẽ thấy giải thích sau khi chọn đáp án</span>
                  </div>
                </div>
              )}

              {showResult && (
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-5 rounded-xl border border-blue-200/50 backdrop-blur-sm mb-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-white text-sm">
                        lightbulb
                      </span>
                    </div>
                    <h4 className="font-bold text-blue-900 text-lg">
                      Giải thích
                    </h4>
                  </div>

                  <p className="text-blue-800 mb-4 leading-relaxed text-base">
                    {currentQuestion.explanation}
                  </p>

                  <div className="bg-white/80 p-4 rounded-lg border border-emerald-300/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-emerald-700 font-semibold">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xs">
                          check
                        </span>
                      </div>
                      <span className="text-base">Đáp án đúng:</span>
                      <span className="text-base ml-1 text-emerald-800">
                        {
                          currentQuestion.options[
                            currentQuestion.correctAnswerIndex
                          ]
                        }
                      </span>
                      <span className="text-gray-600 text-sm ml-2">
                        (
                        {String.fromCharCode(
                          65 + currentQuestion.correctAnswerIndex
                        )}
                        )
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showResult && !isLastQuestion() && (
                <div className="text-center pt-2">
                  <button
                    onClick={handleNextQuestion}
                    disabled={isAnimating}
                    className="px-8 py-3 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                  >
                    <span className="flex items-center gap-2 text-base">
                      Câu tiếp theo
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-300 text-sm">
                        arrow_forward
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {showResult && isLastQuestion() && isAllQuestionsAnswered() && (
                <div className="text-center pt-2">
                  <button
                    onClick={handleCompleteQuiz}
                    disabled={isSubmittingResult}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2 text-base">
                      {isSubmittingResult ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-sm">
                            refresh
                          </span>
                          Đang lưu kết quả...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300 text-sm">
                            flag
                          </span>
                          Hoàn thành Quiz
                        </>
                      )}
                    </span>
                  </button>
                </div>
              )}

              {showResult && isLastQuestion() && !isAllQuestionsAnswered() && (
                <div className="text-center pt-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-amber-700">
                      <span className="material-symbols-outlined text-sm">
                        info
                      </span>
                      <span className="text-sm font-medium">
                        Vui lòng trả lời tất cả {questions.length} câu hỏi để
                        hoàn thành quiz
                      </span>
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      Còn{" "}
                      {questions.length -
                        userAnswers.filter((answer) => answer !== undefined)
                          .length}{" "}
                      câu chưa trả lời
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ResultModal />
    </>
  );
};

export default QuizContainer;