package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.UserProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for KanjiRepository
 * Tests database operations for Kanji entity
 * Note: Disabled due to database schema dependency (requires Flyway migrations)
 */
@Disabled("Requires full database setup with Flyway migrations")
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.flyway.enabled=false",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class KanjiRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private KanjiRepository kanjiRepository;

    private Kanji testKanji1;
    private Kanji testKanji2;

    @BeforeEach
    void setUp() {
        testKanji1 = new Kanji();
        testKanji1.setKanji("日");
        testKanji1.setHanViet("nhật");
        testKanji1.setJoyoReading("ニチ");
        testKanji1.setOnyomi("ニチ、ジツ");
        testKanji1.setKunyomi("ひ、か");
        testKanji1.setLevel("N5");
        testKanji1.setStrokes("4");

        testKanji2 = new Kanji();
        testKanji2.setKanji("本");
        testKanji2.setHanViet("bản");
        testKanji2.setJoyoReading("ホン");
        testKanji2.setOnyomi("ホン");
        testKanji2.setKunyomi("もと");
        testKanji2.setLevel("N5");
        testKanji2.setStrokes("5");

        entityManager.persist(testKanji1);
        entityManager.persist(testKanji2);
        entityManager.flush();
    }

    @Test
    void findById_Success() {
        // When
        Optional<Kanji> found = kanjiRepository.findById(testKanji1.getId());

        // Then
        assertTrue(found.isPresent());
        assertEquals(testKanji1.getKanji(), found.get().getKanji());
        assertEquals(testKanji1.getHanViet(), found.get().getHanViet());
    }

    @Test
    void findByLevel_Success() {
        // When
        Page<Kanji> kanjis = kanjiRepository.findByLevel("N5", PageRequest.of(0, 10));

        // Then
        assertNotNull(kanjis);
        assertTrue(kanjis.getTotalElements() >= 2);
        assertTrue(kanjis.getContent().stream()
                .anyMatch(k -> k.getKanji().equals("日")));
    }

    @Test
    void findByKanji_Success() {
        // When
        Optional<Kanji> found = kanjiRepository.findByKanji("日");

        // Then
        assertTrue(found.isPresent());
        assertEquals("日", found.get().getKanji());
        assertEquals("nhật", found.get().getHanViet());
        assertEquals("N5", found.get().getLevel());
    }

    @Test
    void save_Success() {
        // Given
        Kanji newKanji = new Kanji();
        newKanji.setKanji("月");
        newKanji.setHanViet("nguyệt");
        newKanji.setJoyoReading("ゲツ");
        newKanji.setOnyomi("ゲツ、ガツ");
        newKanji.setKunyomi("つき");
        newKanji.setLevel("N5");
        newKanji.setStrokes("4");

        // When
        Kanji saved = kanjiRepository.save(newKanji);

        // Then
        assertNotNull(saved.getId());
        assertEquals("月", saved.getKanji());
        
        // Verify it's persisted
        Kanji found = entityManager.find(Kanji.class, saved.getId());
        assertNotNull(found);
        assertEquals("月", found.getKanji());
    }

    @Test
    void findByLevel_EmptyResult() {
        // When
        Page<Kanji> kanjis = kanjiRepository.findByLevel("N1", PageRequest.of(0, 10));

        // Then
        assertNotNull(kanjis);
        assertTrue(kanjis.isEmpty());
    }

    @Test
    void delete_Success() {
        // Given
        Integer kanjiId = testKanji1.getId();

        // When
        kanjiRepository.deleteById(kanjiId);
        entityManager.flush();

        // Then
        Optional<Kanji> found = kanjiRepository.findById(kanjiId);
        assertFalse(found.isPresent());
    }
}
