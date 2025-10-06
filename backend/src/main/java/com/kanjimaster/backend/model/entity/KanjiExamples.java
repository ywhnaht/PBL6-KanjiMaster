package com.kanjimaster.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "kanji_examples", indexes = {
        @Index(name = "idx_kanji_id", columnList = "kanji_id"),
        @Index(name = "idx_target_word", columnList = "target_word")
})
public class KanjiExamples {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    String sentence;

    @Column(name = "target_word")
    String targetWord;
    String reading;
    String meaning;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanji_id", nullable = false)
    @JsonIgnore
    Kanji kanji;
}
