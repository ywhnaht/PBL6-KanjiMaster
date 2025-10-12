package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.KanjiProgress;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.repository.KanjiProgressRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private KanjiProgressRepository kanjiProgressRepository;
    @Mock
    private KanjiRepository kanjiRepository;

    @InjectMocks
    private KanjiProgressService kanjiProgressService;

    @Test
    void serviceShouldBeInstantiatedSuccessfully() {
        assertThat(kanjiProgressService).isNotNull();
        System.out.println(">>> Test thành công! ProgressService đã được khởi tạo và các mock đã được inject.");
    }
}