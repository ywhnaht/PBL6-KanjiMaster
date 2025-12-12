import { create } from 'zustand';

export const useBattleStore = create((set) => ({
  // WebSocket instance
  ws: null,
  setWs: (ws) => set({ ws }),

  // Connection state
  isConnected: false,
  isConnecting: false,
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),

  // Battle token
  battleToken: null,
  setBattleToken: (battleToken) => set({ battleToken }),

  // Game state
  gameState: 'IDLE', // IDLE, WAITING, MATCHED, PLAYING, ENDED
  setGameState: (gameState) => set({ gameState }),

  // Player info
  opponent: null,
  setOpponent: (opponent) => set({ opponent }),

  // Questions
  questions: [],
  currentQuestion: null,
  currentQuestionIndex: 0,
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),

  // Scores
  myScore: 0,
  opponentScore: 0,
  setMyScore: (myScore) => set({ myScore }),
  setOpponentScore: (opponentScore) => set({ opponentScore }),

  // Game result
  gameResult: null,
  setGameResult: (gameResult) => set({ gameResult }),

  // Selected level
  selectedLevel: null,
  setSelectedLevel: (selectedLevel) => set({ selectedLevel }),

  // Reset all state
  reset: () => set({
    ws: null,
    isConnected: false,
    isConnecting: false,
    battleToken: null,
    gameState: 'IDLE',
    opponent: null,
    questions: [],
    currentQuestion: null,
    currentQuestionIndex: 0,
    myScore: 0,
    opponentScore: 0,
    gameResult: null,
    selectedLevel: null,
  }),
}));

