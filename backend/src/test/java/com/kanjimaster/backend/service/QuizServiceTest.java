package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.QuizItem;
import com.kanjimaster.backend.model.dto.QuizResultDto;
import com.kanjimaster.backend.model.entity.*;
import com.kanjimaster.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for QuizService
 * Tests quiz generation, answer validation, and result calculation
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private KanjiExampleRepository kanjiExampleRepository;

    @Mock
    private CompoundWordRepository compoundWordRepository;

    @Mock
    private QuizHistoryRepository quizHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserIncorrectQuestionRepository userIncorrectQuestionRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private QuizService quizService;

    private User testUser;
    private Kanji testKanji1;
    private Kanji testKanji2;
    private KanjiExamples testKanjiExample1;
    private KanjiExamples testKanjiExample2;
    private CompoundWords testCompound1;
    private CompoundWords testCompound2;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user123")
                .email("test@example.com")
                .password("password")
                .isVerified(true)
                .build();

        testKanji1 = new Kanji();
        testKanji1.setId(1);
        testKanji1.setKanji("日");
        testKanji1.setHanViet("月");
        testKanji1.setOnyomi("ニチ、ジツ");
        testKanji1.setKunyomi("ひ、か");
        testKanji1.setLevel("N5");

        testKanji2 = new Kanji();
        testKanji2.setId(2);
        testKanji2.setKanji("本");
        testKanji2.setHanViet("bản");
        testKanji2.setOnyomi("ホン");
        testKanji2.setKunyomi("もと");
        testKanji2.setLevel("N5");

        testKanjiExample1 = new KanjiExamples();
        testKanjiExample1.setId(1);
        testKanjiExample1.setKanji(testKanji1);
        testKanjiExample1.setSentence("今日");
        testKanjiExample1.setReading("きょう");
        testKanjiExample1.setMeaning("today");

        testKanjiExample2 = new KanjiExamples();
        testKanjiExample2.setId(2);
        testKanjiExample2.setKanji(testKanji2);
        testKanjiExample2.setSentence("本屋");
        testKanjiExample2.setReading("ほんや");
        testKanjiExample2.setMeaning("bookstore");

        testCompound1 = new CompoundWords();
        testCompound1.setId(1);
        testCompound1.setWord("日本");
        testCompound1.setReading("にほん");
        testCompound1.setMeaning("Japan");

        testCompound2 = new CompoundWords();
        testCompound2.setId(2);
        testCompound2.setWord("本当");
        testCompound2.setReading("ほんとう");
        testCompound2.setMeaning("really");
    }

    @Test
    void generateQuiz_Success() {
        // Given
        String level = "N5";
        int numberOfQuestions = 4;
        
        List<KanjiExamples> kanjiExamples = Arrays.asList(testKanjiExample1, testKanjiExample2);
        List<CompoundWords> compounds = Arrays.asList(testCompound1, testCompound2);

        when(kanjiExampleRepository.findRandomExamplesByKanjiLevel(eq(level), anyInt()))
                .thenReturn(kanjiExamples);
        when(compoundWordRepository.findRandomCompoundsByKanjiLevel(eq(level), anyInt()))
                .thenReturn(compounds);

        // When
        List<QuizItem> quizItems = quizService.generateQuiz(level, numberOfQuestions);

        // Then
        assertNotNull(quizItems);
        assertTrue(quizItems.size() <= numberOfQuestions);
        verify(kanjiExampleRepository).findRandomExamplesByKanjiLevel(eq(level), anyInt());
        verify(compoundWordRepository).findRandomCompoundsByKanjiLevel(eq(level), anyInt());
    }

    @Test
    void saveQuizResult_Success() {
        // Given
        String userId = "user123";
        QuizResultDto quizResult = QuizResultDto.builder()
                .level("N5")
                .totalQuestions(10)
                .totalCorrects(8)
                .quizType("KANJI_QUIZ")
                .incorrectKanjiIds(Arrays.asList(1, 2))
                .incorrectCompoundIds(Collections.emptyList())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(quizHistoryRepository.save(any(QuizHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        assertDoesNotThrow(() -> quizService.saveQuizResult(quizResult, userId));

        // Then
        verify(userRepository).findById(userId);
        verify(quizHistoryRepository).save(any(QuizHistory.class));
        verify(notificationService).createQuickNotification(anyString(), anyString(), anyString(), any());
    }

    @Test
    void saveQuizResult_UserNotFound_ThrowsException() {
        // Given
        String userId = "nonexistent";
        QuizResultDto quizResult = QuizResultDto.builder()
                .level("N5")
                .totalQuestions(10)
                .totalCorrects(5)
                .quizType("KANJI_QUIZ")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> quizService.saveQuizResult(quizResult, userId));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(quizHistoryRepository, never()).save(any(QuizHistory.class));
    }

    @Test
    void saveQuizResult_LowScore_NoNotification() {
        // Given
        String userId = "user123";
        QuizResultDto quizResult = QuizResultDto.builder()
                .level("N5")
                .totalQuestions(10)
                .totalCorrects(4) // 40% - below 50% threshold
                .quizType("KANJI_QUIZ")
                .incorrectKanjiIds(Arrays.asList(1, 2, 3, 4, 5, 6))
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(quizHistoryRepository.save(any(QuizHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        assertDoesNotThrow(() -> quizService.saveQuizResult(quizResult, userId));

        // Then
        verify(userRepository).findById(userId);
        verify(quizHistoryRepository).save(any(QuizHistory.class));
        // Should NOT send notification for score < 50%
        verify(notificationService, never()).createQuickNotification(anyString(), anyString(), anyString(), any());
    }
}
