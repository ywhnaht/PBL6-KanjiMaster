package com.kanjimaster.backend.model.entity;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "kanji")
public class Kanji {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "`char`", nullable = false)
    String kanji;

    @Column(name = "han_viet", nullable = false)
    String hanViet;

    @Column(name = "joyo_reading", nullable = false)
    String joyoReading;

    String meaning;
    String kunyomi;
    String onyomi;
    String level;
    String radical;
    String strokes;

    @OneToMany(mappedBy = "kanji", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    Set<CompoundKanji> compoundKanjis;
}
