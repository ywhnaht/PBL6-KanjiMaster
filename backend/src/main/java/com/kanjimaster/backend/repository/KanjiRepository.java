package com.kanjimaster.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.kanjimaster.backend.model.entity.Kanji;

@Repository
public interface KanjiRepository extends JpaRepository<Kanji, Integer> {
    Optional<Kanji> findByKanji(String character);
    Page<Kanji> findByLevel(String level, Pageable pageable);

    @Query(value = "SELECT * FROM kanji " +
            "WHERE MATCH(han_viet) AGAINST(:hanViet IN NATURAL LANGUAGE MODE)",
            nativeQuery = true)
    Page<Kanji> findByHanVietFullText(@Param("hanViet") String hanViet, Pageable pageable);

    @Query("SELECT k FROM Kanji k WHERE k.hanViet LIKE %:hanViet%")
    Page<Kanji> findByHanVietLike(@Param("hanViet") String hanViet, Pageable pageable);

    // Exact match cho hán việt
    @Query("SELECT k FROM Kanji k WHERE k.hanViet = :hanViet")
    Page<Kanji> findByHanVietExact(@Param("hanViet") String hanViet, Pageable pageable);

    List<Kanji> findTop2ByKanjiContainingOrHanVietContaining(String kanji, String hanViet);
}
