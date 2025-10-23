package com.kanjimaster.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KanjiProgressId implements Serializable {
    @Column(name = "user_id")
    String userId;

    @Column(name = "kanji_id")
    Integer kanjiId;
}
