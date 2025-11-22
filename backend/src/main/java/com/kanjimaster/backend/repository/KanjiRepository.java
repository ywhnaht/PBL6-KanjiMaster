package com.kanjimaster.backend.repository;

import java.util.List;
import java.util.Optional;

import com.kanjimaster.backend.model.dto.KanjiBasicDto;
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

    @Query("""
        select new com.kanjimaster.backend.model.dto.KanjiBasicDto(k.id, k.kanji, k.hanViet, k.level, k.joyoReading, p.status)
        from Kanji k left join KanjiProgress p on k.id = p.kanji.id and p.user.id = :userId
        where k.level = :level
    """)
    Page<KanjiBasicDto> findKanjiByLevelWithStatus(@Param("level") String level,@Param("userId") String userId, Pageable pageable);

    @Query(value = "SELECT * FROM kanji " +
            "WHERE MATCH(han_viet) AGAINST(:hanViet IN NATURAL LANGUAGE MODE)",
            nativeQuery = true)
    Page<Kanji> findByHanVietFullText(@Param("hanViet") String hanViet, Pageable pageable);

    @Query("SELECT k FROM Kanji k WHERE k.hanViet LIKE %:hanViet%")
    Page<Kanji> findByHanVietLike(@Param("hanViet") String hanViet, Pageable pageable);

    @Query("SELECT k FROM Kanji k WHERE k.hanViet = :hanViet")
    Optional<Kanji> findByHanVietExact(@Param("hanViet") String hanViet);

    List<Kanji> findByKanjiContainingOrHanVietContaining(String kanji, String hanViet, Pageable pageable);

    @Query("SELECT k " +
            "FROM Kanji k " +
            "JOIN CompoundKanji c ON k.id = c.kanji.id " +
            "WHERE c.compoundWord.id = :compoundId")
    List<Kanji> findKanjiByCompoundId(@Param("compoundId") Integer compoundId);
}
