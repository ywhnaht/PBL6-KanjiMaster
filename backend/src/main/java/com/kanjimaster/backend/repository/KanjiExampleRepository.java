package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.KanjiExamples;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KanjiExampleRepository extends JpaRepository<KanjiExamples, Integer> {

}
