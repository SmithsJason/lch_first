package com.example.demo.controller;

import com.example.demo.dto.Response;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Data
class UserDTO {
    private String account;
    private String username;
    private String avatar;

    public UserDTO(User user) {
        this.account = user.getAccount();
        this.username = user.getUsername();
        this.avatar = user.getAvatar();
    }
}

@Data
class UpdateUserRequest {
    private String account;
    private String username;
    private String newPassword; // 可选
}

@Data
class PasswordCheckRequest {
    private String account;
    private String oldPassword;
}

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/info")
    public ResponseEntity<UserDTO> getUserInfo(@RequestParam("account") String account) {
        User user = userService.findByAccount(account);
        if (user != null) {
            UserDTO userDTO = new UserDTO(user);
            return ResponseEntity.ok(userDTO);
        } else {
            return ResponseEntity.status(404).body(null);
        }
    }

    @PostMapping("/check-password")
    public ResponseEntity<Response<Object>> checkPassword(@RequestBody PasswordCheckRequest request) {
        boolean isValid = userService.checkPassword(request.getAccount(), request.getOldPassword());
        if (isValid) {
            return ResponseEntity.ok(new Response<>(200, "旧密码验证成功"));
        } else {
            return ResponseEntity.ok(new Response<>(400, "旧密码输入错误"));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Response<Object>> updateUser(@RequestBody UpdateUserRequest request) {
        try {
            boolean updated = userService.updateUser(
                    request.getAccount(),
                    request.getUsername(),
                    request.getNewPassword()
            );
            if (updated) {
                return ResponseEntity.ok(new Response<>(200, "信息更新成功"));
            } else {
                return ResponseEntity.ok(new Response<>(404, "用户不存在"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Response<>(500, "更新失败: " + e.getMessage()));
        }
    }
}