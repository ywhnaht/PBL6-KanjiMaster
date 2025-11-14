package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.QuizHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizHistoryRepository extends JpaRepository<QuizHistory, Integer> {
}
