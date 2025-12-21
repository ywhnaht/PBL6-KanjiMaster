package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.KanjiNotFoundException;
import com.kanjimaster.backend.exception.UserNotFoundException;
import com.kanjimaster.backend.mapper.CompoundWordMapper;
import com.kanjimaster.backend.mapper.KanjiBasicMapper;
import com.kanjimaster.backend.mapper.KanjiMapper;
import com.kanjimaster.backend.model.dto.KanjiBasicDto;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.entity.*;
import com.kanjimaster.backend.model.enums.LearnStatus;
import com.kanjimaster.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for KanjiService
 * Tests kanji retrieval, search, and progress tracking functionality
 */
@ExtendWith(MockitoExtension.class)
public class KanjiServiceTest {

    @Mock
    private KanjiMapper kanjiMapper;

    @Mock
    private KanjiBasicMapper kanjiBasicMapper;

    @Mock
    private KanjiRepository kanjiRepository;

    @Mock
    private CompoundWordRepository compoundWordRepository;

    @Mock
    private KanjiExampleService kanjiExampleService;

    @Mock
    private CompoundWordMapper compoundWordMapper;

    @Mock
    private KanjiProgressRepository kanjiProgressRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotebookEntryRepository notebookEntryRepository;

    @InjectMocks
    private KanjiService kanjiService;

    private Kanji testKanji;
    private User testUser;
    private CompoundWords testCompound;
    private KanjiDto testKanjiDto;

    @BeforeEach
    void setUp() {
        testKanji = new Kanji();
        testKanji.setId(1);
        testKanji.setKanji("日");
        testKanji.setHanViet("nhật");
        testKanji.setOnyomi("ニチ、ジツ");
        testKanji.setKunyomi("ひ、か");
        testKanji.setLevel("N5");
        testKanji.setStrokes("4");

        testUser = User.builder()
                .id("user123")
                .email("test@example.com")
                .password("password")
                .isVerified(true)
                .build();

        testCompound = new CompoundWords();
        testCompound.setId(1);
        testCompound.setWord("日本");
        testCompound.setReading("にほん");
        testCompound.setMeaning("Japan");

        testKanjiDto = new KanjiDto();
        testKanjiDto.setId(1);
        testKanjiDto.setKanji("日");
    }

    @Test
    void getKanjiById_Success() {
        // Given
        Integer kanjiId = 1;
        String userId = "user123";
        List<CompoundWords> compounds = Collections.singletonList(testCompound);
        Page<CompoundWords> compoundPage = new PageImpl<>(compounds);
        List<Integer> savedNotebookIds = Arrays.asList(1, 2);

        when(kanjiRepository.findById(kanjiId)).thenReturn(Optional.of(testKanji));
        when(compoundWordRepository.findByKanjiId(eq(kanjiId), any(PageRequest.class)))
                .thenReturn(compoundPage);
        when(notebookEntryRepository.findNotebookIdsByKanjiId(userId, kanjiId))
                .thenReturn(savedNotebookIds);
        when(kanjiMapper.toDtoWithCompoundWords(eq(testKanji), anyList(), anyList(), eq(compoundWordMapper)))
                .thenReturn(testKanjiDto);

        // When
        KanjiDto result = kanjiService.getKanjiById(kanjiId, userId);

        // Then
        assertNotNull(result);
        assertEquals(testKanjiDto.getId(), result.getId());
        verify(kanjiRepository).findById(kanjiId);
        verify(compoundWordRepository).findByKanjiId(eq(kanjiId), any(PageRequest.class));
        verify(notebookEntryRepository).findNotebookIdsByKanjiId(userId, kanjiId);
    }

    @Test
    void getKanjiById_KanjiNotFound_ThrowsException() {
        // Given
        Integer kanjiId = 999;
        String userId = "user123";

        when(kanjiRepository.findById(kanjiId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(KanjiNotFoundException.class, 
            () -> kanjiService.getKanjiById(kanjiId, userId));
        verify(kanjiRepository).findById(kanjiId);
        verify(compoundWordRepository, never()).findByKanjiId(anyInt(), any(PageRequest.class));
    }

//    @Test
//    void getKanjiDetailandView_CreatesProgressForNewUser() {
//        // Given
//        Integer kanjiId = 1;
//        String userId = "user123";
//        KanjiProgressId progressId = new KanjiProgressId(userId, kanjiId);
//        List<CompoundWords> compounds = Collections.singletonList(testCompound);
//        Page<CompoundWords> compoundPage = new PageImpl<>(compounds);
//
//        when(kanjiRepository.findById(kanjiId)).thenReturn(Optional.of(testKanji));
//        when(compoundWordRepository.findByKanjiId(eq(kanjiId), any(PageRequest.class)))
//                .thenReturn(compoundPage);
//        when(kanjiProgressRepository.findById(progressId)).thenReturn(Optional.empty());
//        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
//        when(kanjiMapper.toDtoWithCompoundWords(eq(testKanji), anyList(), anyList(), eq(compoundWordMapper)))
//                .thenReturn(testKanjiDto);
//        when(notebookEntryRepository.findNotebookIdsByKanjiId(userId, kanjiId))
//                .thenReturn(Collections.emptyList());
//
//        // When
//        KanjiDto result = kanjiService.getKanjiDetailandView(kanjiId, userId);
//
//        // Then
//        assertNotNull(result);
//        verify(kanjiProgressRepository).save(any(KanjiProgress.class));
//        verify(userRepository).findById(userId);
//    }

    @Test
    void getKanjiByLevel_Success() {
        // Given
        String level = "N5";
        int page = 0;
        int size = 10;
        List<Kanji> kanjis = Arrays.asList(testKanji);
        Page<Kanji> kanjiPage = new PageImpl<>(kanjis);
        KanjiBasicDto basicDto = new KanjiBasicDto();
        basicDto.setId(1);
        basicDto.setKanji("日");

        when(kanjiRepository.findByLevel(eq(level), any(PageRequest.class))).thenReturn(kanjiPage);
        when(kanjiBasicMapper.toDto(any(Kanji.class))).thenReturn(basicDto);

        // When
        PagedResponse<KanjiBasicDto> result = kanjiService.getKanjiByLevel(level, page, size);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalItems());
        verify(kanjiRepository).findByLevel(eq(level), any(PageRequest.class));
    }

    @Test
    void getKanjiById_WithoutUserId_DoesNotLoadProgress() {
        // Given
        Integer kanjiId = 1;
        String userId = null;
        List<CompoundWords> compounds = Collections.singletonList(testCompound);
        Page<CompoundWords> compoundPage = new PageImpl<>(compounds);

        when(kanjiRepository.findById(kanjiId)).thenReturn(Optional.of(testKanji));
        when(compoundWordRepository.findByKanjiId(eq(kanjiId), any(PageRequest.class)))
                .thenReturn(compoundPage);
        when(kanjiMapper.toDtoWithCompoundWords(eq(testKanji), anyList(), anyList(), eq(compoundWordMapper)))
                .thenReturn(testKanjiDto);

        // When
        KanjiDto result = kanjiService.getKanjiById(kanjiId, userId);

        // Then
        assertNotNull(result);
        verify(notebookEntryRepository, never()).findNotebookIdsByKanjiId(anyString(), anyInt());
        verify(kanjiProgressRepository, never()).findById(any(KanjiProgressId.class));
    }
}
