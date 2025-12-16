import React, { useState, useEffect } from "react";
import useQuizStore from "../../store/useQuizStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useDarkModeStore from "../../store/useDarkModeStore";
import axiosPublic from "../../apis/axios";
import { useAuthStore } from "../../store/useAuthStore";

export default function QuizSetup({
  onStartQuiz,
  isMinimized = false,
  onBackToSetup,
  level: propLevel,
  numberOfQuestions: propNumberOfQuestions,
  onQuestionSelect,
  onShowLoginModal,
}) {
  const [level, setLevel] = useState(propLevel || "5");
  const [numberOfQuestions, setNumberOfQuestions] = useState(
    propNumberOfQuestions || 10
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  // 🎯 THÊM: State cho modal yêu cầu đăng nhập
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const { fetchQuizQuestions, loading, currentIndex, userAnswers, questions } =
    useQuizStore();
  const axiosPrivateHook = useAxiosPrivate();
  const isDark = useDarkModeStore((state) => state.isDark);

  // 🎯 THÊM: Lấy thông tin đăng nhập
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    if (propLevel) setLevel(propLevel);
    if (propNumberOfQuestions) setNumberOfQuestions(propNumberOfQuestions);
  }, [propLevel, propNumberOfQuestions]);

  useEffect(() => {
    if (propNumberOfQuestions && propNumberOfQuestions !== numberOfQuestions) {
      // Reset timer khi số câu hỏi thay đổi (quiz mới)
      setTimeRemaining(0);
      setIsTimerActive(false);
    }
  }, [propNumberOfQuestions, numberOfQuestions]);

  useEffect(() => {
    let interval;
    if (isMinimized && isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setShowTimeUpModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isTimerActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isMinimized, isTimerActive, timeRemaining]);

  useEffect(() => {
    if (isMinimized && timeRemaining === 0) {
      const totalTime = numberOfQuestions * 60;
      setTimeRemaining(totalTime);
      setIsTimerActive(true);
    } else if (!isMinimized) {
      setIsTimerActive(false);
    }
  }, [isMinimized, numberOfQuestions]);

  const levels = [
    {
      value: "5",
      label: "N5 - Beginner",
      color: "from-slate-300 to-pink-300",
      darkColor: "from-slate-600 to-rose-700",
      description: "Cơ bản nhất",
    },
    {
      value: "4",
      label: "N4 - Elementary",
      color: "from-slate-400 to-pink-400",
      darkColor: "from-slate-600 to-rose-600",
      description: "Sơ cấp",
    },
    {
      value: "3",
      label: "N3 - Intermediate",
      color: "from-slate-500 to-rose-400",
      darkColor: "from-slate-600 to-rose-500",
      description: "Trung cấp",
    },
    {
      value: "2",
      label: "N2 - Upper-Intermediate",
      color: "from-slate-600 to-rose-500",
      darkColor: "from-slate-700 to-rose-500",
      description: "Trung cấp cao",
    },
    {
      value: "1",
      label: "N1 - Advanced",
      color: "from-[#2F4454] to-[#DA7B93]",
      darkColor: "from-slate-800 to-rose-600",
      description: "Nâng cao",
    },
  ];

  // 🎯 SỬA: Hàm xử lý bắt đầu quiz - luôn kiểm tra đăng nhập khi bấm nút
  const handleStartQuiz = async () => {
    // 🎯 THÊM: Kiểm tra đăng nhập trước, nếu chưa đăng nhập thì hiển thị modal yêu cầu
    if (!isAuthenticated) {
      setShowLoginRequiredModal(true);
      return;
    }

    // Nếu đã đăng nhập thì tiến hành bắt đầu quiz
    try {
      await fetchQuizQuestions(axiosPrivateHook, level, numberOfQuestions);
      onStartQuiz?.({ level, numberOfQuestions });
    } catch (error) {
      console.error("Error starting quiz:", error);
      try {
        await fetchQuizQuestions(axiosPublic, level, numberOfQuestions);
        onStartQuiz?.({ level, numberOfQuestions });
      } catch (publicError) {
        console.error("❌ Cả hai phương thức đều thất bại:", publicError);
        alert("Có lỗi khi tải câu hỏi. Vui lòng thử lại!");
      }
    }
  };

  // 🎯 THÊM: Xử lý khi bấm đăng nhập từ modal yêu cầu
  const handleLoginFromModal = () => {
    setShowLoginRequiredModal(false);
    onShowLoginModal?.();
  };

  // 🎯 THÊM: Đóng modal yêu cầu đăng nhập
  const handleCloseLoginRequiredModal = () => {
    setShowLoginRequiredModal(false);
  };

  const getQuestionStatus = (questionIndex) => {
    if (questionIndex === currentIndex) return "current";
    const userAnswer = userAnswers[questionIndex];
    if (userAnswer !== undefined) {
      const correctAnswer = questions[questionIndex]?.correctAnswerIndex;
      return userAnswer === correctAnswer ? "correct" : "incorrect";
    }
    return "unanswered";
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const estimatedTime = numberOfQuestions;

  const handleTimeUpModalClose = () => {
    setShowTimeUpModal(false);
    onBackToSetup?.();
  };

  const getTimeProgress = () => {
    const totalTime = numberOfQuestions * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const TimeUpModal = () => {
    if (!showTimeUpModal) return null;
    return (
      <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? "bg-black/60" : "bg-black/50"
      }`}>
        <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-scale-in transition-colors duration-300 ${
          isDark
            ? "bg-slate-800 border border-slate-700"
            : "bg-white"
        }`}>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
              isDark
                ? "bg-red-900/30"
                : "bg-red-100"
            }`}>
              <span className="material-symbols-outlined text-3xl text-red-500">
                timer_off
              </span>
            </div>
            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
              isDark ? "text-slate-100" : "text-gray-800"
            }`}>
              Hết thời gian!
            </h3>
            <p className={`mb-6 leading-relaxed transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-gray-600"
            }`}>
              Bạn đã không hoàn thành quiz trong thời gian quy định (
              {estimatedTime} phút). Kết quả sẽ không được lưu.
            </p>
            <div className={`rounded-lg p-4 mb-6 border transition-colors duration-300 ${
              isDark
                ? "bg-amber-900/20 border-amber-700/50"
                : "bg-amber-50 border-amber-200"
            }`}>
              <div className={`flex items-center gap-2 mb-1 transition-colors duration-300 ${
                isDark ? "text-amber-300" : "text-amber-800"
              }`}>
                <span className="material-symbols-outlined text-sm">info</span>
                <span className="text-sm font-medium">Thông tin</span>
              </div>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? "text-amber-300/80" : "text-amber-700"
              }`}>
                Tổng thời gian cho {numberOfQuestions} câu hỏi là{" "}
                {estimatedTime} phút. Hãy thử lại!
              </p>
            </div>
            <button
              onClick={handleTimeUpModalClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  refresh
                </span>
                Quay về Setup
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 🎯 THÊM: Modal yêu cầu đăng nhập
  const LoginRequiredModal = () => {
    if (!showLoginRequiredModal) return null;

    return (
      <div className={`fixed inset-0 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? "bg-black/60" : "bg-black/50"
      }`}>
        <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-scale-in transition-colors duration-300 ${
          isDark
            ? "bg-slate-800 border border-slate-700"
            : "bg-white"
        }`}>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 transition-colors duration-300 ${
              isDark
                ? "bg-slate-700/50 border-rose-700/30"
                : "bg-gradient-to-br from-[#2F4454]/10 to-[#DA7B93]/10 border-[#DA7B93]/20"
            }`}>
              <span className={`material-symbols-outlined text-3xl transition-colors duration-300 ${
                isDark ? "text-rose-400" : "text-[#2F4454]"
              }`}>
                lock
              </span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent mb-3">
              Yêu cầu đăng nhập
            </h3>
            <p className={`mb-6 leading-relaxed transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-slate-700"
            }`}>
              Để có thể làm quiz và lưu kết quả, bạn cần đăng nhập vào tài khoản
              của mình.
            </p>

            <div className={`rounded-lg p-4 mb-6 border transition-colors duration-300 ${
              isDark
                ? "bg-slate-700/30 border-rose-700/30"
                : "bg-gradient-to-br from-[#2F4454]/5 to-[#DA7B93]/5 border-[#DA7B93]/30"
            }`}>
              <div className={`flex items-center gap-2 mb-2 transition-colors duration-300 ${
                isDark ? "text-rose-400" : "text-[#2F4454]"
              }`}>
                <span className="material-symbols-outlined text-sm">info</span>
                <span className="text-sm font-medium">
                  Lợi ích khi đăng nhập:
                </span>
              </div>
              <ul className={`text-sm text-left space-y-1 transition-colors duration-300 ${
                isDark ? "text-slate-400" : "text-[#2F4454]/70"
              }`}>
                <li>• Lưu kết quả quiz của bạn</li>
                <li>• Theo dõi tiến độ học tập</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleLoginFromModal}
                className="px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    login
                  </span>
                  Đăng nhập ngay
                </span>
              </button>
              <button
                onClick={handleCloseLoginRequiredModal}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  isDark
                    ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isMinimized) {
    return (
      <>
        <div className={`rounded-2xl shadow-lg w-full border sticky top-4 transition-all duration-300 ease-in-out transition-colors duration-300 ${
          isDark
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-100"
        }`}>
          <div className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="material-symbols-outlined text-3xl text-rose-400">
                  quiz
                </span>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">
                  Quiz Info
                </h2>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl transition-colors duration-300 ${
                  isDark
                    ? "bg-slate-700"
                    : "bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10"
                }`}>
                  <div className={`text-sm mb-1 transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-gray-600"
                  }`}>
                    Cấp độ
                  </div>
                  <div className={`text-lg font-bold transition-colors duration-300 ${
                    isDark ? "text-rose-400" : "text-[#2F4454]"
                  }`}>
                    {levels.find((l) => l.value === level)?.label}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-colors duration-300 ${
                  isDark
                    ? "bg-slate-700 border-slate-600"
                    : "bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10 border-[#DA7B93]/20"
                }`}>
                  <div className={`text-sm mb-2 flex items-center justify-center gap-1 transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-gray-600"
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      timer
                    </span>
                    Thời gian còn lại (Tổng)
                  </div>
                  <div
                    className={`text-2xl font-bold transition-colors duration-300 ${
                      timeRemaining <= 60
                        ? "text-red-500 animate-pulse"
                        : timeRemaining <= 300
                        ? "text-orange-500"
                        : isDark
                        ? "text-rose-400"
                        : "text-[#2F4454]"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </div>
                  <div className={`w-full rounded-full h-2 mt-2 transition-colors duration-300 ${
                    isDark ? "bg-slate-600" : "bg-gray-200"
                  }`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
                        timeRemaining <= 60
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : timeRemaining <= 300
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : "bg-gradient-to-r from-slate-500 to-rose-400"
                      }`}
                      style={{ width: `${100 - getTimeProgress()}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl transition-colors duration-300 ${
                  isDark
                    ? "bg-slate-700"
                    : "bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10"
                }`}>
                  <div className={`text-sm mb-3 transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-gray-600"
                  }`}>
                    Danh sách câu hỏi
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: numberOfQuestions }, (_, index) => {
                      const status = getQuestionStatus(index);
                      return (
                        <button
                          key={index}
                          onClick={() => onQuestionSelect?.(index)}
                          className={`
                            w-10 h-10 rounded-lg text-sm font-bold transition-all duration-300 ease-in-out
                            flex items-center justify-center cursor-pointer transform
                            ${
                              status === "correct"
                                ? "bg-emerald-400 text-white shadow-md hover:bg-emerald-500 hover:shadow-lg"
                                : status === "incorrect"
                                ? "bg-rose-400 text-white shadow-md hover:bg-rose-500 hover:shadow-lg"
                                : status === "current"
                                ? isDark
                                  ? "bg-rose-600 text-white shadow-lg hover:bg-rose-500 ring-2 ring-rose-400 ring-opacity-50"
                                  : "bg-[#684d54] text-white shadow-lg hover:bg-[#da7b93] ring-2 ring-[#DA7B93] ring-opacity-50"
                                : isDark
                                ? "bg-slate-600 text-white hover:bg-slate-500 hover:shadow-md"
                                : "bg-gray-400 text-white hover:bg-gray-500 hover:shadow-md"
                            }
                          `}
                          title={
                            status === "correct"
                              ? `Câu ${index + 1}: Đúng`
                              : status === "incorrect"
                              ? `Câu ${index + 1}: Sai`
                              : status === "current"
                              ? `Câu ${index + 1}: Đang làm`
                              : `Câu ${index + 1}: Chưa làm`
                          }
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div className={`mt-3 flex items-center justify-center gap-3 text-xs transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-gray-600"
                  }`}>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-emerald-400 rounded shadow-sm"></div>
                      <span>Đúng</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-rose-400 rounded shadow-sm"></div>
                      <span>Sai</span>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      isDark ? "text-slate-300" : "text-gray-600"
                    }`}>
                      <div className={`w-3 h-3 rounded shadow-sm ${
                        isDark ? "bg-rose-600" : "bg-[#684d54]"
                      }`}></div>
                      <span>Hiện tại</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onBackToSetup}
                  className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 transform hover:scale-105 transition-colors duration-300 ${
                    isDark
                      ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      settings
                    </span>
                    Quay về Setup
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <TimeUpModal />
        <LoginRequiredModal />
      </>
    );
  }

  return (
    <>
      <div className={`rounded-3xl shadow-2xl max-w-7xl w-full p-8 border transition-colors duration-300 ${
        isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-gray-100"
      }`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="material-symbols-outlined text-5xl text-rose-400">
              quiz
            </span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">
              Kanji Quiz
            </h1>
          </div>
          <p className={`text-lg transition-colors duration-300 ${
            isDark ? "text-slate-400" : "text-gray-600"
          }`}>
            Chọn cấp độ và số câu hỏi để bắt đầu luyện tập
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-6">
          <div>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              isDark ? "text-rose-400" : "text-[#2F4454]"
            }`}>
              <span className="material-symbols-outlined">trending_up</span>
              Chọn cấp độ JLPT
            </h3>
            <div className="space-y-3">
              {levels.map((levelOption) => (
                <label
                  key={levelOption.value}
                  className={`block cursor-pointer transition-all duration-300 ${
                    level === levelOption.value
                      ? "transform scale-105"
                      : "hover:scale-102"
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={levelOption.value}
                    checked={level === levelOption.value}
                    onChange={(e) => setLevel(e.target.value)}
                    className="hidden"
                  />
                  <div
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      level === levelOption.value
                        ? `border-rose-400 bg-gradient-to-r ${isDark ? levelOption.darkColor : levelOption.color} text-white shadow-lg`
                        : isDark
                        ? "border-slate-600 bg-slate-700 hover:border-rose-400/50 hover:shadow-md"
                        : "border-gray-200 bg-white hover:border-rose-400/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`font-bold text-lg ${
                            level === levelOption.value
                              ? "text-white"
                              : isDark
                              ? "text-slate-100"
                              : "text-[#2F4454]"
                          }`}
                        >
                          {levelOption.label}
                        </div>
                        <div
                          className={`text-sm ${
                            level === levelOption.value
                              ? "text-white/90"
                              : isDark
                              ? "text-slate-400"
                              : "text-gray-600"
                          }`}
                        >
                          {levelOption.description}
                        </div>
                      </div>
                      {level === levelOption.value && (
                        <span className="material-symbols-outlined text-white">
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              isDark ? "text-rose-400" : "text-[#2F4454]"
            }`}>
              <span className="material-symbols-outlined">
                format_list_numbered
              </span>
              Số câu hỏi
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[5, 10, 15, 20, 25, 30].map((option) => (
                <button
                  key={option}
                  onClick={() => setNumberOfQuestions(option)}
                  className={`p-4 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                    numberOfQuestions === option
                      ? "border-rose-400 bg-gradient-to-r from-slate-500 to-rose-400 text-white shadow-lg transform scale-105"
                      : isDark
                      ? "border-slate-600 bg-slate-700 text-slate-100 hover:border-rose-400/50 hover:shadow-md hover:scale-102"
                      : "border-gray-200 bg-white text-[#2F4454] hover:border-rose-400/50 hover:shadow-md hover:scale-102"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                isDark ? "text-slate-300" : "text-gray-700"
              }`}>
                Hoặc nhập số câu tùy chỉnh (1-50):
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={numberOfQuestions}
                onChange={(e) => {
                  const value = Math.max(
                    1,
                    Math.min(50, parseInt(e.target.value) || 1)
                  );
                  setNumberOfQuestions(value);
                }}
                className={`w-full p-3 border-2 rounded-xl focus:border-rose-400 focus:outline-none transition-all duration-300 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
                placeholder="Nhập số câu..."
              />
            </div>
            <div className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDark
                ? "bg-slate-700/50 border-slate-600"
                : "bg-gradient-to-r from-[#2F4454]/5 to-[#DA7B93]/5 border-[#DA7B93]/20"
            }`}>
              <h4 className={`font-semibold mb-2 flex items-center gap-2 transition-colors duration-300 ${
                isDark ? "text-rose-400" : "text-[#2F4454]"
              }`}>
                <span className="material-symbols-outlined text-sm">info</span>
                Thông tin Quiz
              </h4>
              <div className={`space-y-1 text-sm transition-colors duration-300 ${
                isDark ? "text-slate-400" : "text-gray-700"
              }`}>
                <div className="flex justify-between">
                  <span>Cấp độ:</span>
                  <span className={`font-medium transition-colors duration-300 ${
                    isDark ? "text-rose-400" : "text-[#2F4454]"
                  }`}>
                    {levels.find((l) => l.value === level)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Số câu hỏi:</span>
                  <span className={`font-medium transition-colors duration-300 ${
                    isDark ? "text-rose-400" : "text-[#DA7B93]"
                  }`}>
                    {numberOfQuestions} câu
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng thời gian:</span>
                  <span className={`font-medium flex items-center gap-1 transition-colors duration-300 ${
                    isDark ? "text-emerald-400" : "text-green-600"
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      schedule
                    </span>
                    {estimatedTime} phút
                  </span>
                </div>
                <div className={`text-xs mt-2 italic transition-colors duration-300 ${
                  isDark ? "text-slate-500" : "text-gray-500"
                }`}>
                  * Tổng thời gian cho toàn bộ quiz (không phải mỗi câu)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center my-8">
          <button
            onClick={handleStartQuiz}
            disabled={loading}
            className="group relative px-12 py-4 font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-slate-500 to-rose-400 text-white"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    hourglass_empty
                  </span>
                  Đang tải...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">play_arrow</span>
                  Bắt đầu Quiz
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* 🎯 THÊM: Các Modal */}
      <TimeUpModal />
      <LoginRequiredModal />
    </>
  );
}