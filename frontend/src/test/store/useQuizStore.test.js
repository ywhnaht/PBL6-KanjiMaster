import { describe, it, expect, vi, beforeEach } from 'vitest';
import useQuizStore from '../../store/useQuizStore';

describe('useQuizStore', () => {
  beforeEach(() => {
    // Reset store state
    useQuizStore.setState({
      questions: [],
      loading: false,
      currentIndex: 0,
      score: 0,
      userAnswers: [],
      showResult: false,
      currentAnswer: null,
      quizType: 'KANJI_QUIZ',
      quizResults: [],
    });
  });

  it('initializes with default values', () => {
    const state = useQuizStore.getState();

    expect(state.questions).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.currentIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.userAnswers).toEqual([]);
    expect(state.showResult).toBe(false);
  });

  it('fetches quiz questions successfully', async () => {
    const mockQuestions = [
      {
        id: 1,
        character: '日',
        question: 'What is the meaning?',
        options: ['sun', 'moon', 'star', 'earth'],
        correctAnswer: 'sun',
      },
      {
        id: 2,
        character: '本',
        question: 'What is the meaning?',
        options: ['book', 'pen', 'paper', 'desk'],
        correctAnswer: 'book',
      },
    ];

    const mockAxios = {
      get: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: mockQuestions,
        },
      }),
    };

    await useQuizStore.getState().fetchQuizQuestions(mockAxios, 'N5', 10);

    const state = useQuizStore.getState();
    expect(state.questions).toEqual(mockQuestions);
    expect(state.loading).toBe(false);
    expect(state.currentIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quiz', {
      params: { level: 'N5', numberOfQuestion: 10 },
    });
  });

  it('handles quiz fetch error', async () => {
    const mockAxios = {
      get: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    await expect(
      useQuizStore.getState().fetchQuizQuestions(mockAxios, 'N5', 10)
    ).rejects.toThrow('Network error');

    const state = useQuizStore.getState();
    expect(state.loading).toBe(false);
  });

  it('selects an answer', () => {
    useQuizStore.getState().selectAnswer('sun');

    const state = useQuizStore.getState();
    expect(state.currentAnswer).toBe('sun');
  });

  it('submits answer and updates score for correct answer', () => {
    // Setup quiz with questions
    useQuizStore.setState({
      questions: [
        {
          id: 1,
          character: '日',
          correctAnswer: 'sun',
        },
      ],
      currentIndex: 0,
      currentAnswer: 'sun',
    });

    useQuizStore.getState().submitAnswer();

    const state = useQuizStore.getState();
    expect(state.userAnswers).toHaveLength(1);
    expect(state.userAnswers[0].isCorrect).toBe(true);
    expect(state.score).toBeGreaterThan(0);
  });

  it('submits answer without updating score for wrong answer', () => {
    useQuizStore.setState({
      questions: [
        {
          id: 1,
          character: '日',
          correctAnswer: 'sun',
        },
      ],
      currentIndex: 0,
      currentAnswer: 'moon',
    });

    useQuizStore.getState().submitAnswer();

    const state = useQuizStore.getState();
    expect(state.userAnswers).toHaveLength(1);
    expect(state.userAnswers[0].isCorrect).toBe(false);
    expect(state.score).toBe(0);
  });

  it('navigates to next question', () => {
    useQuizStore.setState({
      questions: [{ id: 1 }, { id: 2 }, { id: 3 }],
      currentIndex: 0,
    });

    useQuizStore.getState().nextQuestion();

    const state = useQuizStore.getState();
    expect(state.currentIndex).toBe(1);
    expect(state.currentAnswer).toBeNull();
  });

  it('shows result when reaching last question', () => {
    useQuizStore.setState({
      questions: [{ id: 1 }, { id: 2 }],
      currentIndex: 1,
    });

    useQuizStore.getState().nextQuestion();

    const state = useQuizStore.getState();
    expect(state.showResult).toBe(true);
  });

  it('resets quiz state', () => {
    useQuizStore.setState({
      questions: [{ id: 1 }],
      currentIndex: 5,
      score: 100,
      userAnswers: [{ id: 1, answer: 'test' }],
      showResult: true,
    });

    useQuizStore.getState().resetQuiz();

    const state = useQuizStore.getState();
    expect(state.questions).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.userAnswers).toEqual([]);
    expect(state.showResult).toBe(false);
  });

  it('calculates quiz accuracy', () => {
    useQuizStore.setState({
      userAnswers: [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
      ],
    });

    const accuracy = (useQuizStore.getState().userAnswers.filter(a => a.isCorrect).length / 
                     useQuizStore.getState().userAnswers.length) * 100;

    expect(accuracy).toBe(75);
  });
});
