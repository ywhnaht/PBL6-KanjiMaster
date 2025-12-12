package com.kanjimaster.backend.model.dto;

import com.kanjimaster.backend.model.entity.NotebookEntry;
import com.kanjimaster.backend.model.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotebookDto {
    Integer id;
    String name;
    String description;
    Integer totalEntries;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
