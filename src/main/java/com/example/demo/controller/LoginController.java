package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User loginUser) {
        Map<String, Object> response = new HashMap<>();
        User user = userService.login(loginUser.getAccount(), loginUser.getPassword());

        if (user != null) {
            String token = jwtUtil.generateToken(user.getAccount());
            response.put("success", true);
            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("username", user.getUsername());
            data.put("avatar", user.getAvatar());
            data.put("code", 200);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "账号或密码错误");
            return ResponseEntity.status(401).body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User newUser) {
        Map<String, Object> response = new HashMap<>();

        if (userService.isAccountExists(newUser.getAccount())) {
            response.put("success", false);
            response.put("message", "账号已存在");
            return ResponseEntity.status(400).body(response);
        }

        User registeredUser = userService.register(newUser);
        if (registeredUser != null) {
            String token = jwtUtil.generateToken(registeredUser.getAccount());
            response.put("success", true);
            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("username", registeredUser.getUsername());
            data.put("avatar", registeredUser.getAvatar());
            data.put("code", 201);
            response.put("data", data);
            return ResponseEntity.status(201).body(response);
        } else {
            response.put("success", false);
            response.put("message", "注册失败");
            return ResponseEntity.status(500).body(response);
        }
    }
}