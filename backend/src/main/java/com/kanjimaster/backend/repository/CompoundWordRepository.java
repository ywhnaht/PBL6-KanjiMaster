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
    Optional<CompoundWords> findByWord(String word);
    
    // Admin methods
    boolean existsByWord(String word);
    Page<CompoundWords> findAll(Pageable pageable);

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

    List<CompoundWords> findByWordContainingOrMeaningContainingOrHiraganaContaining(String word, String meaning, String hiragana, Pageable pageable);

    @Query("""
        select distinct c
        from CompoundWords c join CompoundKanji ck
        on c.id = ck.compoundWord.id and c.example is not null
        where ck.kanji.level = :level
        order by function('rand') limit :limit
    """)
    List<CompoundWords> findRandomCompoundsByKanjiLevel(@Param("level") String level, @Param("limit") int limit);

    @Query(value = "SELECT * FROM compound_words " +
            "WHERE hiragana LIKE CONCAT('%', :suffix) " +
            "AND id != :originalId " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<CompoundWords> findDistractorsBySuffix(@Param("suffix") String suffix, @Param("originalId") Integer originalId, @Param("limit") int limit);
}
