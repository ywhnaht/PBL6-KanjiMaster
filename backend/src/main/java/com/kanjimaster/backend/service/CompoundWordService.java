package com.kanjimaster.backend.service;

import com.kanjimaster.backend.mapper.CompoundWordMapper;
import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.CompoundWordDetailDto;
import com.kanjimaster.backend.model.dto.CompoundWordDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.NotebookEntryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CompoundWordService {
    CompoundWordRepository compoundWordRepository;
    TranslationService translationService;
    CompoundWordMapper compoundWordMapper;
    NotebookEntryRepository notebookEntryRepository;

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

    public CompoundWordDetailDto getById(Integer id, String userId) {
        CompoundWords words = compoundWordRepository.findById(id).orElseThrow(() -> new RuntimeException("Compound not found"));
        translateIfNull(words);

        Page<CompoundWords> related = compoundWordRepository
                .findByMeaningFullText(words.getMeaning(), PageRequest.of(0, 5));

        List<CompoundWords> filteredRelated = related.getContent().stream()
                .filter(word -> !word.getId().equals(id))
                .limit(5)
                .map(this::translateIfNull)
                .collect(Collectors.toList());

        List<Integer> savedNotebookIds = new ArrayList<>();
        if (userId != null) {
            savedNotebookIds = notebookEntryRepository.findNotebookIdsByCompoundId(userId, id);
        }

        return compoundWordMapper.toDetailDto(words, filteredRelated, savedNotebookIds);
    }

    public PagedResponse<CompoundWords> getCompoundWordByMeaning(String meaning, int page, int size) {
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
