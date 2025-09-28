package com.kanjimaster.backend.service;

import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.SearchResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchService {
    KanjiRepository kanjiRepository;
    CompoundWordRepository compoundWordRepository;
    KanjiMapper kanjiMapper;
    TranslationService translationService;

    private static final Pattern KANJI_PATTERN = Pattern.compile("[\u4E00-\u9FAF]");
    private static final Pattern HIRAGANA_KATAKANA_PATTERN = Pattern.compile("[\u3040-\u309F\u30A0-\u30FF]");

    @Cacheable(value = "search", key = "#query", unless = "#result == null")
    public SearchResponse search(String query, int page, int size) {
        String searchType = detectSearchType(query);
        List<KanjiDto> kanjiResults = new ArrayList<>();
        List<CompoundWords> compoundResults = new ArrayList<>();
        int totalKanjiResults = 0;
        int totalCompoundResults = 0;

        switch (searchType) {
            case "kanji":
                // Tìm kanji exact match
                Optional<Kanji> exactKanji = kanjiRepository.findByKanji(query);
                if (exactKanji.isPresent()) {
                    kanjiResults.add(kanjiMapper.toDto(exactKanji.get()));
                    totalKanjiResults = 1;
                }

                // Tìm compound words chứa kanji này
                Page<CompoundWords> compoundPage = compoundWordRepository.findByWordContaining(query, PageRequest.of(page, size));
                compoundResults = compoundPage.getContent();
                totalCompoundResults = (int) compoundPage.getTotalElements();
                break;

            case "compound_word":
                // Tìm compound word (chuỗi kanji/hiragana)
                Optional<CompoundWords> exactCompound = compoundWordRepository.findByWordOrHiragana(query, query);
                if (exactCompound.isPresent()) {
                    compoundResults.add(exactCompound.get());
                    totalCompoundResults = 1;
                } else {
                    // Tìm compound chứa từ này
                    Page<CompoundWords> pages = compoundWordRepository.findByWordContaining(query, PageRequest.of(page, size));
                    compoundResults = pages.getContent();
                    totalCompoundResults = (int) pages.getTotalElements();
                }
                break;

            case "vietnamese":
                // Với tiếng Việt, tìm cả hán việt và meaning
                searchType = performVietnameseSearch(query, page, size, kanjiResults, compoundResults);
                totalKanjiResults = kanjiResults.size();
                totalCompoundResults = compoundResults.size();
                break;

            case "mixed":
                // Tìm tất cả các loại
                searchType = performMixedSearch(query, page, size, kanjiResults, compoundResults);
                totalKanjiResults = kanjiResults.size();
                totalCompoundResults = compoundResults.size();
                break;
        }

        compoundResults.forEach(compound -> {
            if (compound.getMeaning() == null || compound.getMeaning().isEmpty()) {
                String word = translationService.translateText(compound.getWord());
                compound.setMeaning(word);
                compoundWordRepository.save(compound);
            }
        });

        return SearchResponse.builder()
                .kanjiResults(kanjiResults)
                .compoundResults(compoundResults)
                .totalKanjiResults(totalKanjiResults)
                .totalCompoundResults(totalCompoundResults)
                .searchType(searchType)
                .query(query)
                .build();
    }

    private String detectSearchType(String query) {
        if (query == null || query.trim().isEmpty()) {
            return "mixed";
        }

        query = query.trim();

        // Check if it's a single kanji character
        if (query.length() == 1 && KANJI_PATTERN.matcher(query).find()) {
            return "kanji";
        }

        // Check if it contains kanji + hiragana/katakana (compound word)
        if (KANJI_PATTERN.matcher(query).find() || HIRAGANA_KATAKANA_PATTERN.matcher(query).find()) {
            return "compound_word";
        }

        // Everything else is Vietnamese (han_viet or meaning)
        return "vietnamese";
    }

    private String performVietnameseSearch(String query, int page, int size,
                                           List<KanjiDto> kanjiResults,
                                           List<CompoundWords> compoundResults) {
        boolean foundHanViet = false;
        boolean foundMeaning = false;

        // Tìm theo hán việt
        try {
                    Page<Kanji> hanVietPage = searchKanjiByHanViet(query, PageRequest.of(page, size));
                    if (!hanVietPage.isEmpty()) {
                kanjiResults.addAll(hanVietPage.getContent().stream().map(kanjiMapper::toDto).toList());
                foundHanViet = true;
            }
        } catch (Exception ignored) {}

        // Tìm theo meaning
        try {
            Page<CompoundWords> meaningPage = searchCompoundByMeaning(query, PageRequest.of(page, size));
            if (!meaningPage.isEmpty()) {
                compoundResults.addAll(meaningPage.getContent());
                foundMeaning = true;
            }
        } catch (Exception ignored) {}

        // Xác định loại search chính xác
        if (foundHanViet || foundMeaning) {
            return "mixed_vietnamese";
        } else if (foundHanViet) {
            return "han_viet";
        } else if (foundMeaning) {
            return "compound_meaning";
        } else {
            return "no_results";
        }
    }

    private Page<Kanji> searchKanjiByHanViet(String hanViet, PageRequest pageRequest) {
        Page<Kanji> exactResults = kanjiRepository.findByHanVietLike(hanViet, pageRequest);
        if (!exactResults.isEmpty()) {
            return exactResults;
        }

        // Strategy 2: Full-text search cho từ dài (>= 3 ký tự)
        if (hanViet.length() >= 3) {
            try {
                Page<Kanji> fullTextResults = kanjiRepository.findByHanVietFullText(hanViet, pageRequest);
                if (!fullTextResults.isEmpty()) {
                    return fullTextResults;
                }
            } catch (Exception e) {
                System.out.println("Full-text search failed for: " + hanViet + ", fallback to LIKE search");
            }
        }

        // Strategy 3: LIKE search (fallback cho từ ngắn hoặc khi full-text fail)
        return kanjiRepository.findByHanVietLike(hanViet, pageRequest);
    }

    private Page<CompoundWords> searchCompoundByMeaning(String meaning, PageRequest pageRequest) {
        if (meaning.length() < 4) {
            return compoundWordRepository.findByMeaningLike(meaning, pageRequest);
        } else {
            try {
                Page<CompoundWords> fullTextResults = compoundWordRepository.findByMeaningFullText(meaning, pageRequest);
                if (!fullTextResults.isEmpty()) {
                    return fullTextResults;
                }
            } catch (Exception e) {
                System.out.println("Full-text search failed for meaning: " + meaning + ", fallback to LIKE search");
            }
        }

        return Page.empty();
    }

    private String performMixedSearch(String query, int page, int size,
                                      List<KanjiDto> kanjiResults,
                                      List<CompoundWords> compoundResults) {

        // Try kanji search
        if (query.length() == 1 && KANJI_PATTERN.matcher(query).find()) {
            kanjiRepository.findByKanji(query).ifPresent(kanji ->
                    kanjiResults.add(kanjiMapper.toDto(kanji)));
        }

        // Try compound word search
        if (KANJI_PATTERN.matcher(query).find() || HIRAGANA_KATAKANA_PATTERN.matcher(query).find()) {
            compoundWordRepository.findByWordOrHiragana(query, query).ifPresent(compoundResults::add);

            // Also search for compounds containing this word
            try {
                Page<CompoundWords> compoundPage = compoundWordRepository.findByWordContaining(query, PageRequest.of(0, 3));
                compoundResults.addAll(compoundPage.getContent());
            } catch (Exception ignored) {}
        }

        // Try Vietnamese search (han viet + meaning)
        performVietnameseSearch(query, page, size, kanjiResults, compoundResults);

        return "mixed";
    }
}
