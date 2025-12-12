package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.SearchHistoryDto;
import com.kanjimaster.backend.model.enums.NotebookEntryType;
import com.kanjimaster.backend.model.entity.SearchHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SearchHistoryMapper {

    @Mapping(target = "entityId", source = "entity", qualifiedByName = "mapEntityId")
    SearchHistoryDto toDto(SearchHistory entity);

    List<SearchHistoryDto> toDtoList(List<SearchHistory> entities);

    @Named("mapEntityId")
    default Integer mapEntityId(SearchHistory entity) {
        if (entity.getResultType() == NotebookEntryType.KANJI) {
            return entity.getKanjiId();
        } else if (entity.getResultType() == NotebookEntryType.COMPOUND) {
            return entity.getCompoundId();
        }
        return null;
    }
}