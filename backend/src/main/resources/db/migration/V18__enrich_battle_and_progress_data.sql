-- Migration to enrich battle history, kanji progress, and user profile data
-- Created: 2025-12-18
-- Description: Add sample data for battle history, kanji progress for ranking and leaderboard

-- ============================================================
-- 1. Add more sample users for testing (UUID format)
-- ============================================================
INSERT INTO users (id, email, password, created_at, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'user1@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-01-15 10:00:00', 1),
('550e8400-e29b-41d4-a716-446655440002', 'user2@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-02-20 14:30:00', 1),
('550e8400-e29b-41d4-a716-446655440003', 'user3@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-03-10 08:45:00', 1),
('550e8400-e29b-41d4-a716-446655440004', 'user4@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-04-05 16:20:00', 1),
('550e8400-e29b-41d4-a716-446655440005', 'user5@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-05-12 11:10:00', 1),
('550e8400-e29b-41d4-a716-446655440006', 'user6@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-06-18 09:30:00', 1),
('550e8400-e29b-41d4-a716-446655440007', 'user7@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-07-22 15:45:00', 1),
('550e8400-e29b-41d4-a716-446655440008', 'user8@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-08-08 12:00:00', 1),
('550e8400-e29b-41d4-a716-446655440009', 'user9@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-09-14 10:15:00', 1),
('550e8400-e29b-41d4-a716-446655440010', 'user10@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2024-10-01 13:30:00', 1);

-- Assign USER role (role_id = 1) to new users
INSERT INTO user_roles (user_id, role_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1),
('550e8400-e29b-41d4-a716-446655440002', 1),
('550e8400-e29b-41d4-a716-446655440003', 1),
('550e8400-e29b-41d4-a716-446655440004', 1),
('550e8400-e29b-41d4-a716-446655440005', 1),
('550e8400-e29b-41d4-a716-446655440006', 1),
('550e8400-e29b-41d4-a716-446655440007', 1),
('550e8400-e29b-41d4-a716-446655440008', 1),
('550e8400-e29b-41d4-a716-446655440009', 1),
('550e8400-e29b-41d4-a716-446655440010', 1);

-- ============================================================
-- 2. Add user profiles with diverse stats
-- ============================================================
INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, total_kanji_learned, streak_days, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Nguyễn Văn A', 'https://i.pinimg.com/736x/c6/a8/94/c6a89488c72e891f3df54a41639aac32.jpg', 'Đam mê tiếng Nhật và anime!', 145, 28, '2024-01-15 10:00:00'),
('550e8400-e29b-41d4-a716-446655440002', 'Trần Thị B', 'https://i.pinimg.com/736x/6e/3e/7e/6e3e7e0fb29ec72efaaf8aa38dced1d4.jpg', 'Học tiếng Nhật để đi du học', 198, 42, '2024-02-20 14:30:00'),
('550e8400-e29b-41d4-a716-446655440003', 'Lê Minh C', 'https://i.pinimg.com/736x/1c/49/b6/1c49b6fcb2f5e1c2e7b3b7f7c3f3f3f3.jpg', 'Mục tiêu N2 năm nay!', 167, 35, '2024-03-10 08:45:00'),
('550e8400-e29b-41d4-a716-446655440004', 'Phạm Thu D', 'https://i.pinimg.com/736x/89/24/05/8924058a7e1b7f1c9c0c0c1c1c1c1c1c.jpg', 'Yêu thích văn hóa Nhật Bản', 213, 56, '2024-04-05 16:20:00'),
('550e8400-e29b-41d4-a716-446655440005', 'Hoàng Anh E', 'https://i.pinimg.com/736x/92/a7/3d/92a73d0c8c0c0c0c0c0c0c0c0c0c0c0c.jpg', 'Đang luyện thi N3', 189, 45, '2024-05-12 11:10:00'),
('550e8400-e29b-41d4-a716-446655440006', 'Vũ Hải F', 'https://i.pinimg.com/736x/45/67/89/456789abcdefabcdefabcdefabcdefab.jpg', 'Kanji Master fan #1', 234, 63, '2024-06-18 09:30:00'),
('550e8400-e29b-41d4-a716-446655440007', 'Đỗ Lan G', 'https://i.pinimg.com/736x/78/90/ab/7890abcdefabcdefabcdefabcdefabcd.jpg', 'Học để xem anime không sub', 156, 31, '2024-07-22 15:45:00'),
('550e8400-e29b-41d4-a716-446655440008', 'Bùi Quang H', 'https://i.pinimg.com/736x/cd/ef/ab/cdefabcdefabcdefabcdefabcdefabcd.jpg', 'N4 đã pass, lên N3!', 178, 38, '2024-08-08 12:00:00'),
('550e8400-e29b-41d4-a716-446655440009', 'Mai Linh I', 'https://i.pinimg.com/736x/ab/cd/ef/abcdefabcdefabcdefabcdefabcdefab.jpg', 'Mỗi ngày học 10 kanji mới', 201, 49, '2024-09-14 10:15:00'),
('550e8400-e29b-41d4-a716-446655440010', 'Đinh Khoa J', 'https://i.pinimg.com/736x/12/34/56/123456789abcdef123456789abcdef12.jpg', 'Chinh phục N1 cùng mọi người!', 267, 71, '2024-10-01 13:30:00');

