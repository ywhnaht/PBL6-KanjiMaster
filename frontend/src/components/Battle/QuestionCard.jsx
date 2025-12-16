import React from 'react';
import { motion } from 'framer-motion';
import useDarkModeStore from '../../store/useDarkModeStore';

const QuestionCard = ({ 
  question, 
  selectedAnswer,
  onSelectAnswer, 
  currentQuestionIndex,
  totalQuestions,
  showResult,
  result
}) => {
  const isDark = useDarkModeStore((state) => state.isDark);
  
  if (!question) return null;
  
  const isAnswerDisabled = selectedAnswer !== null || showResult;
  const isTimeout = result?.timeout;

  return (
    <motion.div
      key={`question-${currentQuestionIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl shadow-xl overflow-hidden border transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-[#DA7B93]/20'
      }`}
    >
      <div className={`p-6 border-b transition-colors duration-300 ${
        isDark ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-300 ${
              isDark
                ? 'bg-slate-700/50 text-slate-200 border-slate-600'
                : 'bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10 text-[#2F4454] border-[#DA7B93]/20'
            }`}>
              Kanji Battle
            </span>
            <span className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Câu {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <h2 className={`text-lg md:text-xl font-bold mb-2 transition-colors duration-300 ${
            isDark ? 'text-slate-100' : 'text-[#2F4454]'
          }`}>
            {question.questionText}
          </h2>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-lg p-4 transition-colors duration-300 ${
            isDark
              ? 'bg-slate-700/50'
              : 'bg-gradient-to-r from-[#2F4454]/5 to-[#DA7B93]/5'
          }`}
        >
          <div
            className={`text-xl md:text-2xl text-center font-medium transition-colors duration-300 ${
              isDark ? 'text-slate-200' : 'text-[#2F4454]'
            }`}
            dangerouslySetInnerHTML={{ __html: question.sentence }}
          />
        </motion.div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            // Determine option state
            const isSelected = selectedAnswer === index;
            const isCorrect = result && index === result.correctAnswerIndex;
            
            let optionClass = "";
            let icon = null;
            
            if (showResult && result) {
              if (isCorrect) {
                optionClass = isDark 
                  ? 'bg-green-900/30 border-2 border-green-700 text-green-300' 
                  : 'bg-green-100 border-2 border-green-500 text-green-800';
                icon = <span className="material-symbols-outlined text-green-600">check_circle</span>;
              } else if (isSelected && !isCorrect) {
                optionClass = isDark 
                  ? 'bg-red-900/30 border-2 border-red-700 text-red-300' 
                  : 'bg-red-100 border-2 border-red-500 text-red-800';
                icon = <span className="material-symbols-outlined text-red-600">cancel</span>;
              } else {
                optionClass = isDark 
                  ? 'bg-slate-700 border-2 border-slate-600 text-slate-400' 
                  : 'bg-gray-100 border-2 border-gray-200 text-gray-500';
              }
            } else if (isSelected) {
              optionClass = isDark 
                ? 'bg-slate-600 border-2 border-[#DA7B93] text-slate-100' 
                : 'bg-[#DA7B93]/20 border-2 border-[#DA7B93] text-[#2F4454]';
            } else if (isAnswerDisabled) {
              optionClass = isDark 
                ? 'bg-slate-700 border-2 border-slate-600 text-slate-400' 
                : 'bg-gray-100 border-2 border-gray-200 text-gray-500';
            } else {
              optionClass = isDark 
                ? 'bg-slate-700 border-2 border-slate-600 hover:border-[#DA7B93] hover:bg-slate-600 text-slate-100 cursor-pointer' 
                : 'bg-white border-2 border-gray-200 hover:border-[#DA7B93] hover:bg-[#DA7B93]/5 text-gray-800 cursor-pointer';
            }
            
            return (
              <motion.button
                key={`option-${currentQuestionIndex}-${index}`}
                whileHover={{ scale: !isAnswerDisabled ? 1.02 : 1 }}
                whileTap={{ scale: !isAnswerDisabled ? 0.98 : 1 }}
                disabled={isAnswerDisabled}
                onClick={() => onSelectAnswer(index)}
                className={`p-3 rounded-xl text-left transition-all ${optionClass} ${
                  isAnswerDisabled ? 'cursor-not-allowed' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">{option}</span>
                  {icon}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Player result display */}
      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`p-4 border-t transition-colors duration-300 ${
            isTimeout
              ? isDark
                ? 'bg-yellow-900/30 border-yellow-700/50'
                : 'bg-yellow-50 border-yellow-100'
              : result.correct
                ? isDark
                  ? 'bg-green-900/30 border-green-700/50'
                  : 'bg-green-50 border-green-100'
                : isDark
                ? 'bg-red-900/30 border-red-700/50'
                : 'bg-red-50 border-red-100'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors duration-300 ${
              isTimeout
                ? isDark
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : 'bg-yellow-100 text-yellow-600'
                : result.correct
                  ? isDark
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-green-100 text-green-600'
                  : isDark
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-red-100 text-red-600'
            }`}>
              {isTimeout ? (
                <span className="material-symbols-outlined">schedule</span>
              ) : result.correct ? (
                <span className="material-symbols-outlined">check_circle</span>
              ) : (
                <span className="material-symbols-outlined">cancel</span>
              )}
            </div>
            <div>
              <p className={`font-medium transition-colors duration-300 ${
                isTimeout
                  ? isDark
                    ? 'text-yellow-300'
                    : 'text-yellow-800'
                  : result.correct
                    ? isDark
                      ? 'text-green-300'
                      : 'text-green-800'
                    : isDark
                    ? 'text-red-300'
                    : 'text-red-800'
              }`}>
                {isTimeout
                  ? 'Hết thời gian!' 
                  : result.correct
                    ? 'Chính xác!' 
                    : 'Sai rồi!'}
              </p>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {isTimeout
                  ? '+0 điểm (hết thời gian)'
                  : result.correct
                    ? `+${result.scoreGained} điểm! 🎉`
                    : `Đáp án đúng: ${question.options[result.correctAnswerIndex]}`}
              </p>
              {result.explanation && (
                <p className={`text-xs mt-1 transition-colors duration-300 ${
                  isDark ? 'text-slate-500' : 'text-gray-500'
                }`}>{result.explanation}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionCard;