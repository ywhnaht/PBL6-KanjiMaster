import { create } from "zustand";

const useQuizStore = create((set, get) => ({
  questions: [],
  loading: false,
  currentIndex: 0,
  score: 0,
  userAnswers: [],
  showResult: false,
  currentAnswer: null,
  quizType: "KANJI_QUIZ",
  quizResults: [],

  fetchQuizQuestions: async (axios, level, numberOfQuestion = 10) => {
    set({ loading: true, quizType: "KANJI_QUIZ" });
    try {
      const response = await axios.get("/api/v1/quiz", {
        params: { level, numberOfQuestion },
      });

      if (response.data.success) {
        set({
          questions: response.data.data,
          loading: false,
          currentIndex: 0,
          score: 0,
          userAnswers: [],
          showResult: false,
          currentAnswer: null,
          quizResults: [],
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch questions");
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchReviewQuestions: async (axios, level, numberOfQuestion = 20) => {
    set({ loading: true, quizType: "REVIEW_QUIZ" });
    try {
      const response = await axios.get("/api/v1/quiz/review", {
        params: { level, numberOfQuestion },
      });

      if (response.data.success) {
        set({
          questions: response.data.data,
          loading: false,
          currentIndex: 0,
          score: 0,
          userAnswers: [],
          showResult: false,
          currentAnswer: null,
          quizResults: [],
        });
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch review questions"
        );
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  submitQuizHistory: async (axios, level = "5") => {
    const { questions, userAnswers, score, quizType } = get();

    const incorrectKanjiIds = [];
    const incorrectCompoundIds = [];
    const correctReviewKanjiIds = [];
    const correctReviewCompoundIds = [];
    const detailedResults = [];

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswerIndex;

      const questionResult = {
        questionId: question.id,
        questionText: question.questionText,
        sentence: question.sentence,
        targetWord: question.targetWord,
        type: question.type,
        options: [...question.options],
        correctAnswerIndex: question.correctAnswerIndex,
        correctAnswerText: question.options[question.correctAnswerIndex],
        userAnswerIndex: userAnswer,
        userAnswerText:
          userAnswer !== undefined ? question.options[userAnswer] : null,
        isCorrect,
        explanation: question.explanation,
        questionNumber: index + 1,
      };

      detailedResults.push(questionResult);

      if (isCorrect) {
        if (question.type === "KANJI_EXAMPLE") {
          correctReviewKanjiIds.push(question.id);
        } else if (question.type === "COMPOUND_WORD") {
          correctReviewCompoundIds.push(question.id);
        }
      } else {
        if (question.type === "KANJI_EXAMPLE") {
          incorrectKanjiIds.push(question.id);
        } else if (question.type === "COMPOUND_WORD") {
          incorrectCompoundIds.push(question.id);
        }
      }
    });

    set({ quizResults: detailedResults });

    const payload = {
      level: level,
      totalQuestions: questions.length,
      totalCorrects: score,
      quizType: quizType,
      incorrectKanjiIds,
      incorrectCompoundIds,
      correctReviewKanjiIds,
      correctReviewCompoundIds,
    };

    const response = await axios.post("/api/v1/quiz/history", payload);

    if (response.data.success) {
      return {
        serverResponse: response.data.data,
        detailedResults,
        summary: {
          totalQuestions: questions.length,
          totalCorrects: score,
          incorrectCount: detailedResults.filter((r) => !r.isCorrect).length,
          correctCount: detailedResults.filter((r) => r.isCorrect).length,
        },
      };
    } else {
      throw new Error(response.data.message || "Failed to save quiz history");
    }
  },

  getDetailedResults: () => get().quizResults,
  getIncorrectQuestions: () =>
    get().quizResults.filter((result) => !result.isCorrect),
  getCorrectQuestions: () =>
    get().quizResults.filter((result) => result.isCorrect),

  exportResults: () => {
    const state = get();
    return {
      timestamp: new Date().toISOString(),
      level: state.level,
      quizType: state.quizType,
      summary: {
        totalQuestions: state.questions.length,
        score: state.score,
        percentage: ((state.score / state.questions.length) * 100).toFixed(1),
      },
      detailedResults: state.quizResults,
    };
  },

  jumpToQuestion: (questionIndex) => {
    const state = get();
    if (questionIndex >= 0 && questionIndex < state.questions.length) {
      set({
        currentIndex: questionIndex,
        currentAnswer: state.userAnswers[questionIndex] ?? null,
        showResult: state.userAnswers[questionIndex] !== undefined,
      });
    }
  },

  answerQuestion: (answerIndex) => {
    const { questions, currentIndex, score, userAnswers } = get();

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = answerIndex;

    const isCorrect =
      answerIndex === questions[currentIndex].correctAnswerIndex;
    const newScore = isCorrect ? score + 1 : score;

    set({
      userAnswers: newUserAnswers,
      score: newScore,
      currentAnswer: answerIndex,
      showResult: true,
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        showResult: false,
        currentAnswer: null,
      });
    }
  },

  resetQuiz: () => {
    set({
      currentIndex: 0,
      score: 0,
      userAnswers: [],
      showResult: false,
      currentAnswer: null,
      quizResults: [],
    });
  },

  currentQuestion: () => {
    const state = get();
    return state.questions[state.currentIndex];
  },

  totalQuestions: () => get().questions.length,

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
  },
}));

export default useQuizStore;
