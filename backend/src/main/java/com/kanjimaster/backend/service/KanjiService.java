package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.KanjiNotFoundException;
import com.kanjimaster.backend.exception.UserNotFoundException;
import com.kanjimaster.backend.mapper.CompoundWordMapper;
import com.kanjimaster.backend.mapper.KanjiBasicMapper;
import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.KanjiBasicDto;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.*;
import com.kanjimaster.backend.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KanjiService {
    KanjiMapper kanjiMapper;
    KanjiBasicMapper kanjiBasicMapper;
    KanjiRepository kanjiRepository;
    CompoundWordRepository compoundWordRepository;
    KanjiExampleService kanjiExampleService;
    CompoundWordMapper compoundWordMapper;
    KanjiProgressRepository kanjiProgressRepository;
    UserRepository userRepository;
    NotebookEntryRepository notebookEntryRepository;

    public KanjiDto getKanjiById(Integer id, String userId) {
        Kanji kanji = kanjiRepository.findById(id).orElseThrow(() -> new KanjiNotFoundException("Kanji not found!"));
        Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(id, PageRequest.of(0, 5));

        List<Integer> savedNotebookIds = new ArrayList<>();
        if (userId != null) {
            savedNotebookIds = notebookEntryRepository.findNotebookIdsByKanjiId(userId, id);
        }

        return kanjiMapper.toDtoWithCompoundWords(kanji, compoundWords.getContent(), savedNotebookIds, compoundWordMapper);
    }

    public KanjiDto getKanjiDetailandView(Integer kanjiId, String userId) {
        Kanji kanji = kanjiRepository.findById(kanjiId).orElseThrow(() -> new KanjiNotFoundException("Kanji not found!"));
        Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(kanjiId, PageRequest.of(0, 5));

        List<Integer> savedNotebookIds = new ArrayList<>();
        if (userId != null) {
            KanjiProgressId kanjiProgressId = new KanjiProgressId(userId, kanjiId);
            KanjiProgress kanjiProgress = kanjiProgressRepository.findById(kanjiProgressId).orElseGet(() -> {
                User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found!"));
                return new KanjiProgress(kanjiProgressId, user, kanji, LearnStatus.LEARNING, LocalDateTime.now(), null);
            });

            LearnStatus currentStatus = kanjiProgress.getStatus();
                if (currentStatus == null) {
                    kanjiProgress.setStatus(LearnStatus.LEARNING);
                    kanjiProgress.setLastReviewAt(LocalDateTime.now());
                    kanjiProgressRepository.save(kanjiProgress);
                }

            savedNotebookIds = notebookEntryRepository.findNotebookIdsByKanjiId(userId, kanjiId);
        }

        return kanjiMapper.toDtoWithCompoundWords(kanji, compoundWords.getContent(), savedNotebookIds, compoundWordMapper);
    }

    public PagedResponse<KanjiBasicDto> getKanjiByLevel(String level, int page, int size) {
        Page<Kanji> kanjiPage = kanjiRepository.findByLevel(level, PageRequest.of(page, size));

        return PagedMapper.map(kanjiPage, kanjiBasicMapper::toDto);
    }

    public PagedResponse<KanjiBasicDto> getKanjiByLevelWithStatus(String level, String userId, int page, int size) {
        if (userId == null) {
            Page<Kanji> kanjiPage = kanjiRepository.findByLevel(level, PageRequest.of(page, size));
            return PagedMapper.map(kanjiPage, kanjiBasicMapper::toDto);
        }

        Page<KanjiBasicDto> kanjiWithStatus = kanjiRepository.findKanjiByLevelWithStatus(level, userId, PageRequest.of(page, size));
        return PagedMapper.map(kanjiWithStatus);
    }

    public PagedResponse<KanjiDto> getKanjiByHanViet(String hanViet, int page, int size) {
        Page<Kanji> kanjiPage = kanjiRepository.findByHanVietFullText(hanViet, PageRequest.of(page, size));

        return PagedMapper.map(kanjiPage, kanjiMapper::toDto);
    }

    public List<KanjiDto> getKanjiByCompoundId(Integer compoundId, String userId) {
        List<Kanji> kanjiList = kanjiRepository.findKanjiByCompoundId(compoundId);


        List<KanjiDto> result = kanjiList.stream().map(k -> {
            Page<CompoundWords> compoundWords = compoundWordRepository.findByKanjiId(k.getId(), PageRequest.of(0, 5));
            List<Integer> savedNotebookIds = new ArrayList<>();

            if (userId != null) {
                savedNotebookIds = notebookEntryRepository.findNotebookIdsByKanjiId(userId, k.getId());
            }
            
            return kanjiMapper.toDtoWithCompoundWords(k, compoundWords.getContent(), savedNotebookIds, compoundWordMapper);
        }).toList();

        return result;
    }
}
