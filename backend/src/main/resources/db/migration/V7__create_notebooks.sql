use KanjiMaster;

CREATE TABLE notebooks (
                           id int PRIMARY KEY AUTO_INCREMENT,
                           user_id VARCHAR(100) NOT NULL,

                           name VARCHAR(255) NOT NULL,
                           description TEXT NULL,

                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notebook_entries (
                                  id int PRIMARY KEY AUTO_INCREMENT,

                                  notebook_id int NOT NULL,

                                  user_id VARCHAR(100) NOT NULL,

                                  entity_type VARCHAR(20) NOT NULL, -- 'KANJI' hoặc 'COMPOUND'
                                  kanji_id int NULL,
                                  compound_id int NULL,

                                  review_count INT DEFAULT 0,
                                  last_reviewed TIMESTAMP NULL,
                                  next_review_date DATE NULL,

                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
                                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                  FOREIGN KEY (kanji_id) REFERENCES kanji(id),
                                  FOREIGN KEY (compound_id) REFERENCES compound_words(id),

                                  UNIQUE KEY uk_notebook_word (notebook_id, entity_type, kanji_id, compound_id),

                                  CONSTRAINT chk_notebook_entity CHECK (
                                      (entity_type = 'KANJI' AND kanji_id IS NOT NULL AND compound_id IS NULL) OR
                                      (entity_type = 'COMPOUND' AND compound_id IS NOT NULL AND kanji_id IS NULL)
                                      )
);