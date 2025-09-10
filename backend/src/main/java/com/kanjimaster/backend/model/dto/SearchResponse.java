package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.entity.CompoundWords;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchResponse {
    List<KanjiDto> kanjiResults;
    List<CompoundWords> compoundResults;
    int totalKanjiResults;
    int totalCompoundResults;
    String searchType;
    String query;
}
