package com.example.chat.config;

import com.example.chat.websocket.ChatWebSocketHandler;
import com.example.chat.websocket.NotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final NotificationWebSocketHandler notificationWebSocketHandler;

    public WebSocketConfig(ChatWebSocketHandler chatWebSocketHandler, NotificationWebSocketHandler notificationWebSocketHandler) {
        this.chatWebSocketHandler = chatWebSocketHandler;
        this.notificationWebSocketHandler = notificationWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/chat")
                .setAllowedOriginPatterns("*");
        registry.addHandler(notificationWebSocketHandler, "/notifications")
                .setAllowedOriginPatterns("*");
    }
}