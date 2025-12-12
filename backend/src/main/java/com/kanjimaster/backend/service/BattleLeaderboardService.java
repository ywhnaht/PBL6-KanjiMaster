package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.dto.battle.BattleHistoryDto;
import com.kanjimaster.backend.model.dto.battle.BattleStatsDto;
import com.kanjimaster.backend.model.dto.battle.LeaderboardEntry;
import com.kanjimaster.backend.model.entity.BattleHistory;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.repository.BattleHistoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BattleLeaderboardService {
    static Logger logger = LoggerFactory.getLogger(BattleLeaderboardService.class);
    
    BattleHistoryRepository battleHistoryRepository;
    
    /**
     * Get top players for leaderboard
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> topWinners = battleHistoryRepository.findTopWinners(pageable);
        
        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        int rank = 1;
        
        for (Object[] result : topWinners) {
            User user = (User) result[0];
            Long wins = (Long) result[1];
            
            Long totalBattles = battleHistoryRepository.countTotalBattlesByUserId(user.getId());
            Long totalScore = battleHistoryRepository.getTotalScoreByUserId(user.getId());
            
            double winRate = totalBattles > 0 ? (wins * 100.0 / totalBattles) : 0;
            
            LeaderboardEntry entry = LeaderboardEntry.builder()
                    .rank(rank++)
                    .userId(user.getId())
                    .userName(user.getUserProfile() != null ? user.getUserProfile().getFullName() : user.getEmail())
                    .email(user.getEmail())
                    .totalWins(wins)
                    .totalBattles(totalBattles)
                    .winRate(Math.round(winRate * 100.0) / 100.0)
                    .totalScore(totalScore != null ? totalScore.intValue() : 0)
                    .build();
            
            leaderboard.add(entry);
        }
        
        logger.info("Retrieved leaderboard with {} entries", leaderboard.size());
        return leaderboard;
    }
    
    /**
     * Get battle history for a user
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<BattleHistoryDto> getBattleHistory(String userId) {
        List<BattleHistory> histories = battleHistoryRepository.findByUserId(userId);
        
        return histories.stream().map(history -> {
            boolean isPlayer1 = history.getPlayer1() != null && history.getPlayer1().getId().equals(userId);
            User opponent = isPlayer1 ? history.getPlayer2() : history.getPlayer1();
            int myScore = isPlayer1 ? history.getPlayer1Score() : history.getPlayer2Score();
            int opponentScore = isPlayer1 ? history.getPlayer2Score() : history.getPlayer1Score();
            
            boolean isWinner = history.getWinner() != null && history.getWinner().getId().equals(userId);
            boolean isDraw = history.getWinner() == null;
            
            String opponentName = "Unknown";
            String opponentEmail = "N/A";
            if (opponent != null) {
                opponentName = opponent.getUserProfile() != null ? 
                        opponent.getUserProfile().getFullName() : opponent.getEmail();
                opponentEmail = opponent.getEmail();
            }
            
            return BattleHistoryDto.builder()
                    .id(history.getId())
                    .opponentName(opponentName)
                    .opponentEmail(opponentEmail)
                    .myScore(myScore)
                    .opponentScore(opponentScore)
                    .isWinner(isWinner)
                    .isDraw(isDraw)
                    .level(history.getLevel())
                    .totalQuestions(history.getTotalQuestions())
                    .completedAt(history.getCompletedAt())
                    .build();
        }).collect(Collectors.toList());
    }
    
    /**
     * Get battle statistics for a user
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public BattleStatsDto getBattleStats(String userId) {
        Long totalBattles = battleHistoryRepository.countTotalBattlesByUserId(userId);
        Long totalWins = battleHistoryRepository.countWinsByUserId(userId);
        Long totalLosses = battleHistoryRepository.countLossesByUserId(userId);
        Long totalDraws = battleHistoryRepository.countDrawsByUserId(userId);
        
        double winRate = totalBattles > 0 ? (totalWins * 100.0 / totalBattles) : 0;
        
        Integer highestScore = battleHistoryRepository.findHighestScoreByUserId(userId);
        
        // Get favorite level
        String favoriteLevel = "N/A";
        Pageable topLevel = PageRequest.of(0, 1);
        List<Object[]> favoriteLevelResult = battleHistoryRepository.findFavoriteLevelByUserId(userId, topLevel);
        if (!favoriteLevelResult.isEmpty()) {
            favoriteLevel = (String) favoriteLevelResult.get(0)[0];
        }
        
        return BattleStatsDto.builder()
                .totalBattles(totalBattles)
                .totalWins(totalWins)
                .totalLosses(totalLosses)
                .totalDraws(totalDraws)
                .winRate(Math.round(winRate * 100.0) / 100.0)
                .highestScore(highestScore != null ? highestScore : 0)
                .favoriteLevel(favoriteLevel)
                .build();
    }
}
