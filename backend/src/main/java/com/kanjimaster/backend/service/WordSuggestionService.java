package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.mapper.WordSuggestionMapper;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.admin.CompoundCreateRequest;
import com.kanjimaster.backend.model.dto.admin.CompoundUpdateRequest;
import com.kanjimaster.backend.model.dto.admin.KanjiCreateRequest;
import com.kanjimaster.backend.model.dto.admin.KanjiUpdateRequest;
import com.kanjimaster.backend.model.dto.suggestion.CreateSuggestionRequest;
import com.kanjimaster.backend.model.dto.suggestion.ReviewSuggestionRequest;
import com.kanjimaster.backend.model.dto.suggestion.WordSuggestionDto;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.Role;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.model.entity.WordSuggestion;
import com.kanjimaster.backend.model.enums.NotificationType;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import com.kanjimaster.backend.repository.UserRepository;
import com.kanjimaster.backend.repository.WordSuggestionRepository;
import com.kanjimaster.backend.util.SecurityUtils;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WordSuggestionService {
    
    WordSuggestionRepository suggestionRepository;
    UserRepository userRepository;
    WordSuggestionMapper suggestionMapper;
    NotificationService notificationService;
    JavaMailSender mailSender;
    AdminKanjiService adminKanjiService;
    AdminCompoundService adminCompoundService;
    KanjiRepository kanjiRepository;
    CompoundWordRepository compoundWordRepository;

    @NonFinal
    @Value("${spring.mail.username}")
    String fromEmail;
    
    @Transactional
    public WordSuggestionDto createSuggestion(CreateSuggestionRequest request) {
        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Build suggestion based on type to avoid mixed data
        WordSuggestion.WordSuggestionBuilder builder = WordSuggestion.builder()
                .userId(userId)
                .type(request.getType())
                .status(WordSuggestion.SuggestionStatus.PENDING)
                .reason(request.getReason());
        
        // Add type-specific fields
        if (request.getType() == WordSuggestion.SuggestionType.ADD_KANJI) {
            builder.kanji(request.getKanji())
                   .hanViet(request.getHanViet())
                   .onyomi(request.getOnyomi())
                   .kunyomi(request.getKunyomi())
                   .joyoReading(request.getJoyoReading());
        } else if (request.getType() == WordSuggestion.SuggestionType.ADD_COMPOUND) {
            builder.word(request.getWord())
                   .reading(request.getReading())
                   .hiragana(request.getHiragana())
                   .meaning(request.getMeaning());
        } else if (request.getType() == WordSuggestion.SuggestionType.CORRECTION) {
            // For correction, include all provided fields
            // The fields that are filled determine whether it's a kanji or compound correction
            if (request.getKanji() != null && !request.getKanji().trim().isEmpty()) {
                builder.kanji(request.getKanji())
                       .hanViet(request.getHanViet())
                       .onyomi(request.getOnyomi())
                       .kunyomi(request.getKunyomi())
                       .joyoReading(request.getJoyoReading());
            }
            if (request.getWord() != null && !request.getWord().trim().isEmpty()) {
                builder.word(request.getWord())
                       .reading(request.getReading())
                       .hiragana(request.getHiragana())
                       .meaning(request.getMeaning());
            }
        }
        
        WordSuggestion suggestion = builder.build();
        suggestion = suggestionRepository.save(suggestion);
        
        // Send realtime notification to all admin users
        try {
            sendAdminNotification(suggestion, user);
        } catch (Exception e) {
            log.error("Failed to send admin notification", e);
        }
        
        return suggestionMapper.toDto(suggestion, user, null);
    }
    
    public PagedResponse<WordSuggestionDto> getAllSuggestions(
            WordSuggestion.SuggestionStatus status,
            WordSuggestion.SuggestionType type,
            Pageable pageable
    ) {
        Page<WordSuggestion> page;
        
        if (status != null && type != null) {
            page = suggestionRepository.findByStatusAndType(status, type, pageable);
        } else if (status != null) {
            page = suggestionRepository.findByStatus(status, pageable);
        } else if (type != null) {
            page = suggestionRepository.findByType(type, pageable);
        } else {
            page = suggestionRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
        List<WordSuggestionDto> dtos = page.getContent().stream()
                .map(s -> {
                    User user = userRepository.findById(s.getUserId()).orElse(null);
                    User admin = s.getAdminId() != null 
                            ? userRepository.findById(s.getAdminId()).orElse(null) 
                            : null;
                    return suggestionMapper.toDto(s, user, admin);
                })
                .toList();
        
        return PagedResponse.<WordSuggestionDto>builder()
                .items(dtos)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalItems(page.getTotalElements())
                .build();
    }
    
    public PagedResponse<WordSuggestionDto> getMySuggestions(Pageable pageable) {
        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        
        Page<WordSuggestion> page = suggestionRepository.findByUserId(userId, pageable);
        
        User user = userRepository.findById(userId).orElse(null);
        
        List<WordSuggestionDto> dtos = page.getContent().stream()
                .map(s -> {
                    User admin = s.getAdminId() != null 
                            ? userRepository.findById(s.getAdminId()).orElse(null) 
                            : null;
                    return suggestionMapper.toDto(s, user, admin);
                })
                .toList();
        
        return PagedResponse.<WordSuggestionDto>builder()
                .items(dtos)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalItems(page.getTotalElements())
                .build();
    }
    
    @Transactional
    public WordSuggestionDto reviewSuggestion(Integer id, ReviewSuggestionRequest request) {
        String adminId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        WordSuggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUGGESTION_NOT_FOUND));
        
        if (suggestion.getStatus() != WordSuggestion.SuggestionStatus.PENDING) {
            throw new AppException(ErrorCode.SUGGESTION_ALREADY_REVIEWED);
        }
        
        suggestion.setStatus(request.getStatus());
        suggestion.setAdminId(adminId);
        suggestion.setAdminNote(request.getAdminNote());
        suggestion.setReviewedAt(LocalDateTime.now());
        
        suggestion = suggestionRepository.save(suggestion);
        
        // If approved, create or update kanji/compound
        if (request.getStatus() == WordSuggestion.SuggestionStatus.APPROVED) {
            try {
                if (suggestion.getType() == WordSuggestion.SuggestionType.ADD_KANJI) {
                    // Create new kanji
                    KanjiCreateRequest kanjiRequest = new KanjiCreateRequest();
                    kanjiRequest.setKanji(suggestion.getKanji());
                    kanjiRequest.setHanViet(suggestion.getHanViet());
                    kanjiRequest.setOnyomi(suggestion.getOnyomi());
                    kanjiRequest.setKunyomi(suggestion.getKunyomi());
                    kanjiRequest.setJoyoReading(suggestion.getJoyoReading());
                    kanjiRequest.setLevel("5"); // Default level N5
                    adminKanjiService.createKanji(kanjiRequest);
                    log.info("Created kanji from suggestion: {}", suggestion.getKanji());
                    
                } else if (suggestion.getType() == WordSuggestion.SuggestionType.ADD_COMPOUND) {
                    // Create new compound
                    CompoundCreateRequest compoundRequest = new CompoundCreateRequest();
                    compoundRequest.setWord(suggestion.getWord());
                    compoundRequest.setReading(suggestion.getReading());
                    compoundRequest.setHiragana(suggestion.getHiragana());
                    compoundRequest.setMeaning(suggestion.getMeaning());
                    adminCompoundService.createCompound(compoundRequest);
                    log.info("Created compound from suggestion: {}", suggestion.getWord());
                    
                } else if (suggestion.getType() == WordSuggestion.SuggestionType.CORRECTION) {
                    // Determine if this is a kanji or compound correction
                    boolean isKanjiCorrection = suggestion.getKanji() != null && 
                        (suggestion.getHanViet() != null || suggestion.getOnyomi() != null || 
                         suggestion.getKunyomi() != null || suggestion.getJoyoReading() != null);
                    
                    boolean isCompoundCorrection = suggestion.getWord() != null &&
                        (suggestion.getReading() != null || suggestion.getHiragana() != null);
                    
                    if (isKanjiCorrection) {
                        // Find and update kanji
                        var kanjiOpt = kanjiRepository.findByKanji(suggestion.getKanji());
                        if (kanjiOpt.isPresent()) {
                            Kanji kanji = kanjiOpt.get();
                            KanjiUpdateRequest updateRequest = new KanjiUpdateRequest();
                            
                            // Only update fields that are not null and not empty
                            if (suggestion.getHanViet() != null && !suggestion.getHanViet().trim().isEmpty()) {
                                updateRequest.setHanViet(suggestion.getHanViet());
                            }
                            if (suggestion.getOnyomi() != null && !suggestion.getOnyomi().trim().isEmpty()) {
                                updateRequest.setOnyomi(suggestion.getOnyomi());
                            }
                            if (suggestion.getKunyomi() != null && !suggestion.getKunyomi().trim().isEmpty()) {
                                updateRequest.setKunyomi(suggestion.getKunyomi());
                            }
                            if (suggestion.getJoyoReading() != null && !suggestion.getJoyoReading().trim().isEmpty()) {
                                updateRequest.setJoyoReading(suggestion.getJoyoReading());
                            }
                            
                            adminKanjiService.updateKanji(kanji.getId(), updateRequest);
                            log.info("Updated kanji from correction suggestion: {}", suggestion.getKanji());
                        } else {
                            log.warn("Kanji not found for correction: {}. May have been deleted.", suggestion.getKanji());
                        }
                        
                    } else if (isCompoundCorrection) {
                        // Find and update compound
                        var compoundOpt = compoundWordRepository.findByWord(suggestion.getWord());
                        if (compoundOpt.isPresent()) {
                            CompoundWords compound = compoundOpt.get();
                            CompoundUpdateRequest updateRequest = new CompoundUpdateRequest();
                            
                            // Only update fields that are not null and not empty
                            if (suggestion.getReading() != null && !suggestion.getReading().trim().isEmpty()) {
                                updateRequest.setReading(suggestion.getReading());
                            }
                            if (suggestion.getHiragana() != null && !suggestion.getHiragana().trim().isEmpty()) {
                                updateRequest.setHiragana(suggestion.getHiragana());
                            }
                            if (suggestion.getMeaning() != null && !suggestion.getMeaning().trim().isEmpty()) {
                                updateRequest.setMeaning(suggestion.getMeaning());
                            }
                            
                            adminCompoundService.updateCompound(compound.getId(), updateRequest);
                            log.info("Updated compound from correction suggestion: {}", suggestion.getWord());
                        } else {
                            log.warn("Compound not found for correction: {}. May have been deleted.", suggestion.getWord());
                        }
                    } else {
                        log.warn("Cannot determine target type for correction suggestion ID: {}", suggestion.getId());
                    }
                }
            } catch (Exception e) {
                log.error("Failed to create/update kanji/compound from suggestion", e);
                // Don't fail the whole review, just log the error
            }
        }
        
        // Send realtime notification to user
        try {
            User user = userRepository.findById(suggestion.getUserId()).orElse(null);
            if (user != null) {
                sendUserNotification(suggestion, user, admin);
            }
        } catch (Exception e) {
            log.error("Failed to send user notification", e);
        }
        
        // Send email to user
        try {
            User user = userRepository.findById(suggestion.getUserId()).orElse(null);
            if (user != null) {
                sendUserEmail(suggestion, user, admin);
            }
        } catch (Exception e) {
            log.error("Failed to send user email", e);
        }
        
        return suggestionMapper.toDto(suggestion, userRepository.findById(suggestion.getUserId()).orElse(null), admin);
    }
    
    public long countPending() {
        return suggestionRepository.countByStatus(WordSuggestion.SuggestionStatus.PENDING);
    }
    
    private String getUserDisplayName(User user) {
        if (user == null) {
            return "Unknown";
        }
        if (user.getUserProfile() != null && user.getUserProfile().getFullName() != null) {
            return user.getUserProfile().getFullName();
        }
        return user.getEmail();
    }
    
    private String getTypeText(WordSuggestion.SuggestionType type) {
        return switch (type) {
            case ADD_KANJI -> "Thêm Kanji mới";
            case ADD_COMPOUND -> "Thêm từ ghép mới";
            case CORRECTION -> "Báo lỗi/Sửa đổi";
        };
    }
    
    private String getContentPreview(WordSuggestion suggestion) {
        // For ADD_KANJI or CORRECTION with kanji fields
        if (suggestion.getType() == WordSuggestion.SuggestionType.ADD_KANJI || 
            (suggestion.getType() == WordSuggestion.SuggestionType.CORRECTION && 
             suggestion.getKanji() != null && suggestion.getKanji().length() <= 2)) {
            if (suggestion.getKanji() != null) {
                return suggestion.getKanji() + 
                    (suggestion.getHanViet() != null && !suggestion.getHanViet().trim().isEmpty() 
                        ? " (" + suggestion.getHanViet() + ")" 
                        : "");
            }
        }
        
        // For ADD_COMPOUND or CORRECTION with compound fields
        if (suggestion.getType() == WordSuggestion.SuggestionType.ADD_COMPOUND || 
            suggestion.getType() == WordSuggestion.SuggestionType.CORRECTION) {
            if (suggestion.getWord() != null && !suggestion.getWord().trim().isEmpty()) {
                return suggestion.getWord() + 
                    (suggestion.getReading() != null && !suggestion.getReading().trim().isEmpty()
                        ? " (" + suggestion.getReading() + ")"
                        : suggestion.getHiragana() != null && !suggestion.getHiragana().trim().isEmpty()
                            ? " (" + suggestion.getHiragana() + ")"
                            : "");
            }
        }
        
        return "N/A";
    }
    
    private void sendAdminNotification(WordSuggestion suggestion, User user) {
        // Gửi thông báo cho tất cả admin users
        List<User> adminUsers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(role -> role.getName().equals("ADMIN")))
                .toList();
        
        String typeText = getTypeText(suggestion.getType());
        String contentPreview = getContentPreview(suggestion);
        String message = String.format("%s đã gửi yêu cầu \"%s\": %s", 
                getUserDisplayName(user), typeText, contentPreview);
        
        for (User admin : adminUsers) {
            notificationService.createNotificationWithEntity(
                    admin.getId(),
                    "Yêu cầu mới từ người dùng",
                    message,
                    NotificationType.SYSTEM,
                    "SUGGESTION",
                    suggestion.getId().toString()
            );
        }
        
        log.info("Admin notifications sent for suggestion ID: {}", suggestion.getId());
    }
    
    private void sendUserNotification(WordSuggestion suggestion, User user, User admin) {
        String typeText = getTypeText(suggestion.getType());
        String contentPreview = getContentPreview(suggestion);
        boolean approved = suggestion.getStatus() == WordSuggestion.SuggestionStatus.APPROVED;
        
        String message = String.format("Yêu cầu \"%s\" (%s) của bạn đã được %s bởi %s",
                typeText,
                contentPreview,
                approved ? "chấp nhận" : "từ chối",
                getUserDisplayName(admin));
        
        if (suggestion.getAdminNote() != null && !suggestion.getAdminNote().isBlank()) {
            message += ". Ghi chú: " + suggestion.getAdminNote();
        }
        
        notificationService.createNotificationWithEntity(
                user.getId(),
                approved ? "Yêu cầu được chấp nhận" : "Yêu cầu bị từ chối",
                message,
                NotificationType.SYSTEM,
                "SUGGESTION",
                suggestion.getId().toString()
        );
        
        log.info("User notification sent for suggestion ID: {}", suggestion.getId());
    }
    
    private void sendUserEmail(WordSuggestion suggestion, User user, User admin) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            
            boolean approved = suggestion.getStatus() == WordSuggestion.SuggestionStatus.APPROVED;
            String statusText = approved ? "đã được chấp nhận" : "đã bị từ chối";
            helper.setSubject("[KanjiMaster] Yêu cầu của bạn " + statusText);
            
            String typeText = getTypeText(suggestion.getType());
            String content = buildUserEmailContent(suggestion, user, admin, typeText, approved);
            
            helper.setText(content, true);
            mailSender.send(message);
            
            log.info("User email sent for suggestion ID: {}", suggestion.getId());
        } catch (Exception e) {
            log.error("Failed to send user email", e);
        }
    }
    
    private String buildUserEmailContent(WordSuggestion suggestion, User user, User admin, String typeText, boolean approved) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        StringBuilder content = new StringBuilder();
        content.append("<html><body style='font-family: Arial, sans-serif;'>");
        content.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>");
        content.append("<h2 style='color: ").append(approved ? "#10b981" : "#ef4444").append(";'>Yêu cầu ")
                .append(approved ? "được chấp nhận" : "bị từ chối").append("</h2>");
        
        content.append("<p>Xin chào <strong>").append(getUserDisplayName(user)).append("</strong>,</p>");
        content.append("<p>Yêu cầu \"<strong>").append(typeText).append("</strong>\" của bạn đã được xem xét.</p>");
        
        // Hiển thị nội dung yêu cầu
        content.append("<div style='background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;'>");
        content.append("<p><strong>Nội dung yêu cầu:</strong> ").append(getContentPreview(suggestion)).append("</p>");
        content.append("</div>");
        
        content.append("<div style='background: ").append(approved ? "#f0fdf4" : "#fef2f2")
                .append("; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ")
                .append(approved ? "#10b981" : "#ef4444").append(";'>");
        content.append("<p><strong>Trạng thái:</strong> <span style='color: ").append(approved ? "#10b981" : "#ef4444")
                .append("; font-weight: bold;'>").append(approved ? "Chấp nhận" : "Từ chối").append("</span></p>");
        content.append("<p><strong>Người duyệt:</strong> ").append(getUserDisplayName(admin)).append("</p>");
        content.append("<p><strong>Thời gian duyệt:</strong> ").append(suggestion.getReviewedAt().format(formatter)).append("</p>");
        
        if (suggestion.getAdminNote() != null && !suggestion.getAdminNote().isBlank()) {
            content.append("<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 10px 0;'>");
            content.append("<p><strong>Ghi chú từ Admin:</strong></p>");
            content.append("<p style='font-style: italic; color: #4b5563;'>").append(suggestion.getAdminNote()).append("</p>");
        }
        content.append("</div>");
        
        content.append("<p style='color: #64748b; margin-top: 20px;'>Cảm ơn bạn đã đóng góp cho KanjiMaster!</p>");
        content.append("<p style='color: #9ca3af; font-size: 12px; margin-top: 30px;'>Email này được gửi tự động. Vui lòng không trả lời email này.</p>");
        content.append("</div></body></html>");
        
        return content.toString();
    }
}
