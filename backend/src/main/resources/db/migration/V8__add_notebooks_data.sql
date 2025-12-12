INSERT INTO notebooks (user_id, name, description, created_at)
VALUES
('1', 'Kanji N5 Cấp Tốc', 'Bộ từ vựng ôn thi JLPT N5 trong 30 ngày', NOW()),
('1', 'Từ vựng đời sống', 'Những từ ghép hay gặp trong anime và manga', NOW()),

('2', 'Kanji Khó Nhớ', 'Danh sách các chữ hay viết sai', NOW());

INSERT INTO notebook_entries (notebook_id, user_id, entity_type, kanji_id, compound_id, review_count, last_reviewed, next_review_date)
SELECT id, user_id, 'KANJI', 1, NULL, 5, DATE_SUB(NOW(), INTERVAL 1 DAY), CURDATE()
FROM notebooks WHERE name = 'Kanji N5 Cấp Tốc' LIMIT 1;

INSERT INTO notebook_entries (notebook_id, user_id, entity_type, kanji_id, compound_id, review_count, last_reviewed, next_review_date)
SELECT id, user_id, 'KANJI', 2, NULL, 12, NOW(), DATE_ADD(CURDATE(), INTERVAL 3 DAY)
FROM notebooks WHERE name = 'Kanji N5 Cấp Tốc' LIMIT 1;

INSERT INTO notebook_entries (notebook_id, user_id, entity_type, kanji_id, compound_id, review_count, last_reviewed, next_review_date)
SELECT id, user_id, 'KANJI', 3, NULL, 0, NULL, NULL
FROM notebooks WHERE name = 'Kanji N5 Cấp Tốc' LIMIT 1;


INSERT INTO notebook_entries (notebook_id, user_id, entity_type, kanji_id, compound_id, review_count, last_reviewed, next_review_date)
SELECT id, user_id, 'COMPOUND', NULL, 10, 3, DATE_SUB(NOW(), INTERVAL 2 DAY), CURDATE()
FROM notebooks WHERE name = 'Từ vựng đời sống' LIMIT 1;

INSERT INTO notebook_entries (notebook_id, user_id, entity_type, kanji_id, compound_id, review_count, last_reviewed, next_review_date)
SELECT id, user_id, 'COMPOUND', NULL, 11, 8, NOW(), DATE_ADD(CURDATE(), INTERVAL 7 DAY)
FROM notebooks WHERE name = 'Từ vựng đời sống' LIMIT 1;


INSERT INTO notebook_entries (notebook_id, user_id, entity_type, kanji_id, compound_id, review_count, last_reviewed, next_review_date)
SELECT id, user_id, 'KANJI', 5, NULL, 20, NOW(), DATE_ADD(CURDATE(), INTERVAL 14 DAY)
FROM notebooks WHERE name = 'Kanji Khó Nhớ' LIMIT 1;