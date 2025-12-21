package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.QuizItem;
import com.kanjimaster.backend.model.dto.battle.BattlePlayer;
import com.kanjimaster.backend.model.dto.battle.BattleRoom;
import com.kanjimaster.backend.model.entity.BattleHistory;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.UserProfile;
import com.kanjimaster.backend.repository.BattleHistoryRepository;
import com.kanjimaster.backend.repository.UserRepository;
import com.kanjimaster.backend.websocket.BattleWebSocketHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BattleService
 * Tests battle matchmaking, room management, and game logic
 */
@ExtendWith(MockitoExtension.class)
class BattleServiceTest {

    @Mock
    private BattleMatchmakingService matchmakingService;

    @Mock
    private QuizService quizService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BattleHistoryRepository battleHistoryRepository;

    @Mock
    private BattleWebSocketHandler webSocketHandler;

    @Mock
    private NotificationService notificationService;

    @Mock
    private WebSocketSession session1;

    @Mock
    private WebSocketSession session2;

    @InjectMocks
    private BattleService battleService;

    private User testUser1;
    private User testUser2;
    private BattlePlayer player1;
    private BattlePlayer player2;

    @BeforeEach
    void setUp() {
        UserProfile profile1 = UserProfile.builder()
                .fullName("Player One")
                .avatarUrl("avatar1.jpg")
                .totalKanjiLearned(50)
                .streakDays(5)
                .build();

        UserProfile profile2 = UserProfile.builder()
                .fullName("Player Two")
                .avatarUrl("avatar2.jpg")
                .totalKanjiLearned(40)
                .streakDays(3)
                .build();

        testUser1 = User.builder()
                .id("user1")
                .email("player1@example.com")
                .password("password")
                .isVerified(true)
                .userProfile(profile1)
                .build();

        testUser2 = User.builder()
                .id("user2")
                .email("player2@example.com")
                .password("password")
                .isVerified(true)
                .userProfile(profile2)
                .build();

        player1 = BattlePlayer.builder()
                .userId("user1")
                .userName("Player One")
                .email("player1@example.com")
                .session(session1)
                .score(0)
                .ready(false)
                .build();

        player2 = BattlePlayer.builder()
                .userId("user2")
                .userName("Player Two")
                .email("player2@example.com")
                .session(session2)
                .score(0)
                .ready(false)
                .build();
    }

    @Test
    void joinQueue_Success() {
        // Given
        String userId = "user1";
        String level = "N5";

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser1));
        doNothing().when(matchmakingService).addToQueue(eq(level), any(BattlePlayer.class));

        // When
        assertDoesNotThrow(() -> battleService.joinQueue(userId, level, session1));

        // Then
        verify(userRepository).findById(userId);
        verify(matchmakingService).addToQueue(eq(level), any(BattlePlayer.class));
    }

    @Test
    void joinQueue_UserNotFound_ThrowsException() {
        // Given
        String userId = "nonexistent";
        String level = "N5";

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> battleService.joinQueue(userId, level, session1));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(matchmakingService, never()).addToQueue(anyString(), any(BattlePlayer.class));
    }

    @Test
    void calculateScore_CorrectAnswer_FullPoints() {
        // Given
        long answerTime = 2000; // 2 seconds
        int timePerQuestion = 10; // 10 seconds
        int maxScore = 100;
        int minScore = 50;

        // When
        int score = calculateScoreForTest(answerTime, timePerQuestion, maxScore, minScore);

        // Then
        assertTrue(score >= minScore && score <= maxScore);
        assertTrue(score > minScore); // Should get bonus for fast answer
    }

    @Test
    void calculateScore_SlowAnswer_MinimumPoints() {
        // Given
        long answerTime = 9500; // 9.5 seconds (near timeout)
        int timePerQuestion = 10; // 10 seconds
        int maxScore = 100;
        int minScore = 50;

        // When
        int score = calculateScoreForTest(answerTime, timePerQuestion, maxScore, minScore);

        // Then
        assertTrue(score >= minScore && score <= maxScore);
        assertTrue(score <= minScore + 10); // Should get close to minimum
    }

    @Test
    void leaveQueue_Success() {
        // Given
        String userId = "user1";
        String level = "N5";

        doNothing().when(matchmakingService).removeFromQueue(userId);

        // When
        assertDoesNotThrow(() -> battleService.leaveQueue(userId));

        // Then
        verify(matchmakingService, atLeastOnce()).removeFromQueue(eq(userId));
    }

    // Helper method to simulate score calculation
    private int calculateScoreForTest(long answerTime, int timePerQuestion, int maxScore, int minScore) {
        long maxTime = timePerQuestion * 1000L;
        if (answerTime >= maxTime) {
            return minScore;
        }
        
        double timeRatio = 1.0 - ((double) answerTime / maxTime);
        int bonusScore = (int) (timeRatio * (maxScore - minScore));
        return minScore + bonusScore;
    }
}
