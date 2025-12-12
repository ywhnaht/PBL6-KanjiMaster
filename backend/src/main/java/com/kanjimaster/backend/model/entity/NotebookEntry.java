package com.kanjimaster.backend.model.entity;

import com.kanjimaster.backend.model.enums.NotebookEntryType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "notebook_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "notebook_id", "entity_type", "kanji_id", "compound_id"
        }, name = "uk_notebook_word")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotebookEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notebook_id")
    Notebook notebook;

    @ManyToOne(fetch = FetchType.LAZY)
    User user;

    @Column(name = "entity_type")
    @Enumerated(EnumType.STRING)
    NotebookEntryType entityType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanji_id")
    Kanji kanji;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compound_id")
    CompoundWords compoundWords;

    @Column(name = "review_count")
    Integer reviewCount;

    @Column(name = "last_reviewed")
    LocalDateTime lastReviewed;

    @Column(name = "next_review_date")
    LocalDate nextReviewDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
