package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.suggestion.WordSuggestionDto;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.WordSuggestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface WordSuggestionMapper {
    
    @Mapping(target = "id", source = "suggestion.id")
    @Mapping(target = "userId", source = "suggestion.userId")
    @Mapping(target = "type", source = "suggestion.type")
    @Mapping(target = "status", source = "suggestion.status")
    @Mapping(target = "kanji", source = "suggestion.kanji")
    @Mapping(target = "hanViet", source = "suggestion.hanViet")
    @Mapping(target = "onyomi", source = "suggestion.onyomi")
    @Mapping(target = "kunyomi", source = "suggestion.kunyomi")
    @Mapping(target = "joyoReading", source = "suggestion.joyoReading")
    @Mapping(target = "word", source = "suggestion.word")
    @Mapping(target = "reading", source = "suggestion.reading")
    @Mapping(target = "hiragana", source = "suggestion.hiragana")
    @Mapping(target = "meaning", source = "suggestion.meaning")
    @Mapping(target = "reason", source = "suggestion.reason")
    @Mapping(target = "adminId", source = "suggestion.adminId")
    @Mapping(target = "adminNote", source = "suggestion.adminNote")
    @Mapping(target = "reviewedAt", source = "suggestion.reviewedAt")
    @Mapping(target = "createdAt", source = "suggestion.createdAt")
    @Mapping(target = "updatedAt", source = "suggestion.updatedAt")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "username", source = "user", qualifiedByName = "getUserFullName")
    @Mapping(target = "adminUsername", source = "admin", qualifiedByName = "getUserFullName")
    WordSuggestionDto toDto(WordSuggestion suggestion, User user, User admin);
    
    @Named("getUserFullName")
    default String getUserFullName(User user) {
        if (user == null) {
            return null;
        }
        if (user.getUserProfile() != null && user.getUserProfile().getFullName() != null) {
            return user.getUserProfile().getFullName();
        }
        return user.getEmail();
    }
}
