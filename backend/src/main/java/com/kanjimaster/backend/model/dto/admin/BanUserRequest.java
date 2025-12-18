package com.kanjimaster.backend.model.dto.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BanUserRequest {
    String reason; // Optional reason for ban
}
