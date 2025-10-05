package com.kanjimaster.backend.model.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FullSearchResponse {
    String mode;
    String type;
    String query;
    int totalKanjiResults;
    int totalCompoundResults;
    List<KanjiDto> kanjiResults;
    List<CompoundWordDto> compoundResults;
}
