package com.kanjimaster.backend.service;

import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CompoundWordService {
    CompoundWordRepository compoundWordRepository;
    TranslationService translationService;

    public CompoundWords translateIfNull(CompoundWords compoundWords) {
        String meaning = compoundWords.getMeaning();
        String example = compoundWords.getExample();
        String exampleMeaning = compoundWords.getExampleMeaning();
        boolean updated = false;

        if (meaning == null || meaning.isEmpty()) {
            String vi = translationService.translateText(compoundWords.getWord());
            compoundWords.setMeaning(vi);
            updated = true;
        }

        if ((exampleMeaning == null || exampleMeaning.isEmpty()) && example != null && !example.isEmpty()) {
            String vi2 = translationService.translateText(example);
            compoundWords.setExampleMeaning(vi2);
            updated = true;
        }

        if (updated) {
            compoundWordRepository.save(compoundWords);
        }

        return compoundWords;
    }

    public CompoundWords getById(Integer id) {
        CompoundWords words = compoundWordRepository.findById(id).orElseThrow(() -> new RuntimeException("Compound not found"));
        translateIfNull(words);
        return words;
    }

    public CompoundWords getCompoundWordByWord(String word) {
        CompoundWords words = compoundWordRepository.findByWordOrHiragana(word, word).orElseThrow(() -> new RuntimeException("Compound word not found!"));
        translateIfNull(words);
        return words;
    }

    public PagedResponse<CompoundWords> getCompoundWordByMeaning(String meaning, int page, int size) {
//        String key = "%" + meaning + "%";
        Page<CompoundWords> wordsPage = compoundWordRepository.findByMeaningFullText(meaning, PageRequest.of(page, size));
        Page<CompoundWords> update = wordsPage.map(this::translateIfNull);
        return PagedMapper.map(update);
    }

    public PagedResponse<CompoundWords> getByKanjiId(Integer kanjiId, int page, int size) {
        Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(kanjiId, PageRequest.of(page, size));
        Page<CompoundWords> update = compoundWords.map(this::translateIfNull);
        return PagedMapper.map(update);
    }

}
