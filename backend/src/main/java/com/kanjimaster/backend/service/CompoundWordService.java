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

    public CompoundWords getCompoundWordByWord(String word) {
        return compoundWordRepository.findByWord(word).orElseThrow(() -> new RuntimeException("Compound word not found!"));
    }

    public PagedResponse<CompoundWords> getCompoundWordByMeaning(String meaning, int page, int size) {
//        String key = "%" + meaning + "%";
        Page<CompoundWords> wordsPage = compoundWordRepository.findByMeaningFullText(meaning, PageRequest.of(page, size));
        return PagedMapper.map(wordsPage);
    }

    public PagedResponse<CompoundWords> getByKanjiId(Integer kanjiId, int page, int size) {
        Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(kanjiId, PageRequest.of(page, size));
        return PagedMapper.map(compoundWords);
    }

    public boolean checkMeaningIsNull(Integer id) {
        return compoundWordRepository.existsByIdAndMeaningIsNull(id);
    }

    public void translateAndSaveIfNull(CompoundWords word) {
        if (word.getMeaning() == null || word.getMeaning().isEmpty()) {
            String vi = translationService.translateAndCacheIfNull(word);
            word.setMeaning(vi);
            compoundWordRepository.save(word);
        }
    }

}
