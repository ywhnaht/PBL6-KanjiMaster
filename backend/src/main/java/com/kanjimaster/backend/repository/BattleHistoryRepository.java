package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.BattleHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleHistoryRepository extends JpaRepository<BattleHistory, Integer> {
    @Query("SELECT bh FROM BattleHistory bh " +
           "LEFT JOIN FETCH bh.player1 p1 " +
           "LEFT JOIN FETCH bh.player2 p2 " +
           "LEFT JOIN FETCH bh.winner w " +
           "LEFT JOIN FETCH p1.userProfile " +
           "LEFT JOIN FETCH p2.userProfile " +
           "WHERE bh.player1.id = :userId OR bh.player2.id = :userId " +
           "ORDER BY bh.completedAt DESC")
    List<BattleHistory> findByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(bh) FROM BattleHistory bh WHERE bh.winner.id = :userId")
    Long countWinsByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(bh) FROM BattleHistory bh WHERE bh.player1.id = :userId OR bh.player2.id = :userId")
    Long countTotalBattlesByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(bh) FROM BattleHistory bh WHERE (bh.player1.id = :userId OR bh.player2.id = :userId) AND bh.winner.id != :userId AND bh.winner IS NOT NULL")
    Long countLossesByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(bh) FROM BattleHistory bh WHERE (bh.player1.id = :userId OR bh.player2.id = :userId) AND bh.winner IS NULL")
    Long countDrawsByUserId(@Param("userId") String userId);
    
    @Query("SELECT MAX(CASE WHEN bh.player1.id = :userId THEN bh.player1Score ELSE bh.player2Score END) FROM BattleHistory bh WHERE bh.player1.id = :userId OR bh.player2.id = :userId")
    Integer findHighestScoreByUserId(@Param("userId") String userId);
    
    @Query("SELECT bh.level, COUNT(bh) as count FROM BattleHistory bh WHERE bh.player1.id = :userId OR bh.player2.id = :userId GROUP BY bh.level ORDER BY count DESC")
    List<Object[]> findFavoriteLevelByUserId(@Param("userId") String userId, Pageable pageable);
    
    // Leaderboard query - get users with most wins
    @Query("SELECT bh.winner, COUNT(bh) as wins FROM BattleHistory bh " +
           "WHERE bh.winner IS NOT NULL " +
           "GROUP BY bh.winner " +
           "ORDER BY wins DESC")
    List<Object[]> findTopWinners(Pageable pageable);
    
    // Get total score for a user (sum of all their scores)
    @Query("SELECT SUM(CASE WHEN bh.player1.id = :userId THEN bh.player1Score ELSE bh.player2Score END) FROM BattleHistory bh WHERE bh.player1.id = :userId OR bh.player2.id = :userId")
    Long getTotalScoreByUserId(@Param("userId") String userId);
}
