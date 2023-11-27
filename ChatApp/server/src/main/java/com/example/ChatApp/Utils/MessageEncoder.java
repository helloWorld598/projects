package com.example.ChatApp.Utils;

import jakarta.websocket.EncodeException;
import jakarta.websocket.Encoder;
import jakarta.websocket.EndpointConfig;

import com.example.ChatApp.Model.Message;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

public class MessageEncoder implements Encoder.Text<Message>{
    
    ObjectMapper objectMapper = new ObjectMapper();

    @Override
    // encodes the Message object into JSON
    // used by the Socket Controller between sending messages to clients
    public String encode(Message message) throws EncodeException {
        try {
            String jsonString = objectMapper.writeValueAsString(message);
            return jsonString;
        } 
        catch (JsonProcessingException e) {
            e.printStackTrace();
            return "";
        }
    }

    @Override
    public void init(EndpointConfig endpointConfig) { }

    @Override
    public void destroy() { }

}