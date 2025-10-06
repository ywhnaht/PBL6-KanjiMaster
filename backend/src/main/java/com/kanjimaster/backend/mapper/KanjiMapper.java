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
        // Báo cho KanjiMapper biết về sự tồn tại của các mapper khác
        uses = { CompoundWordMapper.class, KanjiExampleMapper.class }
)
public interface KanjiMapper {

    // MapStruct sẽ tự động dùng KanjiExampleMapper để chuyển đổi trường này
    @Mapping(target = "kanjiExamples", source = "kanjiExamples")
    // Trường compoundWords sẽ được xử lý thủ công ở dưới
    @Mapping(target = "compoundWords", ignore = true)
    KanjiDto toDto(Kanji entity);

    List<KanjiDto> toDtoList(List<Kanji> entities);

    // Phương thức custom để thêm danh sách từ ghép
    default KanjiDto toDtoWithCompoundWords(Kanji kanji, List<CompoundWords> compoundWords, @Context CompoundWordMapper compoundWordMapper) {
        if (kanji == null) {
            return null;
        }
        // Gọi phương thức mapping cơ bản
        KanjiDto dto = toDto(kanji);
        // Dùng CompoundWordMapper được inject để chuyển đổi danh sách
        if (compoundWords != null) {
            dto.setCompoundWords(compoundWordMapper.toDtoList(compoundWords));
        }
        return dto;
    }
}
