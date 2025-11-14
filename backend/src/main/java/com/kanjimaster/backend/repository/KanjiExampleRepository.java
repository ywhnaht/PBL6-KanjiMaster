package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.KanjiExamples;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KanjiExampleRepository extends JpaRepository<KanjiExamples, Integer> {
    List<KanjiExamples> findByKanjiId(Integer kanjiId);

    @Query(value = "SELECT ke.* FROM kanji_examples ke " +
            "JOIN kanji k ON ke.kanji_id = k.id " +
            "WHERE k.level = :level and ke.sentence is not null " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<KanjiExamples> findRandomExamplesByKanjiLevel(@Param("level") String level, @Param("limit") int limit);

    @Query(value = "SELECT * FROM kanji_examples " +
            "WHERE reading LIKE CONCAT('%', :suffix) " +
            "AND id != :originalId " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<KanjiExamples> findDistractorsBySuffix(@Param("suffix") String suffix, @Param("originalId") Integer originalId, @Param("limit") int limit);
}
