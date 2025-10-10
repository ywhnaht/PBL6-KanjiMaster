package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Context;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = { CompoundWordMapper.class, KanjiExampleMapper.class }
)
public interface KanjiMapper {
    @Mapping(target = "kanjiExamples", source = "kanjiExamples")
    @Mapping(target = "compoundWords", ignore = true)
    KanjiDto toDto(Kanji entity);

    List<KanjiDto> toDtoList(List<Kanji> entities);

    default KanjiDto toDtoWithCompoundWords(Kanji kanji, List<CompoundWords> compoundWords, @Context CompoundWordMapper compoundWordMapper) {
        if (kanji == null) {
            return null;
        }
        KanjiDto dto = toDto(kanji);
        if (compoundWords != null) {
            dto.setCompoundWords(compoundWordMapper.toDtoList(compoundWords));
        }
        return dto;
    }
}
