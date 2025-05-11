// Friendship.java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "friendship")
@Data
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_account", nullable = false)
    private String userAccount;

    @Column(name = "friend_account", nullable = false)
    private String friendAccount;

    @Column(name = "create_time", nullable = false)
    private LocalDateTime createTime;
}