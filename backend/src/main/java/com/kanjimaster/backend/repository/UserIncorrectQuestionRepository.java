package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.enums.QuestionType;
import com.kanjimaster.backend.model.entity.UserIncorrectQuestion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserIncorrectQuestionRepository extends JpaRepository<UserIncorrectQuestion, Integer> {
    @Query("SELECT uq FROM UserIncorrectQuestion uq " +
            "WHERE uq.user.id = :userId AND uq.level = :level " +
            "ORDER BY FUNCTION('RAND')")
    List<UserIncorrectQuestion> findReviewQuestionsByLevel(
            @Param("userId") String userId,
            @Param("level") String level,
            Pageable pageable
    );

    Optional<UserIncorrectQuestion> findByUser_IdAndQuestionIdAndQuestionType(
            String userId, Integer questionId, QuestionType questionType
    );

    @Modifying
    @Query("""
        delete from UserIncorrectQuestion uq
        where uq.user.id = :userId
        and uq.questionType = :type
        and uq.questionId in :ids
    """)
    void deleteReviewQuestions(@Param("userId") String userId, @Param("type") QuestionType type, @Param("ids") List<Integer> ids);
}
