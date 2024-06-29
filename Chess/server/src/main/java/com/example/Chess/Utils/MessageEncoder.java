package com.example.Chess.Utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.websocket.EncodeException;
import jakarta.websocket.Encoder;
import jakarta.websocket.EndpointConfig;

import com.example.Chess.Model.Message;

public class MessageEncoder implements Encoder.Text<Message> {
    ObjectMapper objectMapper = new ObjectMapper();

    /**
     * encodes the Message object into JSON.
     * used by the Socket Controller between sending messages to clients.
     */
    @Override
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