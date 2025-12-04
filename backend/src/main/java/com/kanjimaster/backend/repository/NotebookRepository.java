package com.kanjimaster.backend.repository;

import com.kanjimaster.backend.model.entity.Notebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotebookRepository extends JpaRepository<Notebook, Integer> {
    @Query("""
        select n
        from Notebook n
        where n.user.id = :userId
    """)
    List<Notebook> findNotebookByUserId(@Param("userId") String userId);

    boolean existsByNameAndUserId(String name, String userId);
}
