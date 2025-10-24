DROP TABLE IF EXISTS kanji_progress;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS history;
drop table if exists auth_tokens;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
                       id varchar(255) PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       is_verified boolean DEFAULT false
);

CREATE TABLE user_roles (
                            user_id varchar(255) NOT NULL,
                            role_id INT NOT NULL,
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(id),
                            FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE user_profiles (
                               id INT PRIMARY KEY AUTO_INCREMENT,
                               user_id varchar(255) NOT NULL,
                               full_name VARCHAR(255),
                               avatar_url VARCHAR(255),
                               bio TEXT,
                               total_kanji_learned INT DEFAULT 0,
                               streak_days INT DEFAULT 0,
                               created_at TIMESTAMP,
                               updated_at TIMESTAMP,
                               FOREIGN KEY (user_id) REFERENCES users(id)
);

create table kanji_progress (
                                user_id varchar(255) NOT NULL,
                                kanji_id INT NOT NULL,
                                status ENUM('LEARNING', 'MASTERED') DEFAULT null,
                                last_review_at timestamp,
                                next_review_at timestamp,

                                PRIMARY KEY (user_id, kanji_id),

                                FOREIGN KEY (user_id) REFERENCES users(id),
                                FOREIGN KEY (kanji_id) REFERENCES kanji(id)
);

INSERT INTO roles (id, name) VALUES (1, 'USER'), (2, 'ADMIN');


INSERT INTO users (id, email, password, created_at, is_verified) VALUES
                                                                  (1, 'huyho@email.com', '$2a$10$28rLv03EJmqntqCUzZXG8uQRZHiqCS.s10qWoYnIrqE3ljFY.f6Qe', '2025-09-01 10:00:00', 0),
                                                                  (2, 'binh.tran@email.com', '$2a$10$28rLv03EJmqntqCUzZXG8uQRZHiqCS.s10qWoYnIrqE3ljFY.f6Qe', '2025-08-15 14:30:00', 1),
                                                                  (3, 'chi.le@email.com', '$2a$10$28rLv03EJmqntqCUzZXG8uQRZHiqCS.s10qWoYnIrqE3ljFY.f6Qe', '2025-07-20 08:00:00', 0);

INSERT INTO user_roles (user_id, role_id) VALUES
                                              (1, 1),
                                              (2, 1),
                                              (3, 1);

INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, total_kanji_learned, streak_days, created_at) VALUES
                                                                                                                  (1, 'Hồ Thanh Huy', 'https://i.pinimg.com/736x/80/fa/3a/80fa3a38453854d208d5295f9718fe75.jpg', 'Mình mới bắt đầu học tiếng Nhật, mong được giúp đỡ!', 3, 3, now()),
                                                                                                                  (2, 'Trần Minh Bình', 'https://i.pinimg.com/736x/4e/0e/8e/4e0e8e194d202d9b75b79236eb7dcdfe.jpg', 'Đã hoàn thành N5, mục tiêu tiếp theo là N4!', 0, 15, now()),
                                                                                                                  (3, 'Lê Thị Chi', 'https://i.pinimg.com/736x/11/e2/b6/11e2b655242d7c1902837c3cb22e3ced.jpg', 'Cùng nhau chinh phục N1 nào!', 0, 7, now());

INSERT INTO kanji_progress (user_id, kanji_id, status, last_review_at, next_review_at) VALUES
                                                                                           (1, 41, 'MASTERED', '2025-10-10 09:00:00', '2025-10-15 09:00:00'),
                                                                                           (1, 58, 'MASTERED', '2025-10-10 09:00:00', '2025-10-15 09:00:00'),
                                                                                           (1, 6, 'LEARNING', '2025-10-11 19:00:00', '2025-10-12 19:00:00'),
                                                                                           (1, 19, 'MASTERED', '2025-10-11 19:00:00', '2025-10-12 19:00:00'),
                                                                                           (1, 33, 'LEARNING', '2025-10-11 19:00:00', '2025-10-12 19:00:00');