-- Migration for Battle History table
-- Created: 2025-12-11
-- Description: Create table for storing battle match history

CREATE TABLE battle_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id varchar(255) NOT NULL,
    player2_id varchar(255) NOT NULL,
    winner_id varchar(255),
    player1_score INT NOT NULL DEFAULT 0,
    player2_score INT NOT NULL DEFAULT 0,
    level varchar(10) NOT NULL,
    total_questions INT NOT NULL DEFAULT 10,
    completed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_player1 (player1_id),
    INDEX idx_player2 (player2_id),
    INDEX idx_winner (winner_id),
    INDEX idx_completed_at (completed_at),
    INDEX idx_level (level),
    
    CONSTRAINT fk_battle_player1 FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_battle_player2 FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_battle_winner FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

