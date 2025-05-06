package com.example.chat.websocket;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final UserService userService;
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    public ChatWebSocketHandler(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String account = query != null && query.contains("=") ? query.split("=")[1] : null;
        System.out.println("连接建立尝试: account=" + account);

        if (account == null) {
            System.out.println("缺少账号参数");
            session.close(CloseStatus.BAD_DATA.withReason("缺少账号参数"));
            return;
        }

        User user = userService.findByAccount(account);
        if (user != null) {
            session.getAttributes().put("account", account);
            sessions.put(account, session);
            broadcast("用户 " + user.getUsername() + " 已加入聊天", session);
            broadcastOnlineUsers(); // 广播在线用户更新
            System.out.println("连接建立成功: account=" + account + ", username=" + user.getUsername());
        } else {
            System.out.println("无效用户: account=" + account);
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("无效用户"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String account = getAccountBySession(session);
        User user = userService.findByAccount(account);
        String payload = message.getPayload();

        if (user != null) {
            broadcast(user.getUsername() + ": " + payload, session);
        } else {
            System.out.println("消息发送失败，用户未找到: account=" + account);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String account = getAccountBySession(session);
        User user = userService.findByAccount(account);

        if (sessions.containsValue(session)) {
            sessions.remove(account);
            if (user != null) {
                broadcast("用户 " + user.getUsername() + " 已离开聊天", session);
                broadcastOnlineUsers(); // 广播在线用户更新
                System.out.println("连接关闭: account=" + account + ", username=" + user.getUsername() + ", 状态: " + status);
            } else {
                System.out.println("连接关闭，但用户未找到: account=" + account);
            }
        } else {
            System.out.println("未找到会话: account=" + account);
        }
    }

    private void broadcast(String message, WebSocketSession excludeSession) throws IOException {
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen() && !session.equals(excludeSession)) {
                session.sendMessage(new TextMessage(message));
            }
        }
    }

    // 广播在线用户列表和人数
    private void broadcastOnlineUsers() throws IOException {
        String onlineUsers = sessions.keySet().stream()
                .map(account -> userService.findByAccount(account).getUsername())
                .collect(Collectors.joining(","));
        String message = "ONLINE_USERS:" + sessions.size() + ":" + onlineUsers;
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(message));
            }
        }
    }

    private String getAccountBySession(WebSocketSession session) {
        return (String) session.getAttributes().getOrDefault("account", "未知账号");
    }
}