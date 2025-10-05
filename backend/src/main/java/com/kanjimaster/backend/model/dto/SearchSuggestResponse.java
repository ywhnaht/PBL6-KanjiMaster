package com.kanjimaster.backend.model.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SearchSuggestResponse {
    String mode;
    String query;
    int total;
    int totalKanji;
    int totalCompound;
    List<SuggestItem> results;
    Object initials;
}
