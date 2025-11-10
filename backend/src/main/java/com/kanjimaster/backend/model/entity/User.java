package com.kanjimaster.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String email;
    String password;

    @Column(name = "username")
    String username;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "is_verified")
    boolean isVerified = false;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
            @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"))
    List<Role> roles = new ArrayList<>();
}
