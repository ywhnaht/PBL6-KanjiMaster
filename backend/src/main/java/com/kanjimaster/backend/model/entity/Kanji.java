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
@Table(
        name = "kanji",
        indexes = {
                @Index(name = "idx_char", columnList = "`char`"),
                @Index(name = "idx_han_viet", columnList = "han_viet"),
                @Index(name = "idx_radical", columnList = "radical")
        }
)
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

    @Column(name = "svg_link", nullable = false)
    String svgLink;

    @OneToMany(mappedBy = "kanji", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    Set<CompoundKanji> compoundKanjis;
}
