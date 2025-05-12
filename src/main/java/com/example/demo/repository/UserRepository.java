package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional; // 关键修复：使用正确的 Optional

public interface UserRepository extends JpaRepository<User, Long> {
    // 返回类型是 java.util.Optional
    Optional<User> findByAccount(String account);

    @Query("SELECT u FROM User u WHERE (u.username LIKE %:query% OR u.account LIKE %:query%) AND u.account != :currentAccount")
    List<User> searchUsers(String query, String currentAccount);
}