-- ============================================================
-- 3. Add Battle History data (multiple battles between users)
-- ============================================================
-- Battles from last 3 months for ranking
INSERT INTO battle_history (player1_id, player2_id, winner_id, player1_score, player2_score, level, total_questions, completed_at) VALUES
-- November 2024 battles
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 7, 9, 'N5', 10, '2024-11-01 14:30:00'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 6, 8, 'N4', 10, '2024-11-02 10:15:00'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 5, 10, 'N3', 10, '2024-11-03 16:45:00'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440007', 9, 6, 'N5', 10, '2024-11-05 09:20:00'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 4, 10, 'N2', 10, '2024-11-07 15:30:00'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 8, 7, 'N5', 10, '2024-11-10 11:00:00'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 9, 5, 'N4', 10, '2024-11-12 14:20:00'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 10, 6, 'N3', 10, '2024-11-14 10:45:00'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', 9, 7, 'N3', 10, '2024-11-16 16:10:00'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440009', 8, 6, 'N4', 10, '2024-11-18 13:30:00'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 10, 8, 'N2', 10, '2024-11-20 09:50:00'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 7, 6, 'N4', 10, '2024-11-22 15:15:00'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 5, 9, 'N3', 10, '2024-11-24 11:40:00'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 6, 8, 'N4', 10, '2024-11-26 14:05:00'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 7, 10, 'N2', 10, '2024-11-28 10:25:00'),

-- December 2024 battles (more recent)
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 6, 9, 'N4', 10, '2024-12-01 13:20:00'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 10, 7, 'N4', 10, '2024-12-02 09:45:00'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 5, 10, 'N3', 10, '2024-12-03 15:30:00'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 8, 6, 'N4', 10, '2024-12-04 11:15:00'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 9, 7, 'N3', 10, '2024-12-05 14:40:00'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440006', 10, 6, 'N3', 10, '2024-12-06 10:05:00'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 4, 10, 'N2', 10, '2024-12-07 16:25:00'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', 8, 5, 'N5', 10, '2024-12-08 13:50:00'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009', 9, 7, 'N4', 10, '2024-12-09 09:10:00'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', 10, 5, 'N2', 10, '2024-12-10 15:35:00'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 7, 8, 'N4', 10, '2024-12-11 11:20:00'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 6, 10, 'N3', 10, '2024-12-12 14:45:00'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 9, 7, 'N4', 10, '2024-12-13 10:30:00'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 8, 6, 'N4', 10, '2024-12-14 16:55:00'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 7, 9, 'N4', 10, '2024-12-15 13:15:00'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440006', 10, 8, 'N3', 10, '2024-12-16 09:40:00'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 9, 6, 'N5', 10, '2024-12-17 15:05:00'),

-- Recent battles (last 24 hours)
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', 10, 7, 'N5', 10, NOW() - INTERVAL 20 HOUR),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 9, 8, 'N4', 10, NOW() - INTERVAL 15 HOUR),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 10, 6, 'N2', 10, NOW() - INTERVAL 10 HOUR),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 10, 9, 'N3', 10, NOW() - INTERVAL 5 HOUR),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 8, 7, 'N5', 10, NOW() - INTERVAL 2 HOUR);

-- ============================================================
-- 4. Add Kanji Progress data (learning status for users)
-- ============================================================
-- User 1 (145 kanji) - N5 level mostly
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440001', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 30) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 5 LIMIT 100;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440001', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 7) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 3) DAY
FROM kanji WHERE level = 5 AND id NOT IN (
    SELECT kanji_id FROM kanji_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'
) LIMIT 45;

-- User 2 (198 kanji) - N5 completed, N4 in progress
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440002', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 45) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 5 LIMIT 103;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440002', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 30) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 4 LIMIT 70;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440002', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 7) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 3) DAY
FROM kanji WHERE level = 4 AND id NOT IN (
    SELECT kanji_id FROM kanji_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'
) LIMIT 25;

-- User 3 (167 kanji) - Mixed N5 and N4
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440003', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 35) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 5 LIMIT 103;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440003', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 10) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 4) DAY
FROM kanji WHERE level = 4 LIMIT 50;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440003', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 3) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 2) DAY
FROM kanji WHERE level = 4 AND id NOT IN (
    SELECT kanji_id FROM kanji_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440003'
) LIMIT 14;

-- User 4 (213 kanji) - N5, N4 completed, starting N3
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440004', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 60) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level IN (5, 4) LIMIT 180;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440004', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 5) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 3) DAY
FROM kanji WHERE level = 3 LIMIT 33;

