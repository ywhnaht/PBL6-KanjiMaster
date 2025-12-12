package com.kanjimaster.backend.model.enums;

public enum SearchMode {
    SUGGEST,
    FULL;

    public static SearchMode from(String raw) {
        if (raw == null) return FULL;
        try {
            return SearchMode.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            return FULL;
        }
    }
}
