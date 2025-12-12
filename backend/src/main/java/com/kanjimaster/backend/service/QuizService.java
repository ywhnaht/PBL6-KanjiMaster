package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.QuizItem;
import com.kanjimaster.backend.model.dto.QuizResultDto;
import com.kanjimaster.backend.model.entity.*;
import com.kanjimaster.backend.model.enums.QuestionType;
import com.kanjimaster.backend.repository.*;
import com.kanjimaster.backend.util.QuizUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizService {
    KanjiExampleRepository kanjiExampleRepository;
    CompoundWordRepository compoundWordRepository;
    QuizHistoryRepository quizHistoryRepository;
    UserIncorrectQuestionRepository incorrectQuestionRepository;
    UserRepository userRepository;

    public List<QuizItem> generateQuiz(String level, int numberOfQuestions) {
        List<QuizItem> quizItems = new ArrayList<>();

        int kanjiCount = numberOfQuestions / 2;
        int compoundCount = numberOfQuestions - kanjiCount;

        List<KanjiExamples> randomKanjis = kanjiExampleRepository.findRandomExamplesByKanjiLevel(level, kanjiCount);
        List<CompoundWords> randomCompounds = compoundWordRepository.findRandomCompoundsByKanjiLevel(level, compoundCount);

        for (int i =  0; i < kanjiCount && i < randomKanjis.size(); i++) {
            quizItems.add(createKanjiQuestion(randomKanjis.get(i), level));
        }

        for (int i = 0; i < compoundCount && i < randomCompounds.size(); i++) {
            quizItems.add(createCompoundQuestion(randomCompounds.get(i), level));
        }

        Collections.shuffle(quizItems);

        return quizItems.subList(0, Math.min(quizItems.size(), numberOfQuestions));
    }

    @Transactional
    public void saveQuizResult(QuizResultDto quizResult, String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        QuizHistory quizHistory = QuizHistory.builder()
                .quizType(quizResult.getQuizType())
                .level(quizResult.getLevel())
                .totalQuestions(quizResult.getTotalQuestions())
                .score(quizResult.getTotalCorrects())
                .user(user)
                .build();

        quizHistoryRepository.save(quizHistory);

        if (quizResult.getIncorrectKanjiIds() != null) {
            quizResult.getIncorrectKanjiIds().forEach(kanjiExampleId -> {
                addIncorrectQuestion(user, kanjiExampleId, QuestionType.KANJI_EXAMPLE, quizResult.getLevel());
            });
        }

        if (quizResult.getIncorrectCompoundIds() != null) {
            quizResult.getIncorrectCompoundIds().forEach(compoundId -> {
                addIncorrectQuestion(user, compoundId, QuestionType.COMPOUND_WORD, quizResult.getLevel());
            });
        }

        if (quizResult.getCorrectReviewKanjiIds() != null && !quizResult.getCorrectReviewKanjiIds().isEmpty()) {
            incorrectQuestionRepository.deleteReviewQuestions(userId, QuestionType.KANJI_EXAMPLE, quizResult.getCorrectReviewKanjiIds());
        }

        if (quizResult.getCorrectReviewCompoundIds() != null && !quizResult.getCorrectReviewCompoundIds().isEmpty()) {
            incorrectQuestionRepository.deleteReviewQuestions(userId, QuestionType.COMPOUND_WORD, quizResult.getCorrectReviewCompoundIds());
        }
    }

    public List<QuizItem> getReviewQuiz(String userId, String level, int numberOfQuestion) {
        List<UserIncorrectQuestion> incorrectQuestions = incorrectQuestionRepository.findReviewQuestionsByLevel(
                userId, level, PageRequest.of(0, numberOfQuestion)
        );

        List<QuizItem> reviewQuiz = new ArrayList<>();

        for (UserIncorrectQuestion incorrectQuestion : incorrectQuestions) {
            if (incorrectQuestion.getQuestionType() == QuestionType.KANJI_EXAMPLE) {
                kanjiExampleRepository.findById(incorrectQuestion.getQuestionId()).ifPresent(kanjiExample -> {
                    reviewQuiz.add(createKanjiQuestion(kanjiExample, level));
                });
            } else if (incorrectQuestion.getQuestionType() == QuestionType.COMPOUND_WORD) {
                compoundWordRepository.findById(incorrectQuestion.getQuestionId()).ifPresent(compoundWord -> {
                    reviewQuiz.add(createCompoundQuestion(compoundWord, level));
                });
            }
        }

        return reviewQuiz;
    }

    private void addIncorrectQuestion(User user, Integer questionId, QuestionType type, String level) {
        incorrectQuestionRepository.findByUser_IdAndQuestionIdAndQuestionType(user.getId(), questionId, type)
                .ifPresentOrElse(
                        (existing) -> {},
                        () -> {
                            UserIncorrectQuestion newIncorrect = UserIncorrectQuestion.builder()
                                    .user(user)
                                    .level(level)
                                    .questionId(questionId)
                                    .questionType(type)
                                    .build();
                            incorrectQuestionRepository.save(newIncorrect);
                        }
                );
    }

    private QuizItem createKanjiQuestion(KanjiExamples kanjiExamples, String level) {
        QuizItem quizItem = new QuizItem();
        quizItem.setId(kanjiExamples.getId());
        quizItem.setType(QuestionType.KANJI_EXAMPLE);
        quizItem.setQuestionText("Chọn cách đọc đúng cho từ kanji gạch chân!");

        String reading = kanjiExamples.getReading();
        String targetWord = kanjiExamples.getTargetWord();

        quizItem.setSentence(QuizUtils.highlightTargetWord(kanjiExamples.getSentence(), targetWord));
        quizItem.setTargetWord(targetWord);

        List<String> options = new ArrayList<>();
        options.add(reading);

        List<String> distractor = new ArrayList<>();
        String suffix = QuizUtils.getOkuriganaSuffix(targetWord);

        if (!suffix.isEmpty()) {
            List<KanjiExamples> similarExamples = kanjiExampleRepository.findDistractorsBySuffix(suffix, kanjiExamples.getId(), 5);
            for (KanjiExamples similar : similarExamples) {
                if (!options.contains(similar.getReading()) && !distractor.contains(similar.getReading())) {
                    distractor.add(similar.getReading());
                }
            }
        }

        if (options.size() + distractor.size() < 4) {
            int needed = 4 - (options.size() + distractor.size());
            List<KanjiExamples> randomKanjis = kanjiExampleRepository.findRandomExamplesByKanjiLevel(level, needed * 3);
            for (KanjiExamples similar : randomKanjis) {
                if (options.size() + distractor.size() >= 4) break;
                if (!options.contains(similar.getReading()) &&  !distractor.contains(similar.getReading())) {
                    distractor.add(similar.getReading());
                }
            }
        }

        addToOptions(quizItem, reading, options, distractor);
        quizItem.setExplanation("Từ vựng: " + targetWord + " (" + reading + ") - Nghĩa của câu: " + kanjiExamples.getMeaning());

        return quizItem;
    }

    private QuizItem createCompoundQuestion(CompoundWords compoundWords, String level) {
        QuizItem quizItem = new QuizItem();
        quizItem.setId(compoundWords.getId());
        quizItem.setType(QuestionType.COMPOUND_WORD);
        quizItem.setQuestionText("Chọn cách đọc đúng cho từ kanji gạch chân!");

        String reading = compoundWords.getHiragana();
        String targetWord = compoundWords.getWord();

        quizItem.setSentence(QuizUtils.highlightTargetWord(compoundWords.getExample(), targetWord));
        quizItem.setTargetWord(targetWord);

        List<String> options = new ArrayList<>();
        options.add(reading);

        List<String> distractor = new ArrayList<>();
        String suffix = QuizUtils.getOkuriganaSuffix(reading);

        if (!suffix.isEmpty()) {
            List<CompoundWords> similarExamples = compoundWordRepository.findDistractorsBySuffix(suffix, compoundWords.getId(), 5);
            for (CompoundWords similar : similarExamples) {
                if (!options.contains(similar.getHiragana()) && !distractor.contains(similar.getHiragana())) {
                    distractor.add(similar.getHiragana());
                }
            }
        }

        if (options.size() + distractor.size() < 4) {
            int needed = 4 - (options.size() + distractor.size());
            List<CompoundWords> randomCompounds = compoundWordRepository.findRandomCompoundsByKanjiLevel(level, needed * 3);
            for (CompoundWords similar : randomCompounds) {
                if (options.size() + distractor.size() >= 4) break;
                if (!options.contains(similar.getHiragana()) &&  !distractor.contains(similar.getHiragana())) {
                    distractor.add(similar.getHiragana());
                }
            }
        }

        addToOptions(quizItem, reading, options, distractor);
        quizItem.setExplanation("Từ vựng: " + targetWord + " (" + reading + ") - Nghĩa: " + compoundWords.getMeaning());

        return quizItem;
    }

    private void addToOptions(QuizItem quizItem, String reading, List<String> options, List<String> distractor) {
        options.addAll(distractor);
        Collections.shuffle(options);

        if (options.size() > 4) {
            options = options.subList(0, 4);
            if (!options.contains(reading)) {
                options.set(0, reading);
                Collections.shuffle(options);
            }
        }

        quizItem.setOptions(options);
        quizItem.setCorrectAnswerIndex(options.indexOf(reading));
    }
}
