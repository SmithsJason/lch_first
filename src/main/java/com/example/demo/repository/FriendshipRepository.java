// FriendshipRepository.java
package com.example.demo.repository;

import com.example.demo.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    // 查询某个用户的所有好友
    List<Friendship> findByUserAccount(String userAccount);

    // 检查是否存在某对好友关系
    boolean existsByUserAccountAndFriendAccount(String userAccount, String friendAccount);

    // 删除好友关系
    void deleteByUserAccountAndFriendAccount(String userAccount, String friendAccount);
}