import React, { useState, useEffect } from "react";
import useQuizStore from "../../store/useQuizStote";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosPublic from "../../apis/axios";

export default function QuizSetup({ onStartQuiz }) {
  const [level, setLevel] = useState("5");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Lấy actions từ store và axios instance
  const { fetchQuizQuestions } = useQuizStore();
  const axiosPrivate = useAxiosPrivate();

  const levels = [
    { value: "5", label: "N5 - Beginner", color: "from-slate-300 to-pink-300", description: "Cơ bản nhất" },
    { value: "4", label: "N4 - Elementary", color: "from-slate-400 to-pink-400", description: "Sơ cấp" },
    { value: "3", label: "N3 - Intermediate", color: "from-slate-500 to-rose-400", description: "Trung cấp" },
    { value: "2", label: "N2 - Upper-Intermediate", color: "from-slate-600 to-rose-500", description: "Trung cấp cao" },
    { value: "1", label: "N1 - Advanced", color: "from-[#2F4454] to-[#DA7B93]", description: "Nâng cao" },
  ];

  const questionOptions = [5, 10, 15, 20, 25, 30];

  // Đếm ngược thời gian
  useEffect(() => {
    if (isMinimized && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isMinimized, timeRemaining]);

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      // Gọi API để lấy câu hỏi quiz - sử dụng axiosPrivate cho API cần auth
      await fetchQuizQuestions(axiosPrivate, level, numberOfQuestions);
      
      // Set initial time (số câu hỏi * 2 phút * 60 giây)
      setTimeRemaining(numberOfQuestions * 2 * 60);
      setIsMinimized(true);
      
      // Gọi callback từ parent component
      onStartQuiz?.();
    } catch (error) {
      console.error("Error starting quiz:", error);
      
      // Thử dùng axiosPublic nếu private failed (fallback)
      try {
        console.log("Thử sử dụng API public...");
        await fetchQuizQuestions(axiosPublic, level, numberOfQuestions);
        
        setTimeRemaining(numberOfQuestions * 2 * 60);
        setIsMinimized(true);
        onStartQuiz?.();
      } catch (publicError) {
        console.error("Cả hai phương thức đều thất bại:", publicError);
        alert("Có lỗi khi tải câu hỏi. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Giao diện thu nhỏ
  if (isMinimized) {
    return (
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 border border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="material-symbols-outlined text-3xl text-[#DA7B93]">
              quiz
            </span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
              Quiz đang diễn ra
            </h2>
          </div>

          <div className="space-y-4">
            {/* Cấp độ */}
            <div className="bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10 p-4 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Cấp độ</div>
              <div className="text-xl font-bold text-[#2F4454]">
                {levels.find(l => l.value === level)?.label}
              </div>
            </div>

            {/* Số câu hỏi */}
            <div className="bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10 p-4 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Số câu hỏi</div>
              <div className="text-xl font-bold text-[#DA7B93]">
                {numberOfQuestions} câu
              </div>
            </div>

            {/* Đồng hồ đếm ngược */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-2">Thời gian còn lại</div>
              <div className="text-5xl font-bold text-green-600 font-mono">
                {formatTime(timeRemaining)}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {timeRemaining === 0 ? "Hết giờ!" : ""}
              </div>
            </div>

            {/* Nút mở rộng lại */}
            <button
              onClick={() => setIsMinimized(false)}
              className="text-sm text-[#DA7B93] hover:text-[#2F4454] transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-sm">expand_more</span>
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện đầy đủ
  return (
    <div className="bg-white rounded-3xl max-w-8xl w-full p-8 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="material-symbols-outlined text-5xl text-[#DA7B93]">
            quiz
          </span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
            Kanji Quiz
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Chọn cấp độ và số câu hỏi để bắt đầu luyện tập
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Chọn Level */}
        <div>
          <h3 className="text-xl font-semibold text-[#2F4454] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">trending_up</span>
            Chọn cấp độ JLPT
          </h3>
          
          <div className="space-y-3">
            {levels.map((levelOption) => (
              <label
                key={levelOption.value}
                className={`block cursor-pointer transition-all duration-300 ${
                  level === levelOption.value ? "transform scale-105" : "hover:scale-102"
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
                      ? "border-[#DA7B93] bg-gradient-to-r " + levelOption.color + " text-white shadow-lg"
                      : "border-gray-200 bg-white hover:border-[#DA7B93]/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold text-lg ${level === levelOption.value ? "text-white" : "text-[#2F4454]"}`}>
                        {levelOption.label}
                      </div>
                      <div className={`text-sm ${level === levelOption.value ? "text-white/90" : "text-gray-600"}`}>
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

        {/* Chọn số câu hỏi */}
        <div>
          <h3 className="text-xl font-semibold text-[#2F4454] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">format_list_numbered</span>
            Số câu hỏi
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {questionOptions.map((option) => (
              <button
                key={option}
                onClick={() => setNumberOfQuestions(option)}
                className={`p-4 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                  numberOfQuestions === option
                    ? "border-[#DA7B93] bg-gradient-to-r from-[#DA7B93] to-[#2F4454] text-white shadow-lg transform scale-105"
                    : "border-gray-200 bg-white text-[#2F4454] hover:border-[#DA7B93]/50 hover:shadow-md hover:scale-102"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoặc nhập số câu tùy chỉnh (1-50):
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={numberOfQuestions}
              onChange={(e) => {
                const value = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                setNumberOfQuestions(value);
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#DA7B93] focus:outline-none transition-all duration-300"
              placeholder="Nhập số câu..."
            />
          </div>

          {/* Thông tin quiz */}
          <div className="bg-gradient-to-r from-[#2F4454]/5 to-[#DA7B93]/5 p-4 rounded-2xl border border-[#DA7B93]/20">
            <h4 className="font-semibold text-[#2F4454] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              Thông tin Quiz
            </h4>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Cấp độ:</span>
                <span className="font-medium text-[#2F4454]">
                  {levels.find(l => l.value === level)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số câu hỏi:</span>
                <span className="font-medium text-[#DA7B93]">{numberOfQuestions} câu</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian dự kiến:</span>
                <span className="font-medium text-green-600">~{numberOfQuestions * 2} phút</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center my-8">
        <button
          onClick={handleStartQuiz}
          disabled={isLoading}
          className="group relative px-12 py-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? (
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

          {/* Hover effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-[#DA7B93] to-[#2F4454] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          
          {/* Ripple effect */}
          <span className="absolute inset-0 overflow-hidden">
            <span className="absolute top-1/2 left-1/2 w-0 h-0 bg-white/20 rounded-full group-hover:w-96 group-hover:h-96 transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2"></span>
          </span>
        </button>
      </div>
    </div>
  );
}