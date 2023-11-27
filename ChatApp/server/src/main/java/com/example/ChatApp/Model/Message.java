package com.example.ChatApp.Model;

import lombok.Data;

@Data
public class Message {
    private String to, content, name, from, type;

    public Message() { }

    public Message(String from, String to, String content, String name, String type) {
        this.from = from;
        this.to = to;
        this.content = content;
        this.name = name;
        this.type = type;
    }
}