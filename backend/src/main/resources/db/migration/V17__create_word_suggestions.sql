-- Drop existing table if exists
DROP TABLE IF EXISTS word_suggestions;

-- Create word_suggestions table for user word/correction requests
CREATE TABLE word_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    type ENUM('ADD_KANJI', 'ADD_COMPOUND', 'CORRECTION') NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    
    -- Kanji suggestion fields
    kanji VARCHAR(10),
    han_viet VARCHAR(255),
    onyomi VARCHAR(255),
    kunyomi VARCHAR(255),
    joyo_reading VARCHAR(255),
    
    -- Compound suggestion fields
    word VARCHAR(255),
    reading VARCHAR(255),
    hiragana VARCHAR(255),
    
    -- Common fields
    meaning TEXT,
    reason TEXT,
    
    -- Admin response
    admin_id VARCHAR(255),
    admin_note TEXT,
    reviewed_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add foreign keys separately after table creation
ALTER TABLE word_suggestions 
    ADD CONSTRAINT fk_word_suggestion_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE word_suggestions 
    ADD CONSTRAINT fk_word_suggestion_admin 
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;
