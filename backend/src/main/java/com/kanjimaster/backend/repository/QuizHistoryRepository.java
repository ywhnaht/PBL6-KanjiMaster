package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.QuizHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QuizHistoryRepository extends JpaRepository<QuizHistory, Integer> {
    @Query("SELECT COUNT(qh) FROM QuizHistory qh WHERE qh.user.id = :userId")
    Integer countByUserId(@Param("userId") String userId);

    @Query("SELECT AVG(qh.score) FROM QuizHistory qh WHERE qh.user.id = :userId")
    Optional<Double> findAverageScoreByUserId(@Param("userId") String userId);

    @Query("SELECT MAX(qh.score) FROM QuizHistory qh WHERE qh.user.id = :userId")
    Optional<Integer> findHighestScoreByUserId(@Param("userId") String userId);

    @Query("SELECT MIN(qh.score) FROM QuizHistory qh WHERE qh.user.id = :userId")
    Optional<Integer> findLowestScoreByUserId(@Param("userId") String userId);
}
