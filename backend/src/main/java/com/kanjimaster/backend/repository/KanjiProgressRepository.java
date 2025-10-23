package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.dto.KanjiCountByLevelDto;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.KanjiProgress;
import com.kanjimaster.backend.model.entity.KanjiProgressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanjiProgressRepository extends JpaRepository<KanjiProgress, KanjiProgressId> {
    @Query("""
        SELECT new com.kanjimaster.backend.model.dto.KanjiCountByLevelDto(concat('N', p.kanji.level), COUNT(p.kanji.id))
        from KanjiProgress p 
        where p.user.id = :userId 
              and p.status = 'MASTERED'
              and p.kanji.level != '0'
        group by p.kanji.level
    """)
    public List<KanjiCountByLevelDto> getLearnedKanjiCountGroupByLevel(@Param("userId") String userId);

    public Optional<KanjiProgress> findByUserIdAndKanjiId(String userId, Integer kanjiId);

    @Query("""
        select count(p)
        from KanjiProgress p
        where p.kanji.level = :level and
              p.user.id = :userId and
              p.status = 'MASTERED'
    """)
    public Long countLearnedByLevel(@Param("level") String level, @Param("userId") String userId);
}
