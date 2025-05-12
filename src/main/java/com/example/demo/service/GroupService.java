package com.example.demo.service;

import com.example.demo.entity.Group;
import com.example.demo.entity.User;
import com.example.demo.repository.GroupRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional

    public Group createGroup(String name, String creatorAccount, List<String> memberAccounts) {
        // 1. 参数校验
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("群组名称不能为空");
        }
        if (creatorAccount == null || creatorAccount.trim().isEmpty()) {
            throw new IllegalArgumentException("创建者账号不能为空");
        }
        if (memberAccounts == null || memberAccounts.isEmpty()) {
            throw new IllegalArgumentException("至少需要一个成员");
        }

        // 2. 查找创建者
        User creator = userRepository.findByAccount(creatorAccount)
                .orElseThrow(() -> new IllegalArgumentException("创建者不存在: " + creatorAccount));

        // 3. 查找所有成员（包含创建者）
        Set<User> members = memberAccounts.stream()
                .map(account -> userRepository.findByAccount(account)
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + account)))
                .collect(Collectors.toSet());
        members.add(creator); // 确保创建者在成员列表里

        // 4. 创建群组并保存
        Group group = new Group();
        group.setName(name);
        group.setCreator(creator);
        group.setMembers(members);

        return groupRepository.save(group);
    }

    public List<Group> getGroupsByUserAccount(String account) {
        if (account == null || account.trim().isEmpty()) {
            throw new IllegalArgumentException("Account cannot be empty");
        }
        return groupRepository.findByMemberAccount(account);
    }
    public Group getGroupById(Long id) {
        Optional<Group> group = groupRepository.findById(id);
        if (!group.isPresent()) {
            throw new IllegalArgumentException("群组不存在，ID: " + id);
        }
        return group.get();
    }
}