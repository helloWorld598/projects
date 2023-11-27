package com.example.ChatApp;

import jakarta.websocket.EncodeException;
import jakarta.websocket.OnMessage;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.HashMap;

import org.springframework.stereotype.Component;

import com.example.ChatApp.Model.Message;
import com.example.ChatApp.Utils.MessageDecoder;
import com.example.ChatApp.Utils.MessageEncoder;

@Component
@ServerEndpoint(value = "/websocket", decoders = MessageDecoder.class, encoders = MessageEncoder.class )
public class SocketEndpoint {

    private static HashMap<String, Session> chatUsers = new HashMap<String, Session>();

    @OnMessage
    public void onMessage(Session session, Message message) throws IOException {
        // Logic to handle different types of messages
        // INIT message is the first message sent when user connects to chat room
        if (message.getType().equals("INIT")) {
            chatUsers.put(message.getFrom(), session);

            String users = "";
            for (String user: chatUsers.keySet()) {
                users = users.concat(user).concat(" ");
            }

            // Create a server message to broadcast the list of connected users to all clients
            // This provides users with an updated list of who is in the chat room allowing users
            // to send messages to a specific individual
            Message serverMessage = new Message("server", "all", users, "", "SERVER_MSG");
            broadcast(serverMessage);
        }
        
        else {
            // for messages meant to be sent to everyone in the chat room
            // broadcast it
            if (message.getTo().equals("all")) {
                broadcast(message);
            }
            
            else {
                // obtain the individual user in the message and send it to just that person
                try {
                    chatUsers.get(message.getTo()).getBasicRemote().sendObject(message);
                }
                
                catch (IOException | EncodeException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // Method to broadcast a message to all connected users
    public static void broadcast(Message message) {
        for (Session session: chatUsers.values()) {
            try {
                session.getBasicRemote().sendObject(message);
            }

            catch (IOException | EncodeException e) {
                e.printStackTrace();
            }
        }
    }

}