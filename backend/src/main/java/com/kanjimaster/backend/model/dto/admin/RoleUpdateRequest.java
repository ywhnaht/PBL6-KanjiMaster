package com.kanjimaster.backend.model.dto.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleUpdateRequest {
    @NotEmpty(message = "Danh sách roles không được để trống")
    List<String> roles;
}
