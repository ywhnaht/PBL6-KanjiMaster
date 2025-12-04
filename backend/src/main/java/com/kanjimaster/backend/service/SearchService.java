package com.kanjimaster.backend.service;

import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.SearchMode;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchService {
    KanjiRepository kanjiRepository;
    KanjiService kanjiService;
    CompoundWordService compoundWordService;
    CompoundWordRepository compoundWordRepository;

    private static final int DB_FETCH_SIZE = 40;

    @Async
    public CompletableFuture<List<Kanji>> searchKanji(String keyword) {
        List<Kanji> result = kanjiRepository.findByKanjiContainingOrHanVietContaining(
                keyword, keyword, PageRequest.of(0, DB_FETCH_SIZE));
        return CompletableFuture.completedFuture(result);
    }

    @Async
    public CompletableFuture<List<CompoundWords>> searchCompound(String keyword) {
        List<CompoundWords> result = compoundWordRepository.findByWordContainingOrMeaningContainingOrHiraganaContaining(
                keyword, keyword, keyword, PageRequest.of(0, DB_FETCH_SIZE));
        return CompletableFuture.completedFuture(result);
    }

    @Cacheable(value = "seach_suggest", key = "#query + '-' + #mode + '-' + #limit", unless = "#result == null")
    public SearchSuggestResponse searchSuggest(String query, SearchMode mode, int limit) {
        String q = (query == null) ? "" : query.trim();

        if (q.isEmpty()) {
            return SearchSuggestResponse.builder()
                    .mode("suggest")
                    .query(q)
                    .total(0).totalKanji(0).totalCompound(0)
                    .results(List.of())
                    .build();
        }

        int capped = Math.min(Math.max(limit, 1), 20);
        CompletableFuture<List<Kanji>> kanji = searchKanji(q);
        CompletableFuture<List<CompoundWords>> compound = searchCompound(q);
        CompletableFuture.allOf(kanji, compound).join();

        List<Kanji> kanjis = kanji.join();
        List<CompoundWords> compoundWords = compound.join();

        List<SuggestItem> suggestItems = new ArrayList<>();

        kanjis.forEach(k -> suggestItems.add(new SuggestItem(
                "KANJI",
                k.getId(),
                k.getKanji(),
                k.getHanViet(),
                k.getJoyoReading(),
                calculateKanjiScore(q, k)
        )));

        compoundWords.forEach(c -> suggestItems.add(new SuggestItem(
                "COMPOUND",
                c.getId(),
                c.getWord(),
                c.getMeaning(),
                c.getHiragana(),
                calculateCompoundScore(q, c)
        )));

        List<SuggestItem> ranked = suggestItems.stream()
                .sorted(Comparator.comparingInt(SuggestItem::getRank).reversed())
                .limit(capped)
                .collect(Collectors.toList());

        long kanjiCount = ranked.stream().filter(i -> i.getType().equals("KANJI")).count();
        long compoundCount = ranked.stream().filter(i -> i.getType().equals("COMPOUND")).count();

        SuggestItem result = ranked.stream().findFirst().orElse(null);
        Object initialResult = null;
        if (mode == SearchMode.FULL) {
            if (result != null) {
                if (result.getType().equals("KANJI")) {
                    initialResult = kanjiService.getKanjiById(result.getId());
                } else if (result.getType().equals("COMPOUND")) {
                    initialResult = compoundWordService.getById(result.getId());
                }
            }
        }

        return SearchSuggestResponse.builder()
                .mode(mode.name())
                .query(q)
                .results(ranked)
                .initials(initialResult)
                .total(ranked.size())
                .totalKanji((int) kanjiCount)
                .totalCompound((int) compoundCount)
                .build();
    }

    private int calculateKanjiScore(String query, Kanji kanji) {
        String key = query.toLowerCase(Locale.ROOT);
        String k = kanji.getKanji().toLowerCase(Locale.ROOT);
        String h = (kanji.getHanViet() != null) ? kanji.getHanViet().toLowerCase(Locale.ROOT) : "";

        if (k.equals(key) || h.equals(key)) return 100;

        if (k.startsWith(key) || h.startsWith(key)) return 70;

        if (k.contains(key) || h.contains(key)) return 20;

        return 0;
    }

    private int calculateCompoundScore(String query, CompoundWords word) {
        String key = query.toLowerCase(Locale.ROOT);
        String w = word.getWord().toLowerCase(Locale.ROOT);
        String m = (word.getMeaning() != null) ? word.getMeaning().toLowerCase(Locale.ROOT) : "";
        String h = (word.getHiragana() != null) ? word.getHiragana().toLowerCase(Locale.ROOT) : "";

        if (w.equals(key) || h.equals(key)) return 95;

        if (m.equals(key)) return 90;

        if (w.startsWith(key) || h.startsWith(key)) return 60;

        if (m.startsWith(key)) return 50;

        if (w.contains(key) || h.contains(key)) return 15;

        if (m.contains(key)) return 10;

        return 0;
    }
}
