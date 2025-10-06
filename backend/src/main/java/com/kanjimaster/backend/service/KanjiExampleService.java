package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.entity.KanjiExamples;
import com.kanjimaster.backend.repository.KanjiExampleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class KanjiExampleService {
    KanjiExampleRepository kanjiExampleRepository;
    TranslationService translationService;

    public KanjiExamples translateIfNull(KanjiExamples kanjiExamples) {
        if (kanjiExamples.getMeaning() == null || kanjiExamples.getMeaning().isEmpty()) {
            String vi = translationService.translateText(kanjiExamples.getSentence());

            kanjiExamples.setMeaning(vi);
            kanjiExampleRepository.save(kanjiExamples);
        }

        return kanjiExamples;
    }
}
