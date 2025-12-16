package com.kanjimaster.backend.config;

import com.kanjimaster.backend.websocket.BattleWebSocketHandler;
import com.kanjimaster.backend.websocket.NotificationWebSocketHandler;
import com.kanjimaster.backend.websocket.RecognitionWebSocketHandler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WebSocketConfig implements WebSocketConfigurer {
    RecognitionWebSocketHandler recognitionWebSocketHandler;
    BattleWebSocketHandler battleWebSocketHandler;
    NotificationWebSocketHandler notificationWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(recognitionWebSocketHandler, "/ws/recognize/")
                .setAllowedOriginPatterns("*");
        
        // Battle WebSocket endpoint
        registry.addHandler(battleWebSocketHandler, "/ws/battle")
                .setAllowedOriginPatterns("*");

        registry.addHandler(notificationWebSocketHandler, "/ws/notifications")
                .setAllowedOriginPatterns("*");
    }
}
