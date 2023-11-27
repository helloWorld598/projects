package com.example.ChatApp.Repository;

import java.util.Optional;

import com.example.ChatApp.Model.User;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findUserByEmail(String email);
}