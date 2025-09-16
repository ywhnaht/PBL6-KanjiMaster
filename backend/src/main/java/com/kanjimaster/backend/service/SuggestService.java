package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.dto.SuggestItem;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SuggestService {
    KanjiRepository kanjiRepository;
    CompoundWordRepository compoundWordRepository;
    TranslationService translationService;

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

    // @Cacheable(value = "suggest", key = "#keyword", unless = "#result == null")
    public List<SuggestItem> searchSuggest(String keyword) {
        CompletableFuture<List<Kanji>> kanji = searchKanji(keyword);
        CompletableFuture<List<CompoundWords>> compound = searchCompound(keyword);

        CompletableFuture.allOf(kanji, compound).join();

        List<Kanji> kanjis = kanji.join();
        List<CompoundWords> compoundWords = compound.join();
        compoundWords.forEach(translationService::translateAndCacheIfNull);

        List<SuggestItem> suggestItems = new ArrayList<>();
        kanjis.forEach(k -> suggestItems.add(new SuggestItem("KANJI", k.getId(), k.getKanji(), k.getHanViet(), k.getJoyoReading())));
        compoundWords.forEach(c -> suggestItems.add(new SuggestItem("COMPOUND", c.getId(), c.getWord(), c.getMeaning(), c.getHiragana())));

        return suggestItems;
    }
}
