package com.kanjimaster.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "compound_kanji")
public class CompoundKanji {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne
    @JoinColumn(name = "kanji_id", nullable = false)
    Kanji kanji;

    @ManyToOne
    @JoinColumn(name = "compound_id", nullable = false)
    CompoundWords compoundWord;
}
