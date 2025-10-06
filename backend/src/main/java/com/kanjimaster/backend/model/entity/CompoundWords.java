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
        name = "compound_words",
        indexes = {
                @Index(name = "idx_word", columnList = "word"),
                @Index(name = "idx_frequency", columnList = "frequency")
        }
)
public class CompoundWords {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String word;

//    @Column(name = "meaning_en")
//    String meaningEn;

//    @Column(name = "meaning_vi")
//    String meaningVi;

    String meaning;

    String reading;

    Integer frequency;

    String hiragana;

    String example;

    @Column(name = "example_meaning")
    String exampleMeaning;

    @OneToMany(mappedBy = "compoundWord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    Set<CompoundKanji> compoundKanjis;
}
