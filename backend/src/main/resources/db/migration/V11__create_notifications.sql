-- Migration for Notifications table
-- Created: 2025-12-15
-- Description: Create table for storing user notifications with WebSocket support

CREATE TABLE notifications (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               user_id VARCHAR(255) NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               type VARCHAR(50) NOT NULL DEFAULT 'INFO',
                               related_entity_type VARCHAR(50),
                               related_entity_id VARCHAR(255),
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               read_at TIMESTAMP NULL,

                               INDEX idx_user_id (user_id),
                               INDEX idx_is_read (is_read),
                               INDEX idx_created_at (created_at),
                               INDEX idx_type (type),
                               INDEX idx_user_unread (user_id, is_read),

                               CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
                                   REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert sample notifications for testing
INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id, is_read)
SELECT
    u.id,
    'Chào mừng bạn đến với Kanji Master!',
    'Cảm ơn bạn đã đăng ký. Hãy bắt đầu hành trình học Kanji ngay hôm nay!',
    'WELCOME',
    NULL,
    NULL,
    FALSE
FROM users u
    LIMIT 5;