package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompoundWordRepository extends JpaRepository<CompoundWords, Integer> {
    Optional<CompoundWords> findByWordOrHiragana(String word, String hiragana);

    @Query(value = "SELECT * FROM compound_words " +
            "WHERE MATCH(meaning) AGAINST(:meaning IN NATURAL LANGUAGE MODE)",
            nativeQuery = true)
    Page<CompoundWords> findByMeaningFullText(@Param("meaning") String meaning, Pageable pageable);

    @Query("SELECT c FROM CompoundWords c WHERE c.meaning LIKE %:meaning%")
    Page<CompoundWords> findByMeaningLike(@Param("meaning") String meaning, Pageable pageable);

    boolean existsByIdAndMeaningIsNull(Integer id);

    @Query("SELECT c " +
            "FROM CompoundWords c" +
            " JOIN CompoundKanji ck ON c.id = ck.compoundWord.id" +
            " WHERE ck.kanji.id = :kanjiId" +
            " ORDER BY c.frequency DESC")
    Page<CompoundWords> findByKanjiId(@Param("kanjiId") Integer kanjiId, Pageable pageable);

    @Query("SELECT c " +
            "FROM CompoundWords c " +
            "WHERE c.word LIKE %:word% " +
            "ORDER BY c.frequency DESC")
    Page<CompoundWords> findByWordContaining(String word, Pageable pageable);

    List<CompoundWords> findTop3ByWordContainingOrMeaningContainingOrHiraganaContaining(String word, String meaning, String hiragana);

    Page<CompoundWords> findByMeaningContainingAndIdNot(String keyword, Integer id, Pageable pageable);
}
