package com.kanjimaster.backend.websocket;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RecognitionWebSocketHandler extends TextWebSocketHandler {
    @Value("${kanjimaster.ai-server-url}")
    @NonFinal
    private String aiServerUrl;

    static Logger logger = LoggerFactory.getLogger(RecognitionWebSocketHandler.class);

    WebSocketClient aiWebSocketClient = new StandardWebSocketClient();
    Map<WebSocketSession, WebSocketSession> feToAiSessionMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession feSession) throws Exception {
        logger.info("FE connected: {}", feSession.getId());

        try {
            WebSocketHandler aiServerHandler = new AiServerHandler(feSession, feToAiSessionMap);
            WebSocketSession aiSession = aiWebSocketClient.execute(aiServerHandler, aiServerUrl).get();

            feToAiSessionMap.put(feSession, aiSession);
            logger.info("AI Server connected for FE session: {}", feSession.getId());

        } catch (Exception e) {
            logger.error("Failed to connect to AI Server for FE session: {}", feSession.getId(), e);
            // Nếu không kết nối được AI, đóng kết nối FE
            feSession.close(CloseStatus.SERVER_ERROR.withReason("AI recognition service unavailable."));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession feSession, TextMessage message) throws IOException {
        String payload = message.getPayload();
        logger.debug("Message from FE {}: {}", feSession.getId(), payload);

        WebSocketSession aiSession = feToAiSessionMap.get(feSession);

        if (aiSession != null && aiSession.isOpen()) {
            aiSession.sendMessage(new TextMessage(payload));
            logger.debug("Forwarded message to AI Server for FE session: {}", feSession.getId());
        } else {
            logger.warn("No open AI session found for FE session: {}", feSession.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession feSession, CloseStatus status) throws Exception {
        logger.info("FE disconnected: {} with status: {}", feSession.getId(), status);

        WebSocketSession aiSession = feToAiSessionMap.remove(feSession);
        if (aiSession != null && aiSession.isOpen()) {
            aiSession.close(status);
            logger.info("Closed AI session due to FE disconnect: {}", feSession.getId());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession feSession, Throwable exception) throws Exception {
        logger.error("Transport error for FE session: " + feSession.getId(), exception);
        // Khi có lỗi, coi như kết nối đã đóng
        afterConnectionClosed(feSession, CloseStatus.SERVER_ERROR);
    }

    private static class AiServerHandler extends TextWebSocketHandler {
        private final WebSocketSession feSession;
        private final Map<WebSocketSession, WebSocketSession> sessionMap;

        private AiServerHandler(WebSocketSession feSession, Map<WebSocketSession, WebSocketSession> sessionMap) {
            this.feSession = feSession;
            this.sessionMap = sessionMap;
        }

        @Override
        protected void handleTextMessage(WebSocketSession aiSession, TextMessage message) throws Exception {
            String payload = message.getPayload();
            logger.debug("Message from AI Server for FE {}: {}", feSession.getId(), payload);

            if (feSession.isOpen()) {
                // Chuyển tiếp tin nhắn (kết quả dự đoán) về cho FE
                feSession.sendMessage(new TextMessage(payload));
            }
        }

        @Override
        public void afterConnectionClosed(WebSocketSession aiSession, CloseStatus status) throws Exception {
            logger.warn("AI Server disconnected for FE {}: {}", feSession.getId(), status);
            sessionMap.remove(feSession);

            if (feSession.isOpen()) {
                // Nếu AI Server ngắt kết nối, cũng đóng kết nối với FE
                feSession.close(status.getCode() == 1000 ? CloseStatus.NORMAL : CloseStatus.SERVER_ERROR);
            }
        }

        @Override
        public void handleTransportError(WebSocketSession aiSession, Throwable exception) throws Exception {
            logger.error("Transport error for AI session (FE: " + feSession.getId() + ")", exception);
            afterConnectionClosed(aiSession, CloseStatus.SERVER_ERROR);
        }
    }
}
