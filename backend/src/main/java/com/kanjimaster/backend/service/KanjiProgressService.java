package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.KanjiNotFoundException;
import com.kanjimaster.backend.model.dto.KanjiCountByLevelDto;
import com.kanjimaster.backend.model.entity.*;
import com.kanjimaster.backend.model.enums.LearnStatus;
import com.kanjimaster.backend.repository.KanjiProgressRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import com.kanjimaster.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KanjiProgressService {
    KanjiProgressRepository kanjiProgressRepository;
    UserRepository userRepository;
    KanjiRepository kanjiRepository;

    public Map<String, Long> getProgressSummary(String userId) {
        Map<String, Long> summary;

        if (userId != null) {
            List<KanjiCountByLevelDto> progress = kanjiProgressRepository.getLearnedKanjiCountGroupByLevel(userId);

            summary = progress.stream()
                    .collect(Collectors.toMap(
                            KanjiCountByLevelDto::getLevel,
                            KanjiCountByLevelDto::getCount
                    ));
        } else {
            summary = new HashMap<>();
        }

        List.of("N5", "N4", "N3", "N2", "N1").forEach(level -> {
            summary.putIfAbsent(level, 0L);
        });

        return summary;
    }

    public Map<String, Serializable> masterKanji(String userId, Integer kanjiId) {
        KanjiProgressId kanjiProgressId = new KanjiProgressId(userId, kanjiId);
        KanjiProgress kanjiProgress = kanjiProgressRepository.findById(kanjiProgressId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow(() -> new KanjiNotFoundException("User not found!"));
            Kanji kanji = kanjiRepository.findById(kanjiId).orElseThrow(() -> new KanjiNotFoundException("Kanji not found"));
            return new KanjiProgress(kanjiProgressId, user, kanji, LearnStatus.MASTERED, LocalDateTime.now(), null);
        });

        kanjiProgress.setStatus(LearnStatus.MASTERED);
        kanjiProgress.setLastReviewAt(LocalDateTime.now());

        KanjiProgress savedProgress = kanjiProgressRepository.save(kanjiProgress);

        String levelOfMasteredKanji = savedProgress.getKanji().getLevel();
        Long newCountForLevel = kanjiProgressRepository.countLearnedByLevel(levelOfMasteredKanji, userId);

        return Map.of("updatedLevel", "N" + levelOfMasteredKanji, "newCount", newCountForLevel);
    }
}
