package com.kanjimaster.backend.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkDeleteRequest {
    List<Integer> entryIds;
}