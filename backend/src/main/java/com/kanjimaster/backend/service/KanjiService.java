package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.KanjiNotFoundException;
import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.repository.KanjiRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KanjiService {
    KanjiMapper kanjiMapper;
    CompoundWordRepository compoundWordRepository;
    KanjiRepository kanjiRepository;

    public KanjiDto getKanjiById(Integer id) {
        Kanji kanji = kanjiRepository.findById(id).orElseThrow(() -> new KanjiNotFoundException("Kanji not found!"));
        Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(id, PageRequest.of(0, 5));
        List<CompoundWords> compound = compoundWords.getContent();

        return kanjiMapper.toDtoWithCompoundWords(kanji, compound);
    }

    public KanjiDto getKanjiByCharacter(String character) {
        Kanji kanji = kanjiRepository.findByKanji(character).orElseThrow(() -> new KanjiNotFoundException("Kanji not found"));
        Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(kanji.getId(), PageRequest.of(0, 5));
        List<CompoundWords> compound = compoundWords.getContent();

        return kanjiMapper.toDtoWithCompoundWords(kanji, compound);
    }

    public PagedResponse<KanjiDto> getKanjiByLevel(String level, int page, int size) {
        Page<Kanji> kanjiPage = kanjiRepository.findByLevel(level, PageRequest.of(page, size));

        return PagedMapper.map(kanjiPage, kanjiMapper::toDto);
    }

    public PagedResponse<KanjiDto> getKanjiByHanViet(String hanViet, int page, int size) {
        Page<Kanji> kanjiPage = kanjiRepository.findByHanVietFullText(hanViet, PageRequest.of(page, size));

        return PagedMapper.map(kanjiPage, kanjiMapper::toDto);
    }

    public List<KanjiDto> getKanjiByCompoundId(Integer compoundId) {
        List<Kanji> kanjiList = kanjiRepository.findKanjiByCompoundId(compoundId);

        List<KanjiDto> result = kanjiList.stream().map(k -> {
            Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(k.getId(), PageRequest.of(0, 5));
            List<CompoundWords> compound = compoundWords.getContent();
            return kanjiMapper.toDtoWithCompoundWords(k, compound);
        }).toList();

        return result;
    }

    // public PagedResponse<KanjiDto> searchKanji(String key, String field, int page, int size) {
    //     if ("han-viet".equals(field)) {
    //         return PagedMapper.map(kanjiRepository.findByHanViet(key, PageRequest.of(page, size)), kanjiMapper::toDto);
    //     }
    //     else if ("kanji".equals(field)) {
    //         return PagedMapper.map(kanjiRepository.findByKanji(key), kanjiMapper::toDto);
    //     }
    // }
}
