package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.mapper.CompoundWordMapper;
import com.kanjimaster.backend.model.dto.CompoundWordDetailDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.NotebookEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CompoundWordService
 */
@ExtendWith(MockitoExtension.class)
class CompoundWordServiceTest {

    @Mock
    private CompoundWordRepository compoundWordRepository;

    @Mock
    private TranslationService translationService;

    @Mock
    private CompoundWordMapper compoundWordMapper;

    @Mock
    private NotebookEntryRepository notebookEntryRepository;

    @InjectMocks
    private CompoundWordService compoundWordService;

    private CompoundWords testCompound;

    @BeforeEach
    void setUp() {
        testCompound = new CompoundWords();
        testCompound.setId(1);
        testCompound.setWord("日本語");
        testCompound.setHiragana("にほんご");
        testCompound.setMeaning("tiếng Nhật");
        testCompound.setExample("日本語を勉強します");
        testCompound.setExampleMeaning("Học tiếng Nhật");
    }

    @Test
    void translateIfNull_AlreadyTranslated_NoChange() {
        // Given - compound already has meaning and exampleMeaning
        
        // When
        CompoundWords result = compoundWordService.translateIfNull(testCompound);

        // Then
        assertEquals("tiếng Nhật", result.getMeaning());
        verify(translationService, never()).translateText(anyString());
        verify(compoundWordRepository, never()).save(any());
    }

    @Test
    void translateIfNull_MissingMeaning_TranslatesAndSaves() {
        // Given
        testCompound.setMeaning(null);
        when(translationService.translateText("日本語")).thenReturn("tiếng Nhật");
        when(compoundWordRepository.save(any(CompoundWords.class))).thenReturn(testCompound);

        // When
        CompoundWords result = compoundWordService.translateIfNull(testCompound);

        // Then
        assertEquals("tiếng Nhật", result.getMeaning());
        verify(translationService, times(1)).translateText("日本語");
        verify(compoundWordRepository, times(1)).save(testCompound);
    }

    @Test
    void translateIfNull_MissingExampleMeaning_TranslatesAndSaves() {
        // Given
        testCompound.setExampleMeaning(null);
        when(translationService.translateText("日本語を勉強します")).thenReturn("Học tiếng Nhật");
        when(compoundWordRepository.save(any(CompoundWords.class))).thenReturn(testCompound);

        // When
        CompoundWords result = compoundWordService.translateIfNull(testCompound);

        // Then
        assertEquals("Học tiếng Nhật", result.getExampleMeaning());
        verify(translationService, times(1)).translateText("日本語を勉強します");
        verify(compoundWordRepository, times(1)).save(testCompound);
    }

    @Test
    void getById_Success() {
        // Given
        String userId = "user123";
        CompoundWords relatedCompound = new CompoundWords();
        relatedCompound.setId(2);
        relatedCompound.setWord("日本");
        relatedCompound.setMeaning("Nhật Bản");

        Page<CompoundWords> relatedPage = new PageImpl<>(Arrays.asList(testCompound, relatedCompound));
        List<Integer> savedNotebookIds = Arrays.asList(1, 2);

        when(compoundWordRepository.findById(1)).thenReturn(Optional.of(testCompound));
        when(compoundWordRepository.findByMeaningFullText(anyString(), any(Pageable.class)))
                .thenReturn(relatedPage);
        when(notebookEntryRepository.findNotebookIdsByCompoundId(userId, 1))
                .thenReturn(savedNotebookIds);
        when(compoundWordMapper.toDetailDto(any(), anyList(), anyList()))
                .thenReturn(new CompoundWordDetailDto());

        // When
        CompoundWordDetailDto result = compoundWordService.getById(1, userId);

        // Then
        assertNotNull(result);
        verify(compoundWordRepository).findById(1);
        verify(notebookEntryRepository).findNotebookIdsByCompoundId(userId, 1);
    }

    @Test
    void getById_NotFound_ThrowsException() {
        // Given
        when(compoundWordRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> compoundWordService.getById(999, "user123"));
    }

    @Test
    void getCompoundWordByMeaning_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<CompoundWords> compounds = Arrays.asList(testCompound);
        Page<CompoundWords> compoundPage = new PageImpl<>(compounds, pageable, 1);

        when(compoundWordRepository.findByMeaningFullText("tiếng Nhật", pageable))
                .thenReturn(compoundPage);

        // When
        PagedResponse<CompoundWords> result = compoundWordService.getCompoundWordByMeaning("tiếng Nhật", 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalItems());
        verify(compoundWordRepository).findByMeaningFullText("tiếng Nhật", pageable);
    }
}
