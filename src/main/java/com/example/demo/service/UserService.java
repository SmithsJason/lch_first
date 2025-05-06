package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    public User login(String account, String password) {
        logger.info("登录尝试: account={}, password={}", account, password);
        User user = userRepository.findByAccount(account);
        if (user != null) {
            logger.info("查询结果: account={}, storedPassword={}", user.getAccount(), user.getPassword());
            if (user.getPassword().equals(password)) {
                logger.info("密码匹配成功");
                return user;
            } else {
                logger.warn("密码不匹配: input={}, stored={}", password, user.getPassword());
            }
        } else {
            logger.warn("用户不存在: account={}", account);
        }
        return null;
    }

    public User register(User user) {
        logger.info("注册尝试: account={}", user.getAccount());

        // 检查账号是否已存在
        User existingUser = userRepository.findByAccount(user.getAccount());
        if (existingUser != null) {
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
        return userRepository.findByAccount(account) != null;
    }

    public User findByAccount(String account) {
        return userRepository.findByAccount(account);
    }

    public List<User> searchUsers(String query, String currentAccount) {
        return userRepository.searchUsers(query, currentAccount);
    }
}