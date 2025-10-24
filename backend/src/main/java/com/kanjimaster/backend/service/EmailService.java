package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.dto.EmailDetail;

public interface EmailService {
    void sendVerificationEmail(String toMail, String token);
}
