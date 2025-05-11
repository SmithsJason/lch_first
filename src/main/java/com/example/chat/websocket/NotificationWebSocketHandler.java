package com.example.chat.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String account = query != null && query.contains("=") ? query.split("=")[1] : null;
        if (account == null) {
            session.close(CloseStatus.BAD_DATA.withReason("缺少账号参数"));
            return;
        }
        sessions.put(account, session);
        System.out.println("通知 WebSocket 连接建立: account=" + account);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String account = sessions.entrySet().stream()
                .filter(entry -> entry.getValue().equals(session))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse("unknown");
        sessions.remove(account);
        System.out.println("通知 WebSocket 连接关闭: account=" + account);
    }

    public void sendNotification(String receiverAccount, Object message) throws Exception {
        WebSocketSession session = sessions.get(receiverAccount);
        if (session != null && session.isOpen()) {
            String jsonMessage = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(jsonMessage));
        }
    }
}