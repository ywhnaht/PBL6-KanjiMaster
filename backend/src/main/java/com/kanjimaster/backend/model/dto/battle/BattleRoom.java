package com.kanjimaster.backend.model.dto.battle;

import com.kanjimaster.backend.model.dto.QuizItem;
import com.kanjimaster.backend.model.enums.BattleStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BattleRoom {
    String roomId;
    BattlePlayer player1;
    BattlePlayer player2;
    BattleStatus status;
    List<QuizItem> questions;
    String level;
    int currentQuestionIndex;
    LocalDateTime createdAt;
    
    // Track which players have answered the current question
    @Builder.Default
    Map<Integer, Map<String, Boolean>> questionAnswers = new HashMap<>(); // questionIndex -> (userId -> hasAnswered)

    public static BattleRoom create(BattlePlayer player1, BattlePlayer player2, String level, List<QuizItem> questions) {
        return BattleRoom.builder()
                .roomId(UUID.randomUUID().toString())
                .player1(player1)
                .player2(player2)
                .status(BattleStatus.READY)
                .questions(questions)
                .level(level)
                .currentQuestionIndex(0)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public BattlePlayer getOpponent(String userId) {
        if (player1.getUserId().equals(userId)) {
            return player2;
        }
        return player1;
    }

    public BattlePlayer getPlayer(String userId) {
        if (player1.getUserId().equals(userId)) {
            return player1;
        }
        return player2;
    }
    
    /**
     * Mark that a player has answered the current question
     */
    public void markPlayerAnswered(int questionIndex, String userId) {
        questionAnswers.computeIfAbsent(questionIndex, k -> new HashMap<>())
                .put(userId, true);
    }
    
    /**
     * Check if both players have answered the current question
     */
    public boolean haveBothPlayersAnswered(int questionIndex) {
        Map<String, Boolean> answers = questionAnswers.get(questionIndex);
        if (answers == null) return false;
        
        return answers.getOrDefault(player1.getUserId(), false) && 
               answers.getOrDefault(player2.getUserId(), false);
    }
    
    /**
     * Check if a specific player has answered
     */
    public boolean hasPlayerAnswered(int questionIndex, String userId) {
        Map<String, Boolean> answers = questionAnswers.get(questionIndex);
        return answers != null && answers.getOrDefault(userId, false);
    }
}
