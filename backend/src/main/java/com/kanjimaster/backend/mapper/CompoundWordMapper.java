package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.CompoundWordDetailDto;
import com.kanjimaster.backend.model.dto.CompoundWordDto;
import com.kanjimaster.backend.model.entity.CompoundWords;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Context;

import java.util.List;
import java.util.Objects;

@Mapper(componentModel = "spring")
public interface CompoundWordMapper {

    @Mapping(target = "relatedWords", ignore = true)
    CompoundWordDto toDto(CompoundWords entity);
    CompoundWordDetailDto toDetailDto(CompoundWords entity);

    List<CompoundWordDto> toDtoList(List<CompoundWords> entities);

    default CompoundWordDto toDtoWithRelatedWords(CompoundWords mainWord, List<CompoundWords> relatedWords) {
        if (mainWord == null) {
            return null;
        }
        CompoundWordDto dto = toDto(mainWord);
        if (relatedWords != null) {
            dto.setRelatedWords(toDtoList(relatedWords));
        }
        return dto;
    }

    default CompoundWordDetailDto toDetailDto(CompoundWords mainWord,
                                              List<CompoundWords> relatedWords,
                                              List<Integer> savedIds) {
        if (mainWord == null) {
            return null;
        }

        CompoundWordDetailDto detailDto = toDetailDto(mainWord);

        detailDto.setSaveNotebookIds(Objects.requireNonNullElseGet(savedIds, List::of));

        // Dùng lại phương thức toDtoList để map danh sách các từ liên quan
        if (relatedWords != null) {
            detailDto.setRelatedWords(this.toDtoList(relatedWords));
        }

        return detailDto;
    }
}
