package com.example.ChatApp.Model;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import jakarta.websocket.Session;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.mongodb.lang.NonNull;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Document
@Data
public class User implements UserDetails {
    @Id
    private String id;

    @Indexed(unique = true)
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @NonNull
    @Size(min = 6)
    private String password;

    @Indexed(unique = true)
    @NotBlank
    @NonNull
    private String phoneString;

    @NotBlank
    private String name;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Session session;
    private LocalDateTime created;

    public User(String email, String password, String phoneString, String name) {
        this.email = email;
        this.password = password;
        this.phoneString = phoneString;
        this.name = name;
        this.created = LocalDateTime.now();
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}