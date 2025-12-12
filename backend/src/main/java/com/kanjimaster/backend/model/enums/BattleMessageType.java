package com.kanjimaster.backend.model.enums;

public enum BattleMessageType {
    // Client -> Server
    JOIN_QUEUE,           // Tham gia hàng đợi
    LEAVE_QUEUE,          // Rời hàng đợi
    ANSWER_QUESTION,      // Trả lời câu hỏi
    READY,                // Sẵn sàng bắt đầu
    REFRESH_TOKEN,        // Làm mới token

    // Server -> Client
    QUEUE_JOINED,         // Đã vào hàng đợi
    MATCH_FOUND,          // Đã tìm thấy đối thủ
    GAME_START,           // Bắt đầu game
    QUESTION,             // Câu hỏi mới
    ANSWER_RESULT,        // Kết quả trả lời
    OPPONENT_ANSWERED,    // Đối thủ đã trả lời
    GAME_END,             // Kết thúc game
    TOKEN_REFRESHED,      // Token đã được làm mới
    TOKEN_EXPIRED,        // Token đã hết hạn
    ERROR                 // Lỗi
}
