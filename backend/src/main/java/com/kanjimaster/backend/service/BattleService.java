package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.QuizItem;
import com.kanjimaster.backend.model.dto.battle.*;
import com.kanjimaster.backend.model.entity.BattleHistory;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.enums.BattleMessageType;
import com.kanjimaster.backend.model.enums.BattleStatus;
import com.kanjimaster.backend.repository.BattleHistoryRepository;
import com.kanjimaster.backend.repository.UserRepository;
import com.kanjimaster.backend.websocket.BattleWebSocketHandler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BattleService {
    static Logger logger = LoggerFactory.getLogger(BattleService.class);
    static int TOTAL_QUESTIONS = 10;
    static int TIME_PER_QUESTION = 10; // seconds
    static int MAX_SCORE_PER_QUESTION = 100;
    static int MIN_SCORE_PER_QUESTION = 50;
    
    BattleMatchmakingService matchmakingService;
    QuizService quizService;
    UserRepository userRepository;
    BattleHistoryRepository battleHistoryRepository;
    BattleWebSocketHandler webSocketHandler;
    
    Map<String, BattleRoom> activeRooms = new ConcurrentHashMap<>(); // roomId -> BattleRoom
    Map<String, String> userToRoom = new ConcurrentHashMap<>(); // userId -> roomId
    
    ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);

    /**
     * Handle user joining the matchmaking queue
     */
    @Async
    public void joinQueue(String userId, String level, WebSocketSession session) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Remove from existing queue or room
        handleDisconnect(userId);
        
        BattlePlayer player = BattlePlayer.builder()
                .userId(userId)
                .userName(user.getUserProfile().getFullName())
                .email(user.getEmail())
                .session(session)
                .score(0)
                .ready(false)
                .build();
        
        matchmakingService.addToQueue(level, player);
        
        logger.info("User {} joined queue for level {}", userId, level);
        
        // Try to find match immediately
        tryMatchmaking(level);
    }

    /**
     * Handle user leaving the queue
     */
    public void leaveQueue(String userId) {
        matchmakingService.removeFromQueue(userId);
        logger.info("User {} left queue", userId);
    }

    /**
     * Handle player marking themselves as ready
     */
    @Async
    public void playerReady(String userId) {
        String roomId = userToRoom.get(userId);
        if (roomId == null) {
            logger.warn("User {} tried to ready but not in any room", userId);
            return;
        }
        
        BattleRoom room = activeRooms.get(roomId);
        if (room == null) {
            logger.warn("Room {} not found for user {}", roomId, userId);
            return;
        }
        
        BattlePlayer player = room.getPlayer(userId);
        if (player != null) {
            player.setReady(true);
            logger.info("Player {} is ready in room {}", userId, roomId);
            
            // Check if both players are ready
            if (room.getPlayer1().isReady() && room.getPlayer2().isReady()) {
                startGame(room);
            }
        }
    }

    /**
     * Handle player's answer to a question
     */
    public void handleAnswer(String userId, AnswerRequest answerRequest) {
        String roomId = userToRoom.get(userId);
        if (roomId == null) {
            logger.warn("User {} tried to answer but not in any room", userId);
            return;
        }
        
        BattleRoom room = activeRooms.get(roomId);
        if (room == null || room.getStatus() != BattleStatus.IN_PROGRESS) {
            logger.warn("Room {} invalid or not in progress", roomId);
            return;
        }
        
        BattlePlayer player = room.getPlayer(userId);
        if (player == null) {
            logger.warn("Player {} not found in room {}", userId, roomId);
            return;
        }
        
        int questionIndex = answerRequest.getQuestionIndex();
        
        // Check if player already answered this question
        if (room.hasPlayerAnswered(questionIndex, userId)) {
            logger.warn("Player {} already answered question {}", userId, questionIndex);
            return;
        }
        
        // Mark player as answered
        room.markPlayerAnswered(questionIndex, userId);
        
        QuizItem question = room.getQuestions().get(questionIndex);
        
        boolean isCorrect = question.getCorrectAnswerIndex() == answerRequest.getAnswerIndex();
        int score = 0;
        
        if (isCorrect) {
            score = calculateScore(answerRequest.getAnswerTime());
            player.addScore(score);
        }
        
        logger.info("Player {} answered question {} - Correct: {}, Score: {}", 
                userId, questionIndex, isCorrect, score);
        
        // Send result to player
        AnswerResultPayload result = AnswerResultPayload.builder()
                .questionIndex(questionIndex)
                .correct(isCorrect)
                .correctAnswerIndex(question.getCorrectAnswerIndex())
                .scoreGained(score)
                .totalScore(player.getScore())
                .explanation(question.getExplanation())
                .build();
        
        webSocketHandler.sendMessage(player.getSession(), BattleMessageType.ANSWER_RESULT, result);
        
        // Notify opponent
        BattlePlayer opponent = room.getOpponent(userId);
        OpponentAnsweredPayload opponentPayload = OpponentAnsweredPayload.builder()
                .questionIndex(questionIndex)
                .opponentScore(player.getScore())
                .build();
        
        webSocketHandler.sendMessage(opponent.getSession(), 
                BattleMessageType.OPPONENT_ANSWERED, opponentPayload);
        
        // Check if both players have answered
        if (room.haveBothPlayersAnswered(questionIndex)) {
            logger.info("Both players answered question {} in room {}", questionIndex, roomId);
            
            // Check if this was the last question
            if (questionIndex >= room.getQuestions().size() - 1) {
                scheduleGameEnd(room);
            } else {
                // Send next question after a short delay (reduced from 2s to 1s)
                scheduler.schedule(() -> sendNextQuestion(room, questionIndex + 1), 
                        1, TimeUnit.SECONDS);
            }
        } else {
            logger.info("Waiting for other player to answer question {} in room {}", questionIndex, roomId);
        }
    }

    /**
     * Handle user disconnect or leave
     */
    public void handleDisconnect(String userId) {
        // Remove from queue
        matchmakingService.removeFromQueue(userId);
        
        // Handle room disconnect
        String roomId = userToRoom.get(userId);
        if (roomId != null) {
            BattleRoom room = activeRooms.get(roomId);
            if (room != null && room.getStatus() == BattleStatus.IN_PROGRESS) {
                // Opponent wins by forfeit
                BattlePlayer opponent = room.getOpponent(userId);
                if (opponent != null) {
                    endGameEarly(room, opponent.getUserId(), "Đối thủ đã ngắt kết nối");
                }
            }
            cleanupRoom(roomId);
        }
        
        logger.info("User {} disconnected and cleaned up", userId);
    }

    // Private helper methods

    /**
     * Try to find a match in the queue for a level
     */
    private void tryMatchmaking(String level) {
        matchmakingService.findMatch(level).ifPresent(players -> {
            createBattleRoom(players[0], players[1], level);
        });
    }

    /**
     * Create a new battle room with two players
     */
    private void createBattleRoom(BattlePlayer player1, BattlePlayer player2, String level) {
        // Convert level format: N5 -> 5, N4 -> 4, etc.
        String dbLevel = level.replace("N", "");
        
        // Generate questions using existing QuizService
        logger.info("Generating {} questions for level: {} (DB format: {})", TOTAL_QUESTIONS, level, dbLevel);
        List<QuizItem> questions = quizService.generateQuiz(dbLevel, TOTAL_QUESTIONS);
        logger.info("Generated {} questions", questions.size());
        
        if (questions.isEmpty()) {
            logger.error("No questions generated for level {}! Sending error to players.", level);
            // Send error to both players
            webSocketHandler.sendMessage(player1.getSession(), BattleMessageType.ERROR, 
                Map.of("error", "Không thể tạo câu hỏi cho level " + level));
            webSocketHandler.sendMessage(player2.getSession(), BattleMessageType.ERROR, 
                Map.of("error", "Không thể tạo câu hỏi cho level " + level));
            return;
        }
        
        BattleRoom room = BattleRoom.create(player1, player2, level, questions);
        activeRooms.put(room.getRoomId(), room);
        userToRoom.put(player1.getUserId(), room.getRoomId());
        userToRoom.put(player2.getUserId(), room.getRoomId());
        
        logger.info("Battle room created: {} for players {} vs {}", 
                room.getRoomId(), player1.getUserId(), player2.getUserId());
        
        // Notify both players
        MatchFoundPayload payload1 = MatchFoundPayload.builder()
                .roomId(room.getRoomId())
                .opponentName(player2.getUserName())
                .opponentEmail(player2.getEmail())
                .level(level)
                .numberOfQuestions(TOTAL_QUESTIONS)
                .build();
        webSocketHandler.sendMessage(player1.getSession(), BattleMessageType.MATCH_FOUND, payload1);
        
        MatchFoundPayload payload2 = MatchFoundPayload.builder()
                .roomId(room.getRoomId())
                .opponentName(player1.getUserName())
                .opponentEmail(player1.getEmail())
                .level(level)
                .numberOfQuestions(TOTAL_QUESTIONS)
                .build();
        webSocketHandler.sendMessage(player2.getSession(), BattleMessageType.MATCH_FOUND, payload2);
    }

    /**
     * Start the game when both players are ready
     */
    private void startGame(BattleRoom room) {
        room.setStatus(BattleStatus.IN_PROGRESS);
        
        // Remove correctAnswerIndex from questions for security
        List<QuizItem> questionsForClient = room.getQuestions().stream()
                .map(q -> QuizItem.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .type(q.getType())
                        .sentence(q.getSentence())
                        .targetWord(q.getTargetWord())
                        .options(q.getOptions())
                        .correctAnswerIndex(-1) // Hide correct answer
                        .build())
                .toList();
        
        GameStartPayload payload = GameStartPayload.builder()
                .questions(questionsForClient)
                .timePerQuestion(TIME_PER_QUESTION)
                .build();
        
        webSocketHandler.sendMessage(room.getPlayer1().getSession(), 
                BattleMessageType.GAME_START, payload);
        webSocketHandler.sendMessage(room.getPlayer2().getSession(), 
                BattleMessageType.GAME_START, payload);
        
        logger.info("Game started for room: {}", room.getRoomId());
        
        // Send first question
        sendNextQuestion(room, 0);
    }

    /**
     * Send the next question to both players
     */
    private void sendNextQuestion(BattleRoom room, int questionIndex) {
        if (questionIndex >= room.getQuestions().size()) {
            logger.warn("Tried to send question {} but only {} questions exist", 
                    questionIndex, room.getQuestions().size());
            return;
        }
        
        QuizItem question = room.getQuestions().get(questionIndex);
        room.setCurrentQuestionIndex(questionIndex);
        
        // Don't send correct answer to client
        QuizItem questionForClient = QuizItem.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .type(question.getType())
                .sentence(question.getSentence())
                .targetWord(question.getTargetWord())
                .options(question.getOptions())
                .correctAnswerIndex(-1)
                .build();
        
        QuestionPayload payload = QuestionPayload.builder()
                .questionIndex(questionIndex)
                .question(questionForClient)
                .startTime(System.currentTimeMillis())
                .build();
        
        webSocketHandler.sendMessage(room.getPlayer1().getSession(), 
                BattleMessageType.QUESTION, payload);
        webSocketHandler.sendMessage(room.getPlayer2().getSession(), 
                BattleMessageType.QUESTION, payload);
        
        logger.info("Sent question {} to room {}", questionIndex, room.getRoomId());
        
        // Schedule timeout handler - add 2 seconds buffer for network latency
        scheduler.schedule(() -> handleQuestionTimeout(room, questionIndex), 
                TIME_PER_QUESTION + 2, TimeUnit.SECONDS);
    }
    
    /**
     * Handle timeout for a question (when time runs out)
     */
    private void handleQuestionTimeout(BattleRoom room, int questionIndex) {
        if (room.getStatus() != BattleStatus.IN_PROGRESS) {
            return;
        }
        
        // Check if both players already answered
        if (room.haveBothPlayersAnswered(questionIndex)) {
            return; // Already handled
        }
        
        logger.info("Timeout for question {} in room {}", questionIndex, room.getRoomId());
        
        QuizItem question = room.getQuestions().get(questionIndex);
        
        // Handle each player who hasn't answered
        BattlePlayer player1 = room.getPlayer1();
        BattlePlayer player2 = room.getPlayer2();
        
        if (!room.hasPlayerAnswered(questionIndex, player1.getUserId())) {
            sendTimeoutResult(player1, questionIndex, question);
            room.markPlayerAnswered(questionIndex, player1.getUserId());
        }
        
        if (!room.hasPlayerAnswered(questionIndex, player2.getUserId())) {
            sendTimeoutResult(player2, questionIndex, question);
            room.markPlayerAnswered(questionIndex, player2.getUserId());
        }
        
        // Now both are marked as "answered" (even if by timeout)
        // Move to next question or end game
        if (questionIndex >= room.getQuestions().size() - 1) {
            scheduleGameEnd(room);
        } else {
            scheduler.schedule(() -> sendNextQuestion(room, questionIndex + 1), 
                    1, TimeUnit.SECONDS);
        }
    }
    
    /**
     * Send timeout result to a player
     */
    private void sendTimeoutResult(BattlePlayer player, int questionIndex, QuizItem question) {
        AnswerResultPayload result = AnswerResultPayload.builder()
                .questionIndex(questionIndex)
                .correct(false)
                .correctAnswerIndex(question.getCorrectAnswerIndex())
                .scoreGained(0)
                .totalScore(player.getScore())
                .explanation("Hết thời gian! " + (question.getExplanation() != null ? question.getExplanation() : ""))
                .timeout(true) // Mark as timeout
                .build();
        
        webSocketHandler.sendMessage(player.getSession(), BattleMessageType.ANSWER_RESULT, result);
        logger.info("Sent timeout result to player {}", player.getUserId());
    }

    /**
     * Calculate score based on answer time
     * Faster answer = more points (100 -> 50)
     */
    private int calculateScore(long answerTimeMs) {
        long timeLimit = TIME_PER_QUESTION * 1000L;
        
        if (answerTimeMs >= timeLimit) {
            return MIN_SCORE_PER_QUESTION;
        }
        
        // Linear decrease from MAX to MIN based on time
        int score = MAX_SCORE_PER_QUESTION - 
                (int)((answerTimeMs * (MAX_SCORE_PER_QUESTION - MIN_SCORE_PER_QUESTION)) / timeLimit);
        
        return Math.max(MIN_SCORE_PER_QUESTION, score);
    }

    /**
     * Schedule game end after last question
     */
    private void scheduleGameEnd(BattleRoom room) {
        scheduler.schedule(() -> endGame(room), 3, TimeUnit.SECONDS);
    }

    /**
     * End the game normally and save results
     */
    @Transactional
    protected void endGame(BattleRoom room) {
        room.setStatus(BattleStatus.FINISHED);
        
        BattlePlayer player1 = room.getPlayer1();
        BattlePlayer player2 = room.getPlayer2();
        
        String winnerId = player1.getScore() > player2.getScore() 
                ? player1.getUserId() 
                : (player2.getScore() > player1.getScore() 
                        ? player2.getUserId() 
                        : null); // Draw
        
        String winnerName = winnerId != null 
                ? (winnerId.equals(player1.getUserId()) ? player1.getUserName() : player2.getUserName())
                : null;
        
        // Save to history
        saveBattleHistory(room, winnerId);
        
        // Send results to both players
        GameEndPayload payload = GameEndPayload.builder()
                .winnerId(winnerId)
                .winnerName(winnerName)
                .player1Name(player1.getUserName())
                .player2Name(player2.getUserName())
                .player1Score(player1.getScore())
                .player2Score(player2.getScore())
                .reason(null)
                .build();
        
        webSocketHandler.sendMessage(player1.getSession(), BattleMessageType.GAME_END, payload);
        webSocketHandler.sendMessage(player2.getSession(), BattleMessageType.GAME_END, payload);
        
        logger.info("Game ended for room: {}. Winner: {}", room.getRoomId(), 
                winnerId != null ? winnerId : "DRAW");
        
        // Cleanup after 10 seconds
        scheduler.schedule(() -> cleanupRoom(room.getRoomId()), 10, TimeUnit.SECONDS);
    }

    /**
     * End game early due to disconnect or error
     */
    private void endGameEarly(BattleRoom room, String winnerId, String reason) {
        room.setStatus(BattleStatus.FINISHED);
        saveBattleHistory(room, winnerId);
        
        BattlePlayer winner = room.getPlayer(winnerId);
        if (winner != null && winner.getSession() != null && winner.getSession().isOpen()) {
            GameEndPayload payload = GameEndPayload.builder()
                    .winnerId(winnerId)
                    .winnerName(winner.getUserName())
                    .player1Name(room.getPlayer1().getUserName())
                    .player2Name(room.getPlayer2().getUserName())
                    .player1Score(room.getPlayer1().getScore())
                    .player2Score(room.getPlayer2().getScore())
                    .reason(reason)
                    .build();
            
            webSocketHandler.sendMessage(winner.getSession(), BattleMessageType.GAME_END, payload);
        }
        
        logger.info("Game ended early for room: {}. Reason: {}", room.getRoomId(), reason);
        cleanupRoom(room.getRoomId());
    }

    /**
     * Save battle history to database
     */
    private void saveBattleHistory(BattleRoom room, String winnerId) {
        try {
            User player1User = userRepository.findById(room.getPlayer1().getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            User player2User = userRepository.findById(room.getPlayer2().getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            
            User winner = winnerId != null 
                    ? userRepository.findById(winnerId).orElse(null) 
                    : null;
            
            BattleHistory history = BattleHistory.builder()
                    .player1(player1User)
                    .player2(player2User)
                    .winner(winner)
                    .player1Score(room.getPlayer1().getScore())
                    .player2Score(room.getPlayer2().getScore())
                    .level(room.getLevel())
                    .totalQuestions(room.getQuestions().size())
                    .build();
            
            battleHistoryRepository.save(history);
            logger.info("Battle history saved for room: {}", room.getRoomId());
        } catch (Exception e) {
            logger.error("Error saving battle history for room {}: {}", room.getRoomId(), e.getMessage());
        }
    }

    /**
     * Clean up room and user mappings
     */
    private void cleanupRoom(String roomId) {
        BattleRoom room = activeRooms.remove(roomId);
        if (room != null) {
            userToRoom.remove(room.getPlayer1().getUserId());
            userToRoom.remove(room.getPlayer2().getUserId());
            logger.info("Room cleaned up: {}", roomId);
        }
    }

    /**
     * Get active room count (for monitoring)
     */
    public int getActiveRoomCount() {
        return activeRooms.size();
    }

    /**
     * Get room by user ID (for debugging)
     */
    public BattleRoom getRoomByUserId(String userId) {
        String roomId = userToRoom.get(userId);
        return roomId != null ? activeRooms.get(roomId) : null;
    }
}

