package com.kanjimaster.backend.service;

import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.repository.KanjiRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KanjiService {
    KanjiMapper kanjiMapper;
    KanjiRepository kanjiRepository;

    public KanjiDto getKanjiById(Integer id) {
        return kanjiMapper.toDto(kanjiRepository.findById(id).orElseThrow(() -> new RuntimeException("Kanji not found")));
    }

    public KanjiDto getKanjiByCharacter(String character) {
        return kanjiMapper.toDto(kanjiRepository.findByKanji(character).orElseThrow(() -> new RuntimeException("Kanji not found")));
    }

    public PagedResponse<KanjiDto> getKanjiByLevel(String level, int page, int size) {
        Page<Kanji> kanjiPage = kanjiRepository.findByLevel(level, PageRequest.of(page, size));

        return PagedMapper.map(kanjiPage, kanjiMapper::toDto);
    }

    public PagedResponse<KanjiDto> getKanjiByHanViet(String hanViet, int page, int size) {
        Page<Kanji> kanjiPage = kanjiRepository.findByHanVietFullText(hanViet, PageRequest.of(page, size));

        return PagedMapper.map(kanjiPage, kanjiMapper::toDto);
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
