package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.UserProfileDto;
import com.kanjimaster.backend.model.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    @Mapping(target = "email", source = "user.email")
    UserProfileDto toUserProfileDto(UserProfile userProfile);
}
