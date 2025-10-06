package com.kanjimaster.backend.service;

import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.model.dto.*;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchService {
    KanjiRepository kanjiRepository;
    KanjiService kanjiService;
    CompoundWordService compoundWordService;
    CompoundWordRepository compoundWordRepository;
    KanjiMapper kanjiMapper;
    TranslationService translationService;

//    static final Pattern KANJI_PATTERN = Pattern.compile("[\u4E00-\u9FAF]");
//    static final Pattern HIRAGANA_KATAKANA_PATTERN = Pattern.compile("[\u3040-\u309F\u30A0-\u30FF]");
//    static final Pattern VIET_DIACRITIC_PATTERN = Pattern.compile("[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]");

    @Async
    public CompletableFuture<List<Kanji>> searchKanji(String keyword) {
        List<Kanji> result = kanjiRepository.findTop2ByKanjiContainingOrHanVietContaining(keyword, keyword);
        return CompletableFuture.completedFuture(result);
    }

    @Async
    public CompletableFuture<List<CompoundWords>> searchCompound(String keyword) {
        List<CompoundWords> result = compoundWordRepository.findTop3ByWordContainingOrMeaningContainingOrHiraganaContaining(keyword, keyword, keyword);
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

        compoundWords.forEach(k -> translationService.translateText(k.getMeaning()));

        List<SuggestItem> suggestItems = new ArrayList<>();
        kanjis.forEach(k -> suggestItems.add(new SuggestItem("KANJI", k.getId(), k.getKanji(), k.getHanViet(), k.getJoyoReading(), rank(q, k.getKanji(), k.getHanViet()))));
        compoundWords.forEach(c -> suggestItems.add(new SuggestItem("COMPOUND", c.getId(), c.getWord(), c.getMeaning(), c.getHiragana(), rank(q, c.getWord(), c.getMeaning()))));

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

    private int rank(String q, String primary, String secondary) {
        String key = q.toLowerCase(Locale.ROOT);
        int score = 0;

        if (primary != null) {
            String p = primary.toLowerCase(Locale.ROOT);
            if (p.startsWith(key)) score += 50;
            else if (p.contains(key)) score += 20;
        }

        if (secondary != null) {
            String s = secondary.toLowerCase(Locale.ROOT);
            if (s.startsWith(key)) score += 15;
            else if (s.contains(key)) score += 5;
        }

        return score;
    }

//    @Cacheable(value = "search_full", key = "#query + '|' + #page + '|' + #size", unless = "#result == null")
//    public FullSearchResponse searchFull(String query, int page, int size) {
//        String searchType = detectSearchType(query);
//        List<Kanji> kanjiResults = new ArrayList<>();
//        List<CompoundWords> compoundResults = new ArrayList<>();
//        int totalKanjiResults = 0;
//        int totalCompoundResults = 0;
//
//        switch (searchType) {
//            case "kanji" -> {
//                kanjiRepository.findByKanji(query).ifPresent(kanjiResults::add);
//                totalKanjiResults = kanjiResults.size();
//                var compoundPage = compoundWordRepository.findByWordContaining(query, PageRequest.of(page, size));
//                compoundResults = compoundPage.getContent();
//                totalCompoundResults = (int) compoundPage.getTotalElements();
//            }
//            case "compound_word" -> {
//                compoundWordRepository.findByWordOrHiragana(query, query).ifPresent(compoundResults::add);
//                if (compoundResults.isEmpty()) {
//                    var pages = compoundWordRepository.findByWordContaining(query, PageRequest.of(page, size));
//                    compoundResults = pages.getContent();
//                    totalCompoundResults = (int) pages.getTotalElements();
//                } else {
//                    totalCompoundResults = 1;
//                }
//            }
//            case "vietnamese_meaning" -> {
//                // ONLY meaning search, skip Han Viet
//                var meaningPage = searchCompoundByMeaning(query, PageRequest.of(page, size));
//                compoundResults.addAll(meaningPage.getContent());
//                totalCompoundResults = (int) meaningPage.getTotalElements();
//            }
//            case "han_viet" -> {
//                // Old behavior: both han viet
//                try {
//                    Page<Kanji> hanVietPage = searchKanjiByHanViet(query, PageRequest.of(page, size));
//                    if (!hanVietPage.isEmpty()) {
//                        kanjiResults.addAll(hanVietPage.getContent());
//                    }
//                } catch (Exception ignored) {}
////                searchType = performVietnameseSearch(query, page, size, kanjiResults, compoundResults);
//                totalKanjiResults = kanjiResults.size();
////                totalCompoundResults = compoundResults.size();
//            }
//            case "mixed" -> {
//                searchType = performMixedSearch(query, page, size, kanjiResults, compoundResults);
//                totalKanjiResults = kanjiResults.size();
//                totalCompoundResults = compoundResults.size();
//            }
//        }
//
//        compoundResults.forEach(compound -> {
//            if (compound.getMeaning() == null || compound.getMeaning().isEmpty()) {
//                String translated = translationService.translateText(compound.getWord());
//                compound.setMeaning(translated);
//                compoundWordRepository.save(compound);
//            }
//
//            if ((compound.getExampleMeaning() == null || compound.getExampleMeaning().isEmpty())
//                    && compound.getExample() != null && !compound.getExample().isEmpty()) {
//                String exTranslated = translationService.translateText(compound.getExample());
//                compound.setExampleMeaning(exTranslated);
//                compoundWordRepository.save(compound);
//            }
//        });
//
//        return FullSearchResponse.builder()
//                .mode("full")
//                .query(query)
//                .type(searchType)
//                .kanjiResults(kanjiMapper.toDtoList(kanjiResults))
//                .compoundResults(kanjiMapper.toDtoListCompoundWords(compoundResults))
//                .totalCompoundResults(totalCompoundResults)
//                .totalKanjiResults(totalKanjiResults)
//                .build();
//    }
//
//    private String detectSearchType(String raw) {
//        if (raw == null) return "mixed";
//        String query = raw.trim();
//        if (query.isEmpty()) return "mixed";
//
//        if (query.length() == 1 && KANJI_PATTERN.matcher(query).find()) {
//            return "kanji";
//        }
//
//        if (KANJI_PATTERN.matcher(query).find() || HIRAGANA_KATAKANA_PATTERN.matcher(query).find()) {
//            return "compound_word";
//        }
//
//        String lower = query.toLowerCase(Locale.ROOT);
//        int wordCount = lower.split("\\s+").length;
//        if (wordCount >= 2 && VIET_DIACRITIC_PATTERN.matcher(lower).find()) {
//            return "vietnamese_meaning";
//        }
//
//        return "han_viet";
//    }
//
//    private String performVietnameseSearch(String query, int page, int size,
//                                           List<Kanji> kanjiResults,
//                                           List<CompoundWords> compoundResults) {
//        boolean foundHanViet = false;
//        boolean foundMeaning = false;
//
//        try {
//            Page<Kanji> hanVietPage = searchKanjiByHanViet(query, PageRequest.of(page, size));
//            if (!hanVietPage.isEmpty()) {
//                kanjiResults.addAll(hanVietPage.getContent());
//                foundHanViet = true;
//            }
//        } catch (Exception ignored) {}
//
//        // Tìm theo meaning
//        try {
//            Page<CompoundWords> meaningPage = searchCompoundByMeaning(query, PageRequest.of(page, size));
//            if (!meaningPage.isEmpty()) {
//                compoundResults.addAll(meaningPage.getContent());
//                foundMeaning = true;
//            }
//        } catch (Exception ignored) {}
//
//        // Xác định loại search chính xác
//        if (foundHanViet || foundMeaning) {
//            return "mixed_vietnamese";
//        } else if (foundHanViet) {
//            return "han_viet";
//        } else if (foundMeaning) {
//            return "compound_meaning";
//        } else {
//            return "no_results";
//        }
//    }
//
//    private Page<Kanji> searchKanjiByHanViet(String hanViet, PageRequest pageRequest) {
//        Page<Kanji> exactResults = kanjiRepository.findByHanVietLike(hanViet, pageRequest);
//        if (!exactResults.isEmpty()) {
//            return exactResults;
//        }
//
////        if (hanViet.length() >= 3) {
////            try {
////                Page<Kanji> fullTextResults = kanjiRepository.findByHanVietFullText(hanViet, pageRequest);
////                if (!fullTextResults.isEmpty()) {
////                    return fullTextResults;
////                }
////            } catch (Exception e) {
////                System.out.println("Full-text search failed for: " + hanViet + ", fallback to LIKE search");
////            }
////        }
//
//        return Page.empty();
//    }
//
//    private Page<CompoundWords> searchCompoundByMeaning(String meaning, PageRequest pageRequest) {
//        Page<CompoundWords> results = compoundWordRepository.findByMeaningLike(meaning, pageRequest);
//        if (!results.isEmpty()) {
//            return results;
//        }
//
//        return Page.empty();
//    }
//
//    private String performMixedSearch(String query, int page, int size,
//                                      List<Kanji> kanjiResults,
//                                      List<CompoundWords> compoundResults) {
//        if (query.length() == 1 && KANJI_PATTERN.matcher(query).find()) {
//            kanjiRepository.findByKanji(query).ifPresent(kanjiResults::add);
//        }
//        // Try compound word search
//        if (KANJI_PATTERN.matcher(query).find() || HIRAGANA_KATAKANA_PATTERN.matcher(query).find()) {
//            compoundWordRepository.findByWordOrHiragana(query, query).ifPresent(compoundResults::add);
//
//        // Also search for compounds containing this word
//            try {
//                Page<CompoundWords> compoundPage = compoundWordRepository.findByWordContaining(query, PageRequest.of(0, 3));
//                compoundResults.addAll(compoundPage.getContent());
//            } catch (Exception ignored) {}
//        }
//
//        // Try Vietnamese search (han viet + meaning)
//        performVietnameseSearch(query, page, size, kanjiResults, compoundResults);
//        return "mixed";
//    }
}
