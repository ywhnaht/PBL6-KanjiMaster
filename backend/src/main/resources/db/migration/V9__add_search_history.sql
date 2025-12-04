CREATE TABLE search_history (
                                id INT PRIMARY KEY AUTO_INCREMENT,
                                user_id VARCHAR(100) NOT NULL,

                                search_term VARCHAR(255) NULL, -- Từ khóa user đã gõ
                                meaning NVARCHAR(100),
                                result_type VARCHAR(20) NOT NULL, -- 'KANJI' hoặc 'COMPOUND'

                                kanji_id INT NULL,
                                compound_id INT NULL,

                                search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE SET NULL,
                                FOREIGN KEY (compound_id) REFERENCES compound_words(id) ON DELETE SET NULL,

                                INDEX idx_search_history_user (user_id, search_timestamp DESC)
);

CREATE INDEX idx_srs_review2
    ON notebook_entries (user_id, next_review_date);
