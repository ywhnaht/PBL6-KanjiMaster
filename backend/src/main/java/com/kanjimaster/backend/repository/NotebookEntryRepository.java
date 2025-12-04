package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.NotebookEntry;
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

}
