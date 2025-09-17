package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface KanjiMapper {
    KanjiDto toDto(Kanji entity);
    List<KanjiDto> toDtoList(List<Kanji> entity);

    KanjiDto toDtoWithCompoundWords(Kanji entity, List<CompoundWords> compoundWords);
}
