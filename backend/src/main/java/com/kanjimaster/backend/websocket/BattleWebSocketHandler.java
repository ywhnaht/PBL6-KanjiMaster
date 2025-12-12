package com.kanjimaster.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanjimaster.backend.model.dto.battle.*;
import com.kanjimaster.backend.model.enums.BattleMessageType;
import com.kanjimaster.backend.service.BattleService;
import com.kanjimaster.backend.service.BattleTokenService;
import com.kanjimaster.backend.service.JwtService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BattleWebSocketHandler extends TextWebSocketHandler {
    static Logger logger = LoggerFactory.getLogger(BattleWebSocketHandler.class);
    
    BattleService battleService;
    BattleTokenService battleTokenService;
    JwtService jwtService;
    ObjectMapper objectMapper;

    public BattleWebSocketHandler(@Lazy BattleService battleService,
                                  BattleTokenService battleTokenService,
                                  JwtService jwtService,
                                  ObjectMapper objectMapper) {
        this.battleService = battleService;
        this.battleTokenService = battleTokenService;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("Battle WebSocket connection established: {}", session.getId());
        
        // Extract token from query params
        String token = extractToken(session);
        if (token == null) {
            sendError(session, "Missing authentication token");
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }
        
        // Validate token (support both battle token and regular token)
        String userId;
        if (battleTokenService.isBattleToken(token)) {
            // Battle token
            userId = battleTokenService.extractUserId(token);
            if (userId == null || !battleTokenService.validateBattleToken(token, userId)) {
                sendError(session, "Invalid battle token");
                session.close(CloseStatus.NOT_ACCEPTABLE);
                return;
            }
        } else {
            // Regular access token
            if (!jwtService.validateToken(token)) {
                sendError(session, "Invalid authentication token");
                session.close(CloseStatus.NOT_ACCEPTABLE);
                return;
            }
            userId = jwtService.extractUserId(token);
        }
        
        // Store user info in session attributes
        session.getAttributes().put("userId", userId);
        session.getAttributes().put("token", token);
        
        logger.info("User {} authenticated for battle", userId);
        
        // Send confirmation
        sendMessage(session, BattleMessageType.QUEUE_JOINED, 
                Map.of("message", "Connected to battle server", "userId", userId));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        if (userId == null) {
            sendError(session, "Not authenticated");
            return;
        }

        try {
            BattleMessage battleMessage = objectMapper.readValue(message.getPayload(), BattleMessage.class);
            
            logger.debug("Received message from user {}: {}", userId, battleMessage.getType());
            
            switch (battleMessage.getType()) {
                case JOIN_QUEUE -> handleJoinQueue(session, userId, battleMessage);
                case LEAVE_QUEUE -> handleLeaveQueue(userId);
                case READY -> handleReady(userId);
                case ANSWER_QUESTION -> handleAnswer(userId, battleMessage);
                case REFRESH_TOKEN -> handleTokenRefresh(session, battleMessage);
                default -> sendError(session, "Unknown message type: " + battleMessage.getType());
            }
        } catch (Exception e) {
            logger.error("Error handling message from user {}: {}", userId, e.getMessage(), e);
            sendError(session, "Invalid message format");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            battleService.handleDisconnect(userId);
            logger.info("Battle WebSocket disconnected: {} (user: {}, status: {})", 
                    session.getId(), userId, status);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("Transport error for session: {}", session.getId(), exception);
        afterConnectionClosed(session, CloseStatus.SERVER_ERROR);
    }

    // Message Handlers

    /**
     * Handle JOIN_QUEUE message
     */
    private void handleJoinQueue(WebSocketSession session, String userId, BattleMessage message) {
        try {
            JoinQueueRequest request = objectMapper.convertValue(message.getPayload(), JoinQueueRequest.class);
            
            if (request.getLevel() == null || request.getLevel().isEmpty()) {
                sendError(session, "Level is required");
                return;
            }
            
            battleService.joinQueue(userId, request.getLevel(), session);
            
            logger.info("User {} joined queue for level {}", userId, request.getLevel());
            
        } catch (Exception e) {
            logger.error("Error joining queue for user {}: {}", userId, e.getMessage());
            sendError(session, "Failed to join queue");
        }
    }

    /**
     * Handle LEAVE_QUEUE message
     */
    private void handleLeaveQueue(String userId) {
        try {
            battleService.leaveQueue(userId);
            logger.info("User {} left queue", userId);
        } catch (Exception e) {
            logger.error("Error leaving queue for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Handle READY message
     */
    private void handleReady(String userId) {
        try {
            battleService.playerReady(userId);
            logger.info("User {} is ready", userId);
        } catch (Exception e) {
            logger.error("Error setting ready for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Handle ANSWER_QUESTION message
     */
    private void handleAnswer(String userId, BattleMessage message) {
        try {
            AnswerRequest request = objectMapper.convertValue(message.getPayload(), AnswerRequest.class);
            
            if (request.getAnswerTime() < 0) {
                logger.warn("Invalid answer time from user {}: {}", userId, request.getAnswerTime());
                request.setAnswerTime(10000); // Default to max time
            }
            
            battleService.handleAnswer(userId, request);
            
        } catch (Exception e) {
            logger.error("Error handling answer for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Handle REFRESH_TOKEN message
     */
    private void handleTokenRefresh(WebSocketSession session, BattleMessage message) {
        try {
            String newToken = objectMapper.convertValue(message.getPayload(), String.class);
            
            if (newToken == null || newToken.isEmpty()) {
                sendError(session, "Token is required");
                return;
            }
            
            // Validate new token
            String userId;
            if (battleTokenService.isBattleToken(newToken)) {
                userId = battleTokenService.extractUserId(newToken);
                if (userId == null || !battleTokenService.validateBattleToken(newToken, userId)) {
                    sendError(session, "Invalid battle token");
                    return;
                }
            } else {
                if (!jwtService.validateToken(newToken)) {
                    sendError(session, "Invalid token");
                    return;
                }
                userId = jwtService.extractUserId(newToken);
            }
            
            // Update session attributes
            String currentUserId = (String) session.getAttributes().get("userId");
            if (!userId.equals(currentUserId)) {
                sendError(session, "Token user mismatch");
                return;
            }
            
            session.getAttributes().put("token", newToken);
            session.getAttributes().put("tokenRefreshedAt", System.currentTimeMillis());
            
            logger.info("Token refreshed for user: {}", userId);
            
            // Send confirmation
            sendMessage(session, BattleMessageType.TOKEN_REFRESHED, 
                    Map.of("success", true, "message", "Token refreshed successfully"));
            
        } catch (Exception e) {
            logger.error("Error refreshing token: {}", e.getMessage());
            sendError(session, "Failed to refresh token");
        }
    }

    // Utility Methods

    /**
     * Extract token from WebSocket URI query parameters
     */
    private String extractToken(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            return UriComponentsBuilder.fromUriString("?" + query)
                    .build()
                    .getQueryParams()
                    .getFirst("token");
        }
        return null;
    }

    /**
     * Send a message to a WebSocket session
     */
    public void sendMessage(WebSocketSession session, BattleMessageType type, Object payload) {
        if (session == null || !session.isOpen()) {
            logger.warn("Attempted to send message to closed session");
            return;
        }
        
        try {
            BattleMessage message = BattleMessage.builder()
                    .type(type)
                    .payload(payload)
                    .build();
            
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
            
            logger.debug("Sent message type {} to session {}", type, session.getId());
            
        } catch (IOException e) {
            logger.error("Error sending message to session {}: {}", session.getId(), e.getMessage());
        }
    }

    /**
     * Send an error message to a session
     */
    private void sendError(WebSocketSession session, String errorMessage) {
        logger.warn("Sending error to session {}: {}", session.getId(), errorMessage);
        sendMessage(session, BattleMessageType.ERROR, 
                Map.of("error", errorMessage, "timestamp", System.currentTimeMillis()));
    }
}

