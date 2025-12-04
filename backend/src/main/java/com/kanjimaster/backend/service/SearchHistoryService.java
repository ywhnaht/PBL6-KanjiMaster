package com.kanjimaster.backend.service;

import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.mapper.SearchHistoryMapper;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.SearchHistoryDto;
import com.kanjimaster.backend.model.entity.NotebookEntryType;
import com.kanjimaster.backend.model.entity.SearchHistory;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.repository.SearchHistoryRepository;
import com.kanjimaster.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchHistoryService {
    SearchHistoryRepository searchHistoryRepository;
    SearchHistoryMapper searchHistoryMapper;
    UserRepository userRepository;

    @Async
    @Transactional
    public void logSearch(String userId, String searchTerm, NotebookEntryType type, Integer entityId, String meaning) {
        if (userId == null) return;

        try {
            User user = userRepository.getReferenceById(userId);

            SearchHistory history = SearchHistory.builder()
                    .user(user)
                    .searchTerm(searchTerm)
                    .resultType(type)
                    .meaning(meaning)
                    .build();

            if (type == NotebookEntryType.KANJI) {
                history.setKanjiId(entityId);
            } else if (type == NotebookEntryType.COMPOUND) {
                history.setCompoundId(entityId);
            }

            searchHistoryRepository.save(history);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public PagedResponse<SearchHistoryDto> getUserHistory(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (userId == null) {
            return PagedMapper.map(Page.empty(pageable));
        }

        Page<SearchHistory> historyPage = searchHistoryRepository.findByUserIdOrderBySearchTimestampDesc(userId, pageable);

        return PagedMapper.map(historyPage, searchHistoryMapper::toDto);
    }
}
