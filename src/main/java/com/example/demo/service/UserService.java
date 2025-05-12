package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    public User login(String account, String password) {
        logger.info("登录尝试: account={}", account);
        Optional<User> userOptional = userRepository.findByAccount(account);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            logger.info("查询结果: account={}", user.getAccount());
            if (user.getPassword().equals(password)) {
                logger.info("密码匹配成功");
                return user;
            } else {
                logger.warn("密码不匹配");
                return null;
            }
        } else {
            logger.warn("用户不存在: account={}", account);
            return null;
        }
    }

    public User register(User user) {
        logger.info("注册尝试: account={}", user.getAccount());
        Optional<User> existingUser = userRepository.findByAccount(user.getAccount());
        if (existingUser.isPresent()) {
            logger.warn("注册失败: 账号已存在 account={}", user.getAccount());
            return null;
        }
        try {
            User savedUser = userRepository.save(user);
            logger.info("注册成功: account={}", savedUser.getAccount());
            return savedUser;
        } catch (Exception e) {
            logger.error("注册失败: account={}, error={}", user.getAccount(), e.getMessage());
            return null;
        }
    }

    public boolean isAccountExists(String account) {
        return userRepository.findByAccount(account).isPresent();
    }

    public User findByAccount(String account) {
        return userRepository.findByAccount(account).orElse(null);
    }

    public List<User> searchUsers(String query, String currentAccount) {
        return userRepository.searchUsers(query, currentAccount);
    }

    public boolean checkPassword(String account, String oldPassword) {
        logger.info("验证旧密码: account={}", account);
        Optional<User> userOptional = userRepository.findByAccount(account);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean isValid = user.getPassword().equals(oldPassword);
            if (isValid) {
                logger.info("旧密码验证成功: account={}", account);
            } else {
                logger.warn("旧密码验证失败: account={}", account);
            }
            return isValid;
        }
        logger.warn("用户不存在: account={}", account);
        return false;
    }

    public boolean updateUser(String account, String username, String newPassword) {
        logger.info("更新用户信息: account={}", account);
        Optional<User> userOptional = userRepository.findByAccount(account);
        if (!userOptional.isPresent()) {
            logger.warn("用户不存在: account={}", account);
            return false;
        }

        User user = userOptional.get();

        if (username != null && !username.trim().isEmpty()) {
            user.setUsername(username);
            logger.info("更新用户名: account={}, newUsername={}", account, username);
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPassword(newPassword);
            logger.info("更新密码: account={}", account);
        }

        try {
            userRepository.save(user);
            logger.info("用户信息更新成功: account={}", account);
            return true;
        } catch (Exception e) {
            logger.error("更新用户信息失败: account={}, error={}", account, e.getMessage());
            throw new RuntimeException("数据库更新失败");
        }
    }
}
