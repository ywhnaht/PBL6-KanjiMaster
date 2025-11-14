import { create } from "zustand";

const useQuizStore = create((set, get) => ({
  // State
  questions: [],
  loading: false,
  currentIndex: 0,
  score: 0,
  userAnswers: [],
  showResult: false,
  currentAnswer: null,
  quizType: "KANJI_QUIZ", // "KANJI_QUIZ" hoặc "REVIEW_QUIZ"

  // Actions

  // 1. GET /api/v1/quiz - Lấy câu hỏi quiz thường
  fetchQuizQuestions: async (axios, level, numberOfQuestion = 10) => {
    set({ loading: true, quizType: "KANJI_QUIZ" });
    try {
      const response = await axios.get('/api/v1/quiz', {
        params: { level, numberOfQuestion }
      });

      if (response.data.success) {
        set({
          questions: response.data.data,
          loading: false,
          currentIndex: 0,
          score: 0,
          userAnswers: [],
          showResult: false,
          currentAnswer: null
        });
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // 2. GET /api/v1/quiz/review - Lấy câu hỏi ôn tập
  fetchReviewQuestions: async (axios, level, numberOfQuestion = 20) => {
    set({ loading: true, quizType: "REVIEW_QUIZ" });
    try {
      const response = await axios.get('/api/v1/quiz/review', {
        params: { level, numberOfQuestion }
      });

      if (response.data.success) {
        set({
          questions: response.data.data,
          loading: false,
          currentIndex: 0,
          score: 0,
          userAnswers: [],
          showResult: false,
          currentAnswer: null
        });
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching review quiz:', error);
      throw error;
    }
  },

  // 3. POST /api/v1/quiz/history - Lưu kết quả quiz
  submitQuizHistory: async (axios, level = "5") => {
    const { questions, userAnswers, score, quizType } = get();
    
    try {
      // Phân loại câu đúng/sai
      const incorrectKanjiIds = [];
      const incorrectCompoundIds = [];
      const correctReviewKanjiIds = [];
      const correctReviewCompoundIds = [];

      questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswerIndex;
        
        if (isCorrect) {
          // Câu đúng nhưng muốn ôn lại
          if (question.type === "KANJI_EXAMPLE") {
            correctReviewKanjiIds.push(question.id);
          } else if (question.type === "COMPOUND_WORD") {
            correctReviewCompoundIds.push(question.id);
          }
        } else {
          // Câu sai
          if (question.type === "KANJI_EXAMPLE") {
            incorrectKanjiIds.push(question.id);
          } else if (question.type === "COMPOUND_WORD") {
            incorrectCompoundIds.push(question.id);
          }
        }
      });

      const payload = {
        level: level,
        totalQuestions: questions.length,
        totalCorrects: score,
        quizType: quizType,
        incorrectKanjiIds,
        incorrectCompoundIds,
        correctReviewKanjiIds,
        correctReviewCompoundIds
      };

      const response = await axios.post('/api/v1/quiz/history', payload);
      
      if (response.data.success) {
        console.log('✅ Đã lưu kết quả quiz history');
        return response.data.data; // Trả về data từ server
      } else {
        throw new Error(response.data.message || 'Failed to save quiz history');
      }
    } catch (error) {
      console.error('❌ Lỗi khi lưu quiz history:', error);
      throw error;
    }
  },

  // Quiz actions
  answerQuestion: (answerIndex) => {
    const { questions, currentIndex, score, userAnswers } = get();
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = answerIndex;

    const isCorrect = answerIndex === questions[currentIndex].correctAnswerIndex;
    const newScore = isCorrect ? score + 1 : score;

    set({
      userAnswers: newUserAnswers,
      score: newScore,
      currentAnswer: answerIndex,
      showResult: true
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ 
        currentIndex: currentIndex + 1,
        showResult: false,
        currentAnswer: null
      });
    }
  },

  resetQuiz: () => {
    set({
      currentIndex: 0,
      score: 0,
      userAnswers: [],
      showResult: false,
      currentAnswer: null
    });
  },

  // Getters
  currentQuestion: () => {
    const state = get();
    return state.questions[state.currentIndex];
  },

  totalQuestions: () => {
    return get().questions.length;
  },

  progress: () => {
    const state = get();
    if (state.totalQuestions() === 0) return 0;
    return ((state.currentIndex + 1) / state.totalQuestions()) * 100;
  },

  isCompleted: () => {
    const state = get();
    return state.currentIndex >= state.questions.length;
  },

  isLastQuestion: () => {
    const state = get();
    return state.currentIndex === state.questions.length - 1;
  }
}));

export default useQuizStore;