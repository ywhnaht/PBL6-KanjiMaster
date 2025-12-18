package com.kanjimaster.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "word_suggestions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WordSuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    
    @Column(name = "user_id", nullable = false)
    String userId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    SuggestionType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    SuggestionStatus status = SuggestionStatus.PENDING;
    
    // Kanji fields
    String kanji;
    
    @Column(name = "han_viet")
    String hanViet;
    
    String onyomi;
    String kunyomi;
    
    @Column(name = "joyo_reading")
    String joyoReading;
    
    // Compound fields
    String word;
    String reading;
    String hiragana;
    
    // Common fields
    @Column(columnDefinition = "TEXT")
    String meaning;
    
    @Column(columnDefinition = "TEXT")
    String reason;
    
    // Admin response
    @Column(name = "admin_id")
    String adminId;
    
    @Column(name = "admin_note", columnDefinition = "TEXT")
    String adminNote;
    
    @Column(name = "reviewed_at")
    LocalDateTime reviewedAt;
    
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum SuggestionType {
        ADD_KANJI,
        ADD_COMPOUND,
        CORRECTION
    }
    
    public enum SuggestionStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
