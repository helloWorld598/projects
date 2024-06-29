package com.example.Chess.Utils;

import jakarta.websocket.DecodeException;
import jakarta.websocket.Decoder;
import jakarta.websocket.EndpointConfig;

import com.example.Chess.Model.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

public class MessageDecoder implements Decoder.Text<Message> {
   ObjectMapper objectMapper = new ObjectMapper();

    /**
     * decodes a JSON which is converted into a Message object.
     * used by the Socket Controller between processing messages by the server.
     */
    @Override
    public Message decode(String string) throws DecodeException {
        try {
            Message message = objectMapper.readValue(string, Message.class);
            return message;
        } 
        catch (JsonProcessingException e) {
            e.printStackTrace();
            return new Message();
        }
    }

    @Override
    public boolean willDecode(String string) {
        return (string != null);
    }

    @Override
    public void init(EndpointConfig endpointConfig) { }

    @Override
    public void destroy() { } 
}