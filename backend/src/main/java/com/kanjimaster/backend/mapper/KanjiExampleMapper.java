package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.KanjiExampleDto;
import com.kanjimaster.backend.model.entity.KanjiExamples;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface KanjiExampleMapper {

    KanjiExampleDto toDto(KanjiExamples entity);

    List<KanjiExampleDto> toDtoList(List<KanjiExamples> entities);
}