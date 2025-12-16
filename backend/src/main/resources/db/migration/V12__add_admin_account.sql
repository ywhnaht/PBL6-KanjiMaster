INSERT INTO users (id, email, password, created_at, is_verified) VALUES
                                                                     (10001, 'admin_huy@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2025-09-01 10:00:00', 1),
                                                                     (10002, 'admin_vu@gmail.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2025-08-15 14:30:00', 1),
                                                                     (10003, 'admin_hoang@email.com', '$2a$10$Ii3Z5H9ib1PUqEk/qkwRJ.9RX4YkIJAjWzP5kAi.OA6W7iYVom9mm', '2025-07-20 08:00:00', 1);

INSERT INTO user_roles (user_id, role_id) VALUES
                                              (10001, 2),
                                              (10002, 2),
                                              (10003, 2);

INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, total_kanji_learned, streak_days, created_at) VALUES
                                                                                                                  (10001, 'Hồ Thanh Huy', 'https://i.pinimg.com/736x/80/fa/3a/80fa3a38453854d208d5295f9718fe75.jpg', 'Mình mới bắt đầu học tiếng Nhật, mong được giúp đỡ!', 3, 3, now()),
                                                                                                                  (10002, 'Tuan Vu', 'https://i.pinimg.com/736x/4e/0e/8e/4e0e8e194d202d9b75b79236eb7dcdfe.jpg', 'Đã hoàn thành N5, mục tiêu tiếp theo là N4!', 0, 15, now()),
                                                                                                                  (10003, 'Boi Hoang', 'https://i.pinimg.com/736x/11/e2/b6/11e2b655242d7c1902837c3cb22e3ced.jpg', 'Cùng nhau chinh phục N1 nào!', 0, 7, now());

