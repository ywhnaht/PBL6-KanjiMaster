package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.dto.StudySessionDto;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.NotebookEntry;
import com.kanjimaster.backend.model.enums.NotebookEntryType;
import com.kanjimaster.backend.repository.KanjiRepository;
import com.kanjimaster.backend.repository.NotebookEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudyService {
    private final NotebookEntryRepository notebookEntryRepository;
    private final KanjiRepository kanjiRepository;
    private final KanjiService kanjiService;
    private final KanjiProgressService kanjiProgressService;

    private static final int DAILY_GOAL = 10;

    public List<StudySessionDto> getTodayStudySession(String userId, String targetLevel) {
        List<StudySessionDto> session = new ArrayList<>();

        if (userId == null) {
            String guestLevel = (targetLevel != null && !targetLevel.isEmpty()) ? targetLevel : "5";

            List<Kanji> newKanjis = kanjiRepository.findRandomKanjiGuest(guestLevel, DAILY_GOAL);

            for (Kanji k : newKanjis) {
                session.add(mapToSessionDto(k, "NEW", guestLevel));
            }

            return session;
        }

        List<NotebookEntry> dueEntries = notebookEntryRepository.findDueEntries(
                userId, PageRequest.of(0, DAILY_GOAL)
        ).getContent();

        for (NotebookEntry entry : dueEntries) {
            if (entry.getEntityType() == NotebookEntryType.KANJI) {
                session.add(StudySessionDto.builder()
                        .entityId(entry.getKanji().getId())
                        .entityType("KANJI")
                        .level(entry.getKanji().getLevel())
                        .display(entry.getKanji().getKanji())
                        .meaning(entry.getKanji().getHanViet())
                        .studyType("REVIEW")
                        .reviewCount(entry.getReviewCount())
                        .build());
            }
        }

        if (session.size() >= DAILY_GOAL) return session;

        int remainingSlots = DAILY_GOAL - session.size();
        List<Kanji> historyKanjis = kanjiRepository.findRecommendationsFromHistory(userId, remainingSlots);

        for (Kanji k : historyKanjis) {
            session.add(StudySessionDto.builder()
                    .entityId(k.getId())
                    .entityType("KANJI")
                    .level(k.getLevel())
                    .display(k.getKanji())
                    .meaning(k.getHanViet())
                    .studyType("HISTORY")
                    .reviewCount(0)
                    .build());
        }

        if (session.size() >= DAILY_GOAL) return session;

        remainingSlots = DAILY_GOAL - session.size();
        String level = (targetLevel != null && !targetLevel.isEmpty()) ?
                targetLevel : determineUserLevel(userId);

        List<Kanji> newKanjis = kanjiRepository.findRandomNewKanjiByLevel(userId, level, remainingSlots);

        for (Kanji k : newKanjis) {
            session.add(StudySessionDto.builder()
                    .entityId(k.getId())
                    .entityType("KANJI")
                    .level(k.getLevel())
                    .display(k.getKanji())
                    .meaning(k.getHanViet())
                    .studyType("NEW")
                    .reviewCount(0)
                    .build());
        }

        return session;
    }

    public String determineUserLevel(String userId) {
        // 1. Lấy thống kê: { "N5": 10, "N3": 50, "N2": 5 }
        // User này rõ ràng đang cày N3 (50 từ), dù N5 mới học có 10 từ.
        Map<String, Long> userProgress = kanjiProgressService.getProgressSummary(userId);

        // Biến để tìm level chiếm ưu thế nhất
        String dominantLevel = "5";
        long maxCount = -1;

        // 2. Tìm Level mà User đang học nhiều nhất
        for (Map.Entry<String, Long> entry : userProgress.entrySet()) {
            String levelStr = entry.getKey().replace("N", "");
            long learnedCount = entry.getValue();

            if (learnedCount > maxCount) {
                maxCount = learnedCount;
                dominantLevel = levelStr;
            }
        }

        if (maxCount <= 0) return "5";

        // 4. [NÂNG CAO] Kiểm tra xem Level ưu thế này đã "học xong" chưa?
        // Ví dụ: User đã học 150/160 chữ N4 -> Coi như xong N4 -> Gợi ý lên N3
        long totalInLevel = kanjiService.countByLevel(dominantLevel);

        // Nếu đã học được > 90% level hiện tại
        if (totalInLevel > 0 && (double) maxCount / totalInLevel > 0.9) {
            return getNextLevel(dominantLevel); // Hàm phụ để lấy level tiếp theo
        }

        // 5. Nếu chưa xong -> Trả về chính level đó để học tiếp
        return dominantLevel;
    }

    private String getNextLevel(String currentLevel) {
        return switch (currentLevel) {
            case "5" -> "4";
            case "4" -> "3";
            case "3" -> "2";
            case "2" -> "1";
            default -> "1";
        };
    }

    private StudySessionDto mapToSessionDto(Kanji k, String type, String level) {
        return StudySessionDto.builder()
                .entityId(k.getId())
                .entityType("KANJI")
                .display(k.getKanji())
                .meaning(k.getHanViet())
                .studyType(type)
                .level(level)
                .reviewCount(0)
                .build();
    }
}