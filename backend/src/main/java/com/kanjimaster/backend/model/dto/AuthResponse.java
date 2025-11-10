package com.kanjimaster.backend.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.UserProfile;
import lombok.*;
import lombok.experimental.FieldDefaults;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthResponse {
    String accessToken;
    String refreshToken;
    UserProfileDto user;
}
