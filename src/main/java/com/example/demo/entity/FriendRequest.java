package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "friend_request")
@Data
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_account", nullable = false)
    private String senderAccount;

    @Column(name = "receiver_account", nullable = false)
    private String receiverAccount;

    @Column(nullable = true) // 附言可以为空
    private String message;

    @Column(nullable = false)
    private String status;

    @Column(name = "create_time", nullable = false)
    private LocalDateTime createTime;

    @Column(name = "sender_avatar", nullable = true)
    private String senderAvatar;

    @Column(name = "sender_username", nullable = true)
    private String senderUsername;
}