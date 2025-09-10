package com.kanjimaster.backend.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PagedResponse<T> {
    List<T> items;
    int currentPage;
    int totalPages;
    long totalItems;
    int pageSize;
}
