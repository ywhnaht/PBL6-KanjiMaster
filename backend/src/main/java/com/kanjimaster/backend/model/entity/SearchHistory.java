package com.kanjimaster.backend.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import jakarta.persistence.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchHistory  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "search_term")
    String searchTerm;

    @Column(name = "result_type")
    @Enumerated(EnumType.STRING)
    NotebookEntryType resultType; // Enum: KANJI / COMPOUND

    @Column(name = "kanji_id")
    Integer kanjiId;

    @Column(name = "compound_id")
    Integer compoundId;

    @Column(name = "meaning")
    String meaning;

    @CreationTimestamp
    @Column(name = "search_timestamp")
    LocalDateTime searchTimestamp;
}
