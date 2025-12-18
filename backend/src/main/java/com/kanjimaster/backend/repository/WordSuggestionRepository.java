package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.WordSuggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WordSuggestionRepository extends JpaRepository<WordSuggestion, Integer> {
    
    Page<WordSuggestion> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<WordSuggestion> findByStatus(WordSuggestion.SuggestionStatus status, Pageable pageable);
    
    Page<WordSuggestion> findByType(WordSuggestion.SuggestionType type, Pageable pageable);
    
    Page<WordSuggestion> findByStatusAndType(
        WordSuggestion.SuggestionStatus status, 
        WordSuggestion.SuggestionType type, 
        Pageable pageable
    );
    
    Page<WordSuggestion> findByUserId(String userId, Pageable pageable);
    
    long countByStatus(WordSuggestion.SuggestionStatus status);
}
