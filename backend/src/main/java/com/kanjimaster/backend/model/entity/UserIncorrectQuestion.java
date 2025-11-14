package com.kanjimaster.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_incorrect_questions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "question_id", "question_type"})
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserIncorrectQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "question_id", nullable = false)
    Integer questionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    QuestionType questionType;

    @Column(name = "level", nullable = false)
    String level;

    @CreationTimestamp
    LocalDateTime dateAdded;
}
