import React from 'react';
import { motion } from 'framer-motion';

const QuestionCard = ({ 
  question, 
  selectedAnswer,
  onSelectAnswer, 
  currentQuestionIndex,
  totalQuestions,
  showResult,
  result
}) => {
  if (!question) return null;
  
  const isAnswerDisabled = selectedAnswer !== null || showResult;
  const isTimeout = result?.timeout;

  return (
    <motion.div
      key={`question-${currentQuestionIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#DA7B93]/20"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10 text-[#2F4454] rounded-full text-sm font-medium border border-[#DA7B93]/20">
              Kanji Battle
            </span>
            <span className="text-sm text-gray-500 font-medium">
              Câu {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-[#2F4454] mb-2">
            {question.questionText}
          </h2>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-[#2F4454]/5 to-[#DA7B93]/5 rounded-lg p-4"
        >
          <div
            className="text-xl md:text-2xl text-center font-medium text-[#2F4454]"
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
                optionClass = 'bg-green-100 border-2 border-green-500 text-green-800';
                icon = <span className="material-symbols-outlined text-green-600">check_circle</span>;
              } else if (isSelected && !isCorrect) {
                optionClass = 'bg-red-100 border-2 border-red-500 text-red-800';
                icon = <span className="material-symbols-outlined text-red-600">cancel</span>;
              } else {
                optionClass = 'bg-gray-100 border-2 border-gray-200 text-gray-500';
              }
            } else if (isSelected) {
              optionClass = 'bg-[#DA7B93]/20 border-2 border-[#DA7B93] text-[#2F4454]';
            } else if (isAnswerDisabled) {
              optionClass = 'bg-gray-100 border-2 border-gray-200 text-gray-500';
            } else {
              optionClass = 'bg-white border-2 border-gray-200 hover:border-[#DA7B93] hover:bg-[#DA7B93]/5 cursor-pointer';
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
          className={`p-4 border-t ${
            isTimeout
              ? 'bg-yellow-50 border-yellow-100' 
              : result.correct
                ? 'bg-green-50 border-green-100' 
                : 'bg-red-50 border-red-100'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              isTimeout
                ? 'bg-yellow-100 text-yellow-600'
                : result.correct
                  ? 'bg-green-100 text-green-600' 
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
              <p className={`font-medium ${
                isTimeout
                  ? 'text-yellow-800'
                  : result.correct
                    ? 'text-green-800' 
                    : 'text-red-800'
              }`}>
                {isTimeout
                  ? 'Hết thời gian!' 
                  : result.correct
                    ? 'Chính xác!' 
                    : 'Sai rồi!'}
              </p>
              <p className="text-sm text-gray-600">
                {isTimeout
                  ? '+0 điểm (hết thời gian)'
                  : result.correct
                    ? `+${result.scoreGained} điểm! 🎉`
                    : `Đáp án đúng: ${question.options[result.correctAnswerIndex]}`}
              </p>
              {result.explanation && (
                <p className="text-xs text-gray-500 mt-1">{result.explanation}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
