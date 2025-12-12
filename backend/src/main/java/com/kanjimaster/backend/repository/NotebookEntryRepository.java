package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.NotebookEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotebookEntryRepository extends JpaRepository<NotebookEntry, Integer> {
    boolean existsByNotebookIdAndKanjiId(Integer notebookId, Integer kanjiId);
    boolean existsByNotebookIdAndCompoundWordsId(Integer notebookId, Integer compoundWordsId);

    @Query("""
        select ne.notebook.id
        from NotebookEntry ne
        where ne.user.id = :userId 
        and ne.entityType = 'KANJI'
        and ne.kanji.id = :kanjiId
    """)
    List<Integer> findNotebookIdsByKanjiId(@Param("userId") String userId, @Param("kanjiId") Integer kanjiId);

    @Query("""
        select ne.notebook.id
        from NotebookEntry ne
        where ne.user.id = :userId 
        and ne.entityType = 'COMPOUND'
        and ne.compoundWords.id = :compoundId
    """)
    List<Integer> findNotebookIdsByCompoundId(@Param("userId") String userId, @Param("compoundId") Integer compoundId);

    void deleteByIdAndUserId(Integer id, String userId);
    void deleteAllByIdInAndUserId(List<Integer> ids, String userId);

    @Query("SELECT ne FROM NotebookEntry ne " +
            "WHERE ne.user.id = :userId " +
            "AND (ne.nextReviewDate IS NULL OR ne.nextReviewDate <= CURRENT_DATE) " +
            "ORDER BY ne.nextReviewDate ASC")
    Page<NotebookEntry> findDueEntries(@Param("userId") String userId, Pageable pageable);
}
