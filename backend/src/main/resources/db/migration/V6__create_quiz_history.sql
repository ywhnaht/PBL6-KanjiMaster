use KanjiMaster;

create table quiz_history (
                              id int primary key auto_increment,
                              user_id varchar(100),
                              level varchar(10),
                              score int default 0,
                              total_questions int,
                              quiz_type varchar(100),
                              completed_at timestamp,
                              foreign key (user_id) references users(id)
);

create table user_incorrect_questions (
                            id int primary key auto_increment,
                            user_id varchar(100) not null,
                            question_id int not null,
                            question_type VARCHAR(50) NOT NULL COMMENT 'KANJI_EXAMPLE or COMPOUND_WORD',
                            level VARCHAR(10) NOT NULL COMMENT 'N5, N4, etc.',
                            date_added DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),

                            foreign key (user_id) references users(id) on delete cascade
)