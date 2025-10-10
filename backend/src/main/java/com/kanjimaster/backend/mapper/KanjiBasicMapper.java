package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.KanjiBasicDto;
import com.kanjimaster.backend.model.entity.Kanji;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface KanjiBasicMapper {
    KanjiBasicDto toDto(Kanji kanji);
    List<KanjiBasicDto> toDtoList(List<Kanji> kanjiList);
}
