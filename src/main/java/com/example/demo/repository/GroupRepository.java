package com.example.demo.repository;

import com.example.demo.entity.Group;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface GroupRepository extends CrudRepository<Group, Long> {
    @Query("SELECT g FROM Group g JOIN g.members m WHERE m.account = :account")
    List<Group> findByMemberAccount(String account);
}