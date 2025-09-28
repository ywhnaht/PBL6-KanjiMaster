package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.CompoundWordDto;
import com.kanjimaster.backend.model.dto.KanjiDto;
import com.kanjimaster.backend.model.dto.KanjiExampleDto;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.KanjiExamples;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface KanjiMapper {
    @Mapping(target = "compoundWords", ignore = true)
    @Mapping(target = "kanjiExamples", source = "kanjiExamples")
    KanjiDto toDto(Kanji entity);
    List<KanjiDto> toDtoList(List<Kanji> entity);

//    KanjiDto toDtoWithCompoundWords(Kanji entity, List<CompoundWords> compoundWords);
    CompoundWordDto toDto(CompoundWords entity);
    KanjiExampleDto toDto(KanjiExamples entity);
    // List<KanjiExampleDto> toDtoList(List<KanjiExamples> entities); 

    default KanjiDto toDtoWithCompoundWords(Kanji kanji, List<CompoundWords> compoundWords) {
        KanjiDto dto = toDto(kanji);
        if (compoundWords != null && !compoundWords.isEmpty()) {
            dto.setCompoundWords(compoundWords.stream().map(this::toDto).toList());
        }
        return dto;
    }
}
