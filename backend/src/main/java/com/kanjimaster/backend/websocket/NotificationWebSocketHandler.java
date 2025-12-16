package com.kanjimaster.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanjimaster.backend.model.dto.notification.NotificationDTO;
import com.kanjimaster.backend.model.dto.notification.NotificationWebSocketMessage;
import com.kanjimaster.backend.service.JwtService;
import com.kanjimaster.backend.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    static Logger logger = LoggerFactory.getLogger(NotificationWebSocketHandler.class);

    JwtService jwtService;
    NotificationService notificationService;
    ObjectMapper objectMapper;

    // Map userId -> WebSocketSession
    Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("📡 Notification WebSocket connection established: {}", session.getId());

        // Extract và validate token
        String token = extractToken(session);
        if (token == null) {
            logger.error("❌ No token provided");
            sendError(session, "Missing authentication token");
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        if (!jwtService.validateToken(token)) {
            logger.error("❌ Invalid token");
            sendError(session, "Invalid authentication token");
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        String userId = jwtService.extractUserId(token);
        if (userId == null || userId.isEmpty()) {
            logger.error("❌ Could not extract userId from token");
            sendError(session, "Invalid token - no user ID");
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        // Đóng session cũ nếu user đã có session
        WebSocketSession oldSession = userSessions.get(userId);
        if (oldSession != null && oldSession.isOpen()) {
            logger.info("⚠️ Closing old session for user {}", userId);
            try {
                oldSession.close(CloseStatus.NORMAL.withReason("New session established"));
            } catch (Exception e) {
                logger.warn("Failed to close old session", e);
            }
        }

        session.getAttributes().put("userId", userId);
        userSessions.put(userId, session);

        logger.info("✅ User {} connected to notification WebSocket", userId);

        // Gửi các thông báo chưa đọc
        sendUnreadNotifications(session, userId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        if (userId == null) {
            logger.warn("⚠️ No userId in session attributes");
            return;
        }

        try {
            NotificationWebSocketMessage wsMessage = objectMapper.readValue(
                    message.getPayload(), NotificationWebSocketMessage.class);

            logger.info("📨 Received message type: {} from user: {}", wsMessage.getType(), userId);

            switch (wsMessage.getType()) {
                case "MARK_READ":
                    handleMarkRead(userId, wsMessage.getPayload());
                    break;
                case "MARK_ALL_READ":
                    handleMarkAllRead(userId);
                    break;
                case "DELETE":
                    handleDelete(userId, wsMessage.getPayload());
                    break;
                case "GET_UNREAD_COUNT":
                    handleGetUnreadCount(session, userId);
                    break;
                default:
                    logger.warn("Unknown message type: {}", wsMessage.getType());
            }
        } catch (Exception e) {
            logger.error("Error handling WebSocket message", e);
            sendError(session, "Error processing message: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            // Only remove if this session is still the active one
            // This prevents race condition where old session's close callback
            // removes a newly established session
            boolean removed = userSessions.remove(userId, session);
            if (removed) {
                logger.info("🔌 User {} disconnected from notification WebSocket (status: {})", userId, status);
            } else {
                logger.debug("🔌 Old session for user {} closed, but new session already active", userId);
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        logger.error("❌ Transport error for session: {}", session.getId(), exception);
        try {
            session.close(CloseStatus.SERVER_ERROR);
        } catch (IOException e) {
            logger.error("Error closing session", e);
        }
    }

    // Utility Methods

    private String extractToken(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            String token = UriComponentsBuilder.fromUriString("?" + query)
                    .build()
                    .getQueryParams()
                    .getFirst("token");
            logger.debug("Extracted token: {}", token != null ? "present" : "null");
            return token;
        }
        return null;
    }

    private void sendUnreadNotifications(WebSocketSession session, String userId) {
        try {
            logger.info("📬 Fetching notifications for user: {}", userId);

            // Get ALL notifications (not just unread) so they don't disappear when marked as read
            List<NotificationDTO> notifications = notificationService.getAllNotifications(userId);
            Long unreadCount = notificationService.getUnreadCount(userId);

            logger.info("📊 Found {} total notifications ({} unread) for user {}", 
                    notifications.size(), unreadCount, userId);

            NotificationWebSocketMessage message = NotificationWebSocketMessage.builder()
                    .type("INITIAL_NOTIFICATIONS")
                    .payload(Map.of(
                            "notifications", notifications,
                            "unreadCount", unreadCount
                    ))
                    .build();

            sendMessage(session, message);
            logger.info("✅ Sent initial notifications to user {}", userId);
        } catch (Exception e) {
            logger.error("❌ Error sending unread notifications to user {}", userId, e);
        }
    }

    private void handleMarkRead(String userId, Object payload) {
        try {
            Integer notificationId = objectMapper.convertValue(payload, Integer.class);
            notificationService.markAsRead(userId, notificationId);
            
            // Send updated unread count
            Long unreadCount = notificationService.getUnreadCount(userId);
            NotificationWebSocketMessage message = NotificationWebSocketMessage.builder()
                    .type("UNREAD_COUNT")
                    .payload(Map.of("count", unreadCount))
                    .build();
            
            WebSocketSession session = userSessions.get(userId);
            if (session != null && session.isOpen()) {
                sendMessage(session, message);
            }
            
            logger.info("✓ Marked notification {} as read for user {}, new count: {}", notificationId, userId, unreadCount);
        } catch (Exception e) {
            logger.error("❌ Error marking notification as read", e);
        }
    }

    private void handleMarkAllRead(String userId) {
        try {
            notificationService.markAllAsRead(userId);
            
            // Send updated unread count (should be 0)
            NotificationWebSocketMessage message = NotificationWebSocketMessage.builder()
                    .type("UNREAD_COUNT")
                    .payload(Map.of("count", 0L))
                    .build();
            
            WebSocketSession session = userSessions.get(userId);
            if (session != null && session.isOpen()) {
                sendMessage(session, message);
            }
            
            logger.info("✓ Marked all notifications as read for user {}", userId);
        } catch (Exception e) {
            logger.error("❌ Error marking all notifications as read", e);
        }
    }

    private void handleDelete(String userId, Object payload) {
        try {
            Integer notificationId = objectMapper.convertValue(payload, Integer.class);
            notificationService.deleteNotification(userId, notificationId);
            
            // Send updated unread count
            Long unreadCount = notificationService.getUnreadCount(userId);
            NotificationWebSocketMessage message = NotificationWebSocketMessage.builder()
                    .type("UNREAD_COUNT")
                    .payload(Map.of("count", unreadCount))
                    .build();
            
            WebSocketSession session = userSessions.get(userId);
            if (session != null && session.isOpen()) {
                sendMessage(session, message);
            }
            
            logger.info("🗑️ Deleted notification {} for user {}, new count: {}", notificationId, userId, unreadCount);
        } catch (Exception e) {
            logger.error("❌ Error deleting notification", e);
        }
    }

    private void handleGetUnreadCount(WebSocketSession session, String userId) {
        try {
            Long count = notificationService.getUnreadCount(userId);
            NotificationWebSocketMessage message = NotificationWebSocketMessage.builder()
                    .type("UNREAD_COUNT")
                    .payload(Map.of("count", count))
                    .build();
            sendMessage(session, message);
            logger.info("📊 Sent unread count {} to user {}", count, userId);
        } catch (Exception e) {
            logger.error("❌ Error getting unread count", e);
        }
    }

    /**
     * Gửi thông báo mới đến user cụ thể
     */
    public void sendNotificationToUser(String userId, NotificationDTO notification) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            NotificationWebSocketMessage message = NotificationWebSocketMessage.builder()
                    .type("NEW_NOTIFICATION")
                    .payload(notification)
                    .build();
            sendMessage(session, message);
            logger.info("🔔 Sent new notification to user {}: {}", userId, notification.getTitle());
        } else {
            logger.warn("⚠️ No active session for user {} to send notification", userId);
        }
    }

    private void sendMessage(WebSocketSession session, NotificationWebSocketMessage message) {
        if (session == null || !session.isOpen()) {
            logger.warn("⚠️ Cannot send message - session is null or closed");
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
            logger.debug("📤 Sent message type: {}", message.getType());
        } catch (IOException e) {
            logger.error("❌ Error sending message to session {}", session.getId(), e);
        }
    }

    private void sendError(WebSocketSession session, String error) {
        NotificationWebSocketMessage message = NotificationWebSocketMessage.builder()
                .type("ERROR")
                .payload(Map.of("error", error))
                .build();
        sendMessage(session, message);
    }
}