package com.kanjimaster.backend.model.dto.battle;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.socket.WebSocketSession;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BattlePlayer {
    String userId;
    String userName;
    String email;
    WebSocketSession session;
    int score;
    boolean ready;

    public void addScore(int points) {
        this.score += points;
    }
}
