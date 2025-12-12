import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleWebSocket } from '../../hooks/useBattleWebSocket';
import { useBattleStore } from '../../store/useBattleStore';
import { getBattleStats } from '../../services/battleService';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import LoginModal from '../../components/Login';
import RegisterModal from '../../components/Register';
import Toast from '../../components/Toast';
import { useAuthStore } from '../../store/useAuthStore';
import ScoreDisplay from '../../components/Battle/ScoreDisplay';
import CountdownTimer from '../../components/Battle/CountdownTimer';
import QuestionCard from '../../components/Battle/QuestionCard';

export default function BattlePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  
  // Battle WebSocket hook
  const { connect, isConnected, joinQueue, leaveQueue, ready, answerQuestion, ws } = useBattleWebSocket();
  
  // Battle store
  const {
    gameState,
    setGameState,
    selectedLevel,
    setSelectedLevel,
    opponent,
    setOpponent,
    questions,
    setQuestions,
    currentQuestion,
    setCurrentQuestion,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    myScore,
    setMyScore,
    opponentScore,
    setOpponentScore,
    gameResult,
    setGameResult,
    isConnecting,
    setIsConnecting,
  } = useBattleStore();
  
  // Local state
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [isReady, setIsReady] = useState(false); // Track if current player clicked ready
  const [stats, setStats] = useState(null); // Battle stats
  
  // Login/Register modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Toast notification
  const [toast, setToast] = useState(null);

  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch battle stats when user is logged in
  useEffect(() => {
    if (user) {
      getBattleStats(axiosPrivate)
        .then(res => setStats(res.data.data))
        .catch(err => console.error('Error fetching stats:', err));
    }
  }, [user, gameState]); // Refetch when game ends

  // Helper functions - MUST be before useEffect
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const handleAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null || showResult) return; // Already answered

    setSelectedAnswer(answerIndex);
    const answerTime = Date.now() - startTimeRef.current;

    answerQuestion(currentQuestionIndex, answerIndex, answerTime);
  }, [selectedAnswer, showResult, currentQuestionIndex, answerQuestion]);

  const handleJoinQueue = () => {
    joinQueue(selectedLevel);
    setGameState('WAITING');
  };

  const handleLeaveQueue = () => {
    leaveQueue();
    setGameState('IDLE');
  };

  const handleReady = () => {
    ready();
    setIsReady(true); // Mark as ready
  };

  const handlePlayAgain = () => {
    setGameState('IDLE');
    setOpponent(null);
    setQuestions([]);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(0);
    setMyScore(0);
    setOpponentScore(0);
    setGameResult(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsReady(false); // Reset ready state
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    showToast('Đăng nhập thành công! Chào mừng đến Battle Mode!', 'success');
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    showToast('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.', 'success');
  };

  // Connect WebSocket when user logs in - ONCE ONLY
  useEffect(() => {
    // Only connect if user is logged in and not already connected/connecting
    if (!user || isConnected || isConnecting) {
      console.log('⏭️ Skipping connect:', { user: !!user, isConnected, isConnecting });
      return;
    }

    console.log('🔌 Initiating WebSocket connection...');
    
    let cancelled = false;
    
    const doConnect = async () => {
      try {
        setIsConnecting(true);
        await connect();
        if (!cancelled) {
          console.log('✅ WebSocket connected successfully');
          showToast('Đã kết nối đến server battle!', 'success');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('❌ Failed to connect:', error);
          showToast('Không thể kết nối đến server battle. Vui lòng thử lại.', 'error');
        }
      } finally {
        if (!cancelled) {
          setIsConnecting(false);
        }
      }
    };
    
    doConnect();
    
    return () => {
      cancelled = true;
    };
  }, [user]); // ONLY depend on user - connect once when user logs in

  // Setup message handlers using ws from hook
  useEffect(() => {
    if (!ws) {
      console.log('⚠️ No WebSocket instance, skipping message handler setup');
      return;
    }

    console.log('📡 Setting up WebSocket message handlers');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('📥 Received:', message.type);

      switch (message.type) {
        case 'QUEUE_JOINED':
          console.log('✅ Joined queue');
          break;

        case 'MATCH_FOUND':
          console.log('🎯 Match found:', message.payload);
          setOpponent(message.payload);
          setGameState('MATCHED');
          setIsReady(false); // Reset ready state for new match
          break;

        case 'GAME_START':
          console.log('🎮 Game started:', message.payload);
          setQuestions(message.payload.questions);
          setMyScore(0);
          setOpponentScore(0);
          setGameState('PLAYING');
          break;

        case 'QUESTION':
          console.log('❓ New question:', message.payload);
          setCurrentQuestion(message.payload.question);
          setCurrentQuestionIndex(message.payload.questionIndex);
          setTimeLeft(10);
          setSelectedAnswer(null);
          setShowResult(false);
          startTimeRef.current = message.payload.startTime;
          break;

        case 'ANSWER_RESULT':
          console.log('📊 Answer result:', message.payload);
          setMyScore(message.payload.totalScore);
          setLastResult(message.payload);
          setShowResult(true);
          break;

        case 'OPPONENT_ANSWERED':
          console.log('👥 Opponent answered:', message.payload);
          setOpponentScore(message.payload.opponentScore);
          break;

        case 'GAME_END':
          console.log('🏁 Game ended:', message.payload);
          setGameResult(message.payload);
          setGameState('ENDED');
          break;

        case 'ERROR':
          console.error('❌ Battle error:', message.payload);
          showToast('Lỗi: ' + (message.payload.error || 'Unknown error'), 'error');
          break;

        default:
          console.warn('⚠️ Unknown message type:', message.type);
      }
    };

    // No cleanup here - let the hook handle it
  }, [ws]); // Only depend on ws

  // Countdown timer - ALWAYS runs, doesn't stop when player answers
  useEffect(() => {
    if (gameState === 'PLAYING' && currentQuestion) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState, currentQuestion, currentQuestionIndex]); // Timer runs continuously

  // Show login required screen if not logged in
  if (!user) {
    return (
      <>
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-6xl mx-auto">
                {/* Battle Hero Section */}
                <div className="text-center mb-8 animate-fade-in">
                  <div className="inline-block p-6 bg-gradient-to-br from-[#2F4454] to-[#DA7B93] rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '80px' }}>
                      swords
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
                    Battle Mode
                  </h1>
                  <p className="text-lg text-gray-600">
                    Thách đấu người chơi khác trong cuộc thi kanji gay cấn!
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-[#2F4454] hover:shadow-xl transition-shadow">
                    <span className="material-symbols-outlined text-[#2F4454] text-3xl mb-2 block">
                      timer
                    </span>
                    <h3 className="font-bold text-[#2F4454] mb-1">10 Giây/Câu</h3>
                    <p className="text-sm text-gray-600">Trả lời nhanh để ghi điểm cao</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-[#DA7B93] hover:shadow-xl transition-shadow">
                    <span className="material-symbols-outlined text-[#DA7B93] text-3xl mb-2 block">
                      groups
                    </span>
                    <h3 className="font-bold text-[#DA7B93] mb-1">Đối Kháng 1v1</h3>
                    <p className="text-sm text-gray-600">Ghép đối thủ cùng level</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-[#2F4454] hover:shadow-xl transition-shadow">
                    <span className="material-symbols-outlined text-[#2F4454] text-3xl mb-2 block">
                      emoji_events
                    </span>
                    <h3 className="font-bold text-[#2F4454] mb-1">Xếp Hạng</h3>
                    <p className="text-sm text-gray-600">Tranh tài top player</p>
                  </div>
                </div>

                {/* Login CTA */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center border-2 border-[#DA7B93]/30">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#2F4454]/10 to-[#DA7B93]/10 mb-4">
                      <span className="material-symbols-outlined text-[#DA7B93] text-5xl">
                        lock
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#2F4454]">
                      Đăng Nhập Để Tham Gia
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Đăng nhập ngay để bắt đầu thử thách và leo top bảng xếp hạng!
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-8 py-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">login</span>
                      Đăng Nhập
                    </button>
                    <button
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                      }}
                      className="px-8 py-4 bg-white border-2 border-[#DA7B93] text-[#DA7B93] rounded-xl font-bold text-lg hover:bg-[#DA7B93]/5 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">person_add</span>
                      Đăng Ký
                    </button>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span>
                  <p>Bạn cần tài khoản để lưu kết quả và xếp hạng</p>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSwitchToRegister={handleSwitchToRegister}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* Register Modal */}
        {showRegisterModal && (
          <RegisterModal
            onClose={() => setShowRegisterModal(false)}
            onSwitchToLogin={handleSwitchToLogin}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                <div className="animate-spin w-16 h-16 border-4 border-[#DA7B93] border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-[#2F4454]">Đang kết nối...</h2>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render based on game state
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header with Welcome Banner */}
            <div className="mb-8 animate-fade-in">
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] rounded-2xl shadow-xl p-6 md:p-8 mb-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <span className="material-symbols-outlined text-5xl">
                        swords
                      </span>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-1">
                        Battle Mode
                      </h1>
                      <p className="text-white/90">
                        Chào mừng <span className="font-bold">{user?.fullName || user?.email}</span>! Sẵn sàng chiến đấu?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user && (
                      <button
                        onClick={() => navigate('/battle-history')}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl px-4 py-2 text-center transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-xl">history</span>
                        <span className="font-semibold">Lịch sử</span>
                      </button>
                    )}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                      <p className="text-2xl font-bold">{stats?.totalWins || 0}</p>
                      <p className="text-xs text-white/80">Thắng</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                      <p className="text-2xl font-bold">{stats?.totalLosses || 0}</p>
                      <p className="text-xs text-white/80">Thua</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#2F4454]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2F4454] text-3xl">timer</span>
                    <div>
                      <h3 className="font-bold text-[#2F4454]">10 Giây/Câu</h3>
                      <p className="text-sm text-gray-600">Nhanh = Nhiều điểm</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#DA7B93]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#DA7B93] text-3xl">groups</span>
                    <div>
                      <h3 className="font-bold text-[#DA7B93]">Đối Kháng 1v1</h3>
                      <p className="text-sm text-gray-600">Ghép tự động</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#2F4454]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2F4454] text-3xl">emoji_events</span>
                    <div>
                      <h3 className="font-bold text-[#2F4454]">Xếp Hạng</h3>
                      <p className="text-sm text-gray-600">Top Players</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* IDLE State - Select Level */}
            {gameState === 'IDLE' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-[#DA7B93]/20">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#2F4454]">Chọn Level Đấu</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                  {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                        selectedLevel === level
                          ? 'bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleJoinQueue}
                  className="w-full py-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-xl font-bold text-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🎮 Tìm Đối Thủ
                </button>
              </div>
            )}

            {/* WAITING State */}
            {gameState === 'WAITING' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center border border-[#DA7B93]/20">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 animate-spin">
                    <div className="w-full h-full border-4 border-[#DA7B93] border-t-transparent rounded-full"></div>
                  </div>
                  <div className="absolute inset-2 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}>
                    <div className="w-full h-full border-4 border-[#2F4454] border-t-transparent rounded-full"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-[#DA7B93]">
                      search
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-[#2F4454]">Đang tìm đối thủ...</h2>
                <p className="text-gray-600 mb-1">Level: <span className="font-bold text-[#DA7B93]">{selectedLevel}</span></p>
                <p className="text-sm text-gray-500 mb-6">Chờ một chút, chúng tôi đang tìm đối thủ xứng tầm với bạn!</p>
                <button
                  onClick={handleLeaveQueue}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Hủy Tìm Kiếm
                </button>
              </div>
            )}

            {/* MATCHED State */}
            {gameState === 'MATCHED' && opponent && (
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center border border-[#DA7B93]/20">
                <div className="mb-6">
                  <div className="text-6xl mb-4 animate-bounce">🎯</div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2F4454]">Đã Tìm Thấy Đối Thủ!</h2>
                </div>
                <div className="mb-8 p-6 bg-gradient-to-r from-[#2F4454]/5 to-[#DA7B93]/5 rounded-xl border border-[#DA7B93]/20">
                  <p className="text-lg mb-2 text-gray-600">Đối thủ của bạn</p>
                  <p className="text-2xl font-bold mb-3 text-[#2F4454]">{opponent.opponentName}</p>
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#DA7B93]">emoji_events</span>
                      Level: <strong>{opponent.level}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#DA7B93]">quiz</span>
                      {opponent.numberOfQuestions} câu hỏi
                    </span>
                  </div>
                </div>
                {!isReady ? (
                  <button
                    onClick={handleReady}
                    className="px-12 py-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-xl font-bold text-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Sẵn Sàng Chiến Đấu!
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 px-8 py-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-blue-700 font-semibold text-lg">Đang đợi đối thủ sẵn sàng...</span>
                    </div>
                    <p className="text-sm text-gray-500">Đối thủ đang chuẩn bị, vui lòng chờ một chút!</p>
                  </div>
                )}
              </div>
            )}

            {/* PLAYING State */}
            {gameState === 'PLAYING' && currentQuestion && (
              <div className="space-y-4">
                {/* Score Display Component */}
                <ScoreDisplay
                  player={{
                    name: user?.fullName || user?.email?.split('@')[0] || 'Bạn',
                    score: myScore
                  }}
                  opponent={{
                    name: opponent?.opponentName || 'Đối thủ',
                    score: opponentScore
                  }}
                />

                {/* Countdown Timer */}
                <div className="bg-white rounded-xl shadow-md p-4 border border-[#DA7B93]/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Câu {currentQuestionIndex + 1}/{questions.length}
                    </span>
                    <span className={`text-2xl font-bold ${
                      timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-[#2F4454]'
                    }`}>
                      {timeLeft}s
                    </span>
                  </div>
                  <CountdownTimer timeLeft={timeLeft} totalTime={10} />
                </div>

                {/* Question Card Component */}
                <QuestionCard
                  question={currentQuestion}
                  selectedAnswer={selectedAnswer}
                  onSelectAnswer={handleAnswer}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  showResult={showResult}
                  result={lastResult}
                />
              </div>
            )}

            {/* ENDED State */}
            {gameState === 'ENDED' && gameResult && (() => {
              // Determine which player is current user based on name match
              const isPlayer1 = gameResult.player1Name === (user?.fullName || user?.email);
              const myScore = isPlayer1 ? gameResult.player1Score : gameResult.player2Score;
              const opponentScore = isPlayer1 ? gameResult.player2Score : gameResult.player1Score;
              const myName = isPlayer1 ? gameResult.player1Name : gameResult.player2Name;
              const opponentName = isPlayer1 ? gameResult.player2Name : gameResult.player1Name;
              const isWinner = gameResult.winnerId === user?.id;
              
              return (
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 text-center border border-[#DA7B93]/20">
                  <div className="mb-6">
                    {gameResult.winnerId === null ? (
                      <div className="text-6xl mb-4">🤝</div>
                    ) : isWinner ? (
                      <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    ) : (
                      <div className="text-6xl mb-4">😢</div>
                    )}
                    <h2 className="text-2xl md:text-4xl font-bold mb-2">
                      {gameResult.winnerId === null ? 'Hòa!' :
                       isWinner ? 'Bạn Thắng!' : 'Bạn Thua!'}
                    </h2>
                  </div>

                  {gameResult.reason && (
                    <p className="text-red-600 mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
                      {gameResult.reason}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
                    <div className={`p-6 rounded-xl border ${
                      isWinner 
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' 
                        : 'bg-gradient-to-br from-[#2F4454]/10 to-[#2F4454]/5 border-[#2F4454]/20'
                    }`}>
                      <p className="text-sm text-gray-600 mb-2">
                        Bạn {isWinner && '🏆'}
                      </p>
                      <p className={`text-3xl md:text-5xl font-bold mb-1 ${
                        isWinner ? 'text-green-600' : 'text-[#2F4454]'
                      }`}>
                        {myScore}
                      </p>
                      <p className="text-xs text-gray-500">{myName}</p>
                    </div>
                    <div className={`p-6 rounded-xl border ${
                      gameResult.winnerId !== null && !isWinner
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' 
                        : 'bg-gradient-to-br from-[#DA7B93]/10 to-[#DA7B93]/5 border-[#DA7B93]/20'
                    }`}>
                      <p className="text-sm text-gray-600 mb-2">
                        Đối thủ {gameResult.winnerId !== null && !isWinner && '🏆'}
                      </p>
                      <p className={`text-3xl md:text-5xl font-bold mb-1 ${
                        gameResult.winnerId !== null && !isWinner ? 'text-yellow-600' : 'text-[#DA7B93]'
                      }`}>
                        {opponentScore}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{opponentName}</p>
                    </div>
                  </div>

                  <button
                    onClick={handlePlayAgain}
                    className="px-12 py-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-xl font-bold text-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Chơi Lại
                  </button>
                </div>
              );
            })()}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