-- User 5 (189 kanji) - Working on N4
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440005', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 40) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 5 LIMIT 103;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440005', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 25) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 4 LIMIT 60;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440005', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 8) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 3) DAY
FROM kanji WHERE level = 4 AND id NOT IN (
    SELECT kanji_id FROM kanji_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440005'
) LIMIT 26;

-- User 6 (234 kanji) - High achiever, working on N3
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440006', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 70) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level IN (5, 4) LIMIT 180;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440006', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 20) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 3 LIMIT 40;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440006', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 5) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 3) DAY
FROM kanji WHERE level = 3 AND id NOT IN (
    SELECT kanji_id FROM kanji_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440006'
) LIMIT 14;

-- User 7 (156 kanji) - N5 and starting N4
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440007', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 32) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 5 LIMIT 103;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440007', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 10) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 4) DAY
FROM kanji WHERE level = 4 LIMIT 53;

-- User 8 (178 kanji) - N4 in progress
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440008', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 38) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 5 LIMIT 103;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440008', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 22) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 4 LIMIT 55;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440008', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 6) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 3) DAY
FROM kanji WHERE level = 4 AND id NOT IN (
    SELECT kanji_id FROM kanji_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440008'
) LIMIT 20;

-- User 9 (201 kanji) - N4 almost done
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440009', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 48) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 5 LIMIT 103;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440009', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 28) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 4 LIMIT 75;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440009', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 7) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 3) DAY
FROM kanji WHERE level = 4 AND id NOT IN (
    SELECT kanji_id FROM kanji_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440009'
) LIMIT 23;

-- User 10 (267 kanji) - Top learner, N3 advanced
INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440010', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 80) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level IN (5, 4) LIMIT 180;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440010', id, 'MASTERED', 
       NOW() - INTERVAL FLOOR(RAND() * 25) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 7) DAY
FROM kanji WHERE level = 3 LIMIT 60;

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at)
SELECT '550e8400-e29b-41d4-a716-446655440010', id, 'LEARNING', 
       NOW() - INTERVAL FLOOR(RAND() * 10) DAY,
       NOW() + INTERVAL FLOOR(RAND() * 4) DAY
FROM kanji WHERE level = 2 LIMIT 27;

-- ============================================================
-- 5. Add Quiz History data for variety
-- ============================================================
INSERT INTO quiz_history (user_id, level, score, total_questions, quiz_type, completed_at) VALUES
-- User 1 quiz history
('550e8400-e29b-41d4-a716-446655440001', 'N5', 8, 10, 'KANJI_TO_MEANING', '2024-11-15 10:30:00'),
('550e8400-e29b-41d4-a716-446655440001', 'N5', 7, 10, 'READING', '2024-11-20 14:15:00'),
('550e8400-e29b-41d4-a716-446655440001', 'N5', 9, 10, 'KANJI_TO_MEANING', '2024-12-01 09:45:00'),
('550e8400-e29b-41d4-a716-446655440001', 'N5', 6, 10, 'COMPOUND', '2024-12-10 16:20:00'),

-- User 2 quiz history
('550e8400-e29b-41d4-a716-446655440002', 'N4', 9, 10, 'KANJI_TO_MEANING', '2024-11-18 11:00:00'),
('550e8400-e29b-41d4-a716-446655440002', 'N4', 10, 10, 'READING', '2024-11-25 15:30:00'),
('550e8400-e29b-41d4-a716-446655440002', 'N4', 8, 10, 'COMPOUND', '2024-12-05 10:15:00'),
('550e8400-e29b-41d4-a716-446655440002', 'N4', 9, 10, 'KANJI_TO_MEANING', '2024-12-12 14:40:00'),

-- User 6 quiz history (top performer)
('550e8400-e29b-41d4-a716-446655440006', 'N3', 10, 10, 'KANJI_TO_MEANING', '2024-11-22 13:20:00'),
('550e8400-e29b-41d4-a716-446655440006', 'N3', 9, 10, 'READING', '2024-11-28 09:50:00'),
('550e8400-e29b-41d4-a716-446655440006', 'N3', 10, 10, 'COMPOUND', '2024-12-08 15:10:00'),
('550e8400-e29b-41d4-a716-446655440006', 'N3', 10, 10, 'KANJI_TO_MEANING', '2024-12-15 11:35:00'),

-- User 10 quiz history (top performer)
('550e8400-e29b-41d4-a716-446655440010', 'N2', 9, 10, 'KANJI_TO_MEANING', '2024-11-20 10:40:00'),
('550e8400-e29b-41d4-a716-446655440010', 'N2', 10, 10, 'READING', '2024-11-27 14:25:00'),
('550e8400-e29b-41d4-a716-446655440010', 'N2', 9, 10, 'COMPOUND', '2024-12-06 09:55:00'),
('550e8400-e29b-41d4-a716-446655440010', 'N2', 10, 10, 'KANJI_TO_MEANING', '2024-12-14 16:15:00');
