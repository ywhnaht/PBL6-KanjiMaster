package com.kanjimaster.backend.exception;

public class KanjiNotFoundException extends RuntimeException {
    public KanjiNotFoundException(String message) {
        super(message);
    }
}

