package com.kanjimaster.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "kanji_progress")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiProgress {
    @EmbeddedId
    KanjiProgressId id;

    @ManyToOne(fetch = FetchType.LAZY)
            @MapsId("userId")
            @JoinColumn(name = "user_id")
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
            @MapsId("kanjiId")
            @JoinColumn(name = "kanji_id")
    Kanji kanji;

    @Enumerated(EnumType.STRING)
    LearnStatus status;

    @Column(name = "last_review_at")
    LocalDateTime lastReviewAt;

    @Column(name = "next_review_at")
    LocalDateTime nextReviewAt;
}
