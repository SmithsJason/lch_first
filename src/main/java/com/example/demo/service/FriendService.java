package com.example.demo.service;
import com.example.demo.entity.FriendRequest;
import com.example.demo.entity.Friendship;
import com.example.demo.entity.User;
import com.example.demo.repository.FriendRequestRepository;
import com.example.demo.repository.FriendshipRepository;
import com.example.chat.websocket.NotificationWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FriendService {

    @Autowired
    private UserService userService;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private NotificationWebSocketHandler notificationWebSocketHandler;

    public List<User> searchUsers(String query, String currentAccount) {
        return userService.searchUsers(query, currentAccount);
    }

    public FriendRequest sendFriendRequest(String senderAccount, String receiverAccount, String message) throws Exception {
        User sender = userService.findByAccount(senderAccount);
        if (sender == null) {
            throw new RuntimeException("发送者不存在");
        }
        User receiver = userService.findByAccount(receiverAccount);
        if (receiver == null) {
            throw new RuntimeException("接收者不存在");
        }

        FriendRequest request = new FriendRequest();
        request.setSenderAccount(senderAccount);
        request.setReceiverAccount(receiverAccount);
        request.setMessage(message);
        request.setStatus("pending");
        request.setCreateTime(LocalDateTime.now());
        request.setSenderAvatar(sender.getAvatar());
        request.setSenderUsername(sender.getUsername());
        friendRequestRepository.save(request);

        // WebSocket 通知
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "friend_request");
        notification.put("receiver", receiverAccount);
        notification.put("sender", Map.of(
                "account", sender.getAccount(),
                "username", sender.getUsername(),
                "avatar", sender.getAvatar() != null ? sender.getAvatar() : ""
        ));
        notification.put("message", message);
        notificationWebSocketHandler.sendNotification(receiverAccount, notification);

        return request;
    }

    public List<FriendRequest> getNotifications(String receiverAccount) {
        List<FriendRequest> requests = friendRequestRepository.findByReceiverAccount(receiverAccount);
        // 确保每个请求的 senderAvatar 已正确设置
        return requests.stream().map(request -> {
            if (request.getSenderAvatar() == null) {
                User sender = userService.findByAccount(request.getSenderAccount());
                if (sender != null) {
                    request.setSenderAvatar(sender.getAvatar() != null ? sender.getAvatar() : "");
                }
            }
            return request;
        }).collect(Collectors.toList());
    }
    @Transactional
    public FriendRequest handleFriendRequest(Long id, String action, String account) {
        FriendRequest request = friendRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("请求不存在"));
        if (!request.getReceiverAccount().equals(account)) {
            throw new RuntimeException("无权操作此请求");
        }
        request.setStatus(action.equals("accepted") ? "accepted" : "rejected");

        // 如果接受好友请求，添加到 friendship 表
        if ("accepted".equals(action)) {
            // 检查是否已存在好友关系，避免重复添加
            if (!friendshipRepository.existsByUserAccountAndFriendAccount(request.getReceiverAccount(), request.getSenderAccount())) {
                Friendship friendship1 = new Friendship();
                friendship1.setUserAccount(request.getReceiverAccount());
                friendship1.setFriendAccount(request.getSenderAccount());
                friendship1.setCreateTime(LocalDateTime.now());
                Friendship friendship2 = new Friendship();
                friendship2.setUserAccount(request.getSenderAccount());
                friendship2.setFriendAccount(request.getReceiverAccount());
                friendship2.setCreateTime(LocalDateTime.now());

                friendshipRepository.save(friendship1);
                friendshipRepository.save(friendship2);
                friendshipRepository.flush();
            }
        }
    // 保存状态更新
        friendRequestRepository.save(request);

        // 确保返回的请求包含 senderAvatar
        if (request.getSenderAvatar() == null) {
            User sender = userService.findByAccount(request.getSenderAccount());
            if (sender != null) {
                request.setSenderAvatar(sender.getAvatar() != null ? sender.getAvatar() : "");
            }
        }


        return request;
    }

    public void markAllRead(String account) {
        List<FriendRequest> requests = friendRequestRepository.findByReceiverAccount(account);
        requests.forEach(request -> {
            if ("pending".equals(request.getStatus())) {
                request.setStatus("read");
                // 确保 senderAvatar 已设置
                if (request.getSenderAvatar() == null) {
                    User sender = userService.findByAccount(request.getSenderAccount());
                    if (sender != null) {
                        request.setSenderAvatar(sender.getAvatar() != null ? sender.getAvatar() : "");
                    }
                }
                friendRequestRepository.save(request);
            }
        });
    }

    public List<User> getFriends(String account) {
        List<Friendship> friendships = friendshipRepository.findByUserAccount(account);
        List<String> friendAccounts = friendships.stream()
                .map(Friendship::getFriendAccount)
                .collect(Collectors.toList());
        return friendAccounts.stream()
                .map(userService::findByAccount)
                .filter(user -> user != null)
                .collect(Collectors.toList());
    }
    @Transactional
    public void removeFriend(String userAccount, String friendAccount) {
        if (!friendshipRepository.existsByUserAccountAndFriendAccount(userAccount, friendAccount)) {
            throw new RuntimeException("好友关系不存在");
        }
        friendshipRepository.deleteByUserAccountAndFriendAccount(userAccount, friendAccount);
        friendshipRepository.deleteByUserAccountAndFriendAccount(friendAccount, userAccount);
    }
}