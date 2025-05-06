package com.example.demo.controller;

import com.example.demo.entity.FriendRequest;
import com.example.demo.entity.User;
import com.example.demo.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @GetMapping("/users/search")
    public List<User> searchUsers(@RequestParam String query, @RequestParam String currentAccount) {
        return friendService.searchUsers(query, currentAccount);
    }

    @PostMapping("/friend-requests/send")
    public ResponseEntity<Map<String, Object>> sendFriendRequest(@RequestBody Map<String, String> request) throws Exception {
        String senderAccount = request.get("senderAccount");
        String receiverAccount = request.get("receiverAccount");
        String message = request.get("message");
        FriendRequest friendRequest = friendService.sendFriendRequest(senderAccount, receiverAccount, message);
        return ResponseEntity.ok(Map.of("success", true, "message", "申请已发送", "requestId", friendRequest.getId()));
    }

    @GetMapping("/notifications")
    public List<FriendRequest> getNotifications(@RequestParam String account) {
        return friendService.getNotifications(account);
    }

    @PostMapping("/friend-requests/{id}/{action}")
    public ResponseEntity<Map<String, Object>> handleFriendRequest(
            @PathVariable Long id,
            @PathVariable String action,
            @RequestBody Map<String, String> body) {
        String account = body.get("account");
        FriendRequest request = friendService.handleFriendRequest(id, action, account);
        return ResponseEntity.ok(Map.of("success", true, "message", "已" + (action.equals("accepted") ? "接受" : "拒绝")));
    }

    @PostMapping("/notifications/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllRead(@RequestBody Map<String, String> body) {
        String account = body.get("account");
        friendService.markAllRead(account);
        return ResponseEntity.ok(Map.of("success", true, "message", "已标记全部已读"));
    }
    @GetMapping("/friends")
    public List<User> getFriends(@RequestParam String account) {
        return friendService.getFriends(account);
    }

    // 新增：删除好友（可选）
    @DeleteMapping("/friends/remove")
    public ResponseEntity<Map<String, Object>> removeFriend(
            @RequestParam String userAccount,
            @RequestParam String friendAccount) {
        friendService.removeFriend(userAccount, friendAccount);
        return ResponseEntity.ok(Map.of("success", true, "message", "好友已移除"));
    }
}