package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.SearchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Integer> {
    Page<SearchHistory> findByUserIdOrderBySearchTimestampDesc(String userId, Pageable pageable);
}
