package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.mapper.NotebookMapper;
import com.kanjimaster.backend.model.dto.NotebookCreateRequest;
import com.kanjimaster.backend.model.dto.NotebookDetailDto;
import com.kanjimaster.backend.model.dto.NotebookDto;
import com.kanjimaster.backend.model.dto.NotebookEntryRequest;
import com.kanjimaster.backend.model.entity.*;
import com.kanjimaster.backend.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotebookService {
    NotebookRepository notebookRepository;
    NotebookEntryRepository notebookEntryRepository;
    KanjiRepository kanjiRepository;
    CompoundWordRepository compoundWordRepository;
    UserRepository userRepository;
    NotebookMapper notebookMapper;

    public List<NotebookDto> findAllByUserId(String userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        List<Notebook> notebooks = notebookRepository.findNotebookByUserId(userId);
        return notebookMapper.toNotebookDtoList(notebooks);
    }

    public NotebookDetailDto getNotebookDetail(Integer notebookId, String userId) {
        Notebook notebook = notebookRepository.findById(notebookId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTEBOOK_NOT_FOUND));

        if (!notebook.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.NOTEBOOK_UNAUTHORIZED);
        }

        return notebookMapper.toDetailDto(notebook);
    }

    public NotebookDto createNotebook(NotebookCreateRequest notebook, String userId) {
        if (notebookRepository.existsByNameAndUserId(notebook.getName(), userId)) {
            throw new AppException(ErrorCode.NOTEBOOK_EXISTS);
        }

        if (userId == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notebook newNotebook = Notebook.builder()
                .name(notebook.getName())
                .user(user)
                .description(notebook.getDescription())
                .build();

        return notebookMapper.toNotebookDto(notebookRepository.save(newNotebook));
    }

    public void addEntryToNotebook(NotebookEntryRequest notebookEntry, String userId, Integer id) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notebook notebook = notebookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTEBOOK_NOT_FOUND));

        if (!notebook.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.NOTEBOOK_UNAUTHORIZED);
        }

        NotebookEntry newNotebookEntry = NotebookEntry.builder()
                .entityType(notebookEntry.getEntityType())
                .user(user)
                .notebook(notebook)
                .reviewCount(0)
                .build();

        if (notebookEntry.getEntityType().equals(NotebookEntryType.KANJI)) {
            Kanji kanji = kanjiRepository.findById(notebookEntry.getEntityId()).orElseThrow(() -> new AppException(ErrorCode.KANJI_NOT_FOUND));
            newNotebookEntry.setKanji(kanji);
        }
        else if (notebookEntry.getEntityType().equals(NotebookEntryType.COMPOUND)) {
            CompoundWords compoundWords = compoundWordRepository.findById(notebookEntry.getEntityId())
                    .orElseThrow(() -> new AppException(ErrorCode.COMPOUND_NOT_FOUND));
            newNotebookEntry.setCompoundWords(compoundWords);
        }

        notebookEntryRepository.save(newNotebookEntry);
    }

    @Transactional
    public void deleteNotebook(String userId, Integer notebookId) {
        Notebook notebook = notebookRepository.findById(notebookId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTEBOOK_NOT_FOUND));

        if (!notebook.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.NOTEBOOK_UNAUTHORIZED);
        }

        notebookRepository.delete(notebook);
    }

    @Transactional
    public void deleteEntry(Integer entryId, String userId) {
        NotebookEntry notebookEntry = notebookEntryRepository.findById(entryId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTRY_NOT_FOUND));

        if (!notebookEntry.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.NOTEBOOK_UNAUTHORIZED);
        }

        notebookEntryRepository.deleteByIdAndUserId(entryId, userId);
    }

    @Transactional
    public void deleteBulkEntries(List<Integer> entryIds, String userId) {
        if (entryIds == null || entryIds.isEmpty()) return;

        notebookEntryRepository.deleteAllByIdInAndUserId(entryIds, userId);
    }
}
