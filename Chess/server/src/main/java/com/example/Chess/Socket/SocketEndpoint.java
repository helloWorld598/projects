package com.example.Chess.Socket;

import jakarta.websocket.EncodeException;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.Chess.Game.ChessBoard.Board;
import com.example.Chess.Game.ChessBoard.GameState;
import com.example.Chess.Model.Message;
import com.example.Chess.Model.MessageType;
import com.example.Chess.Service.Users;
import com.example.Chess.Utils.MessageDecoder;
import com.example.Chess.Utils.MessageEncoder;

@Component
@ServerEndpoint(value = "/websocket", decoders = MessageDecoder.class, encoders = MessageEncoder.class )
public class SocketEndpoint {
    private static HashMap<Session, Board> games = new HashMap<Session, Board>();
    private static HashMap<String, Session> players = new HashMap<String, Session>();
    private static LinkedList<String> queue = new LinkedList<String>();

    private static Users users;

    /**
     * Setter method for injecting Users service instance.
     * @param users Users service instance to set.
     */
    @Autowired
    public void setUsers(Users users) {
        SocketEndpoint.users = users;
    }

    /**
     * Method called when a message is received from a client.
     * @param session The WebSocket session where the message originated.
     * @param message The message object sent by the client.
     * @throws IOException If an I/O error occurs.
     */
    @OnMessage
    public void onMessage(Session session, Message message) throws IOException {
        // handle initial setup message when the user wants to join a game.
        if (message.getType() == MessageType.INIT) {
            // ensures that the same websocket session cannot send another INIT message
            // when it is already in a game.
            if (!games.containsKey(session)) {
                // generates a new game for players playing on the same computer.
                if (message.getContent().equals("SINGLE")) {
                    Board board = new Board();
                    board.initBoard();
                    games.put(session, board);
                    sendBoard(session, board);
                }

                else {
                    // for users playing with another player online check that the security number assigned 
                    // to a user matches the number provided by the user. this ensures verification of each 
                    // user's identity preventing usernames from being stolen by other users.
                    String securityNum = message.getContent();
                    
                    if (users.getUser(message.getFrom()) == Integer.parseInt(securityNum)) {
                        // add the user to a queue of players.
                        players.put(message.getFrom(), session);
                        queue.add(message.getFrom());
                        
                        // if the queue is of size 2 or more, remove the first 2 users of the queue and pair
                        // them together for an online chess game.
                        if (queue.size() >= 2) {
                            String player1 = queue.removeFirst();
                            String player2 = queue.removeFirst();
                            Board board = new Board(player1, player2);
                            board.initBoard();
                            games.put(players.get(player1), board);
                            games.put(players.get(player2), board);
                            sendBoard(players.get(player1), board);
                            sendBoard(players.get(player2), board);
                        }
                    }
                }
            }
        }

        else {
            // check that the username of users playing online is coming from the same websocket session earlier recorded during initialisation.
            if (games.containsKey(session)) {
                Board board = games.get(session);
                if (board.getPlayer1() != null && board.getPlayer2() != null) {
                    if (!players.containsKey(message.getFrom())) {
                        return;
                    }
                    else if (players.get(message.getFrom()) != session) {
                        return;
                    }
                }
            }

            if (message.getType() == MessageType.MOVE || message.getType() == MessageType.DRAW || message.getType() == MessageType.CONCEDE) {
                if (games.containsKey(session)) {
                    // retrieves the game that the user is currently part of
                    Board board = games.get(session);

                    // check that the user is attempting to make a move on the chess board in a game that is ongoing.
                    if (message.getType() == MessageType.MOVE && board.getState() == GameState.ONGOING) {
                        if (message.getMove() != null) {
                            // deals with online players
                            if (board.getPlayer1() != null && board.getPlayer2() != null) {
                                // ensure it is the correct player's turn and that they maid a valid move.
                                if ((board.isWhiteTurn() && message.getFrom().equals(board.getPlayer1())) ||
                                    (!board.isWhiteTurn() && message.getFrom().equals(board.getPlayer2()))) {
                                        if (players.containsKey(message.getFrom())) {
                                            if (players.get(message.getFrom()) == session) {
                                                board.movePiece(message.getMove());
                                            }
                                        }
                                }
                            }
                            // deals with players playing on the same computer.
                            else {
                                board.movePiece(message.getMove());
                            }
                        }
                    }
                    
                    // if a draw has been agreed by the players, draw the game
                    else if (message.getType() == MessageType.DRAW && board.getState() == GameState.ONGOING) {
                        board.setState(GameState.DRAW);
                    }

                    // if one user has conceded the game, make the user who did not concede be the victor
                    else if (message.getType() == MessageType.CONCEDE && board.getState() == GameState.ONGOING) {
                        if (message.getFrom().equals(board.getPlayer1())) {
                            board.setState(GameState.BLACKWIN);
                        }
                        else if (message.getFrom().equals(board.getPlayer2())) {
                            board.setState(GameState.WHITEWIN);
                        }
                        sendMessage(players.get(board.getPlayer1()), message);
                        sendMessage(players.get(board.getPlayer2()), message); 
                    }

                    // send the current chess board to both players in the game
                    sendBoard(session, board);

                    if (board.getPlayer1() != null) {
                        if (players.get(board.getPlayer1()) != session)
                            sendBoard(players.get(board.getPlayer1()), board);
                        else
                            sendBoard(players.get(board.getPlayer2()), board); 
                    }
                }
            }

            else {
                // for all other messages just send them to both users, making no changes to the chess board
                if (games.containsKey(session)) {
                    Board board = games.get(session);
                    if (message.getType() == MessageType.DRAWOFFER && board.getState() != GameState.ONGOING) {
                        return;
                    }
                    
                    if (players.get(board.getPlayer1()) != session) {
                        sendMessage(players.get(board.getPlayer1()), message);
                    }
                    else if (players.get(board.getPlayer2()) != session) {
                        sendMessage(players.get(board.getPlayer2()), message);
                    }
                }
            }
        }
    }

    /**
     * Method called when a WebSocket session is closed.
     * @param session The WebSocket session that is closed.
     */
    @OnClose
    public void onClose(Session session) {
        if (games.containsKey(session)) {
            Board game = games.get(session);
            if (players.get(game.getPlayer1()) == session) {
                games.remove(players.get(game.getPlayer2()));
                players.remove(game.getPlayer1());
            }
            else if (players.get(game.getPlayer2()) == session) {
                games.remove(players.get(game.getPlayer1()));
                players.remove(game.getPlayer2());
            }
            games.remove(session);
        }
    }

    /**
     * Sends a message object to a specified socket user.
     * @param session The WebSocket session to send the message to.
     * @param message The message object to send.
     */
    public void sendMessage(Session session, Message message) {
        try {
            session.getBasicRemote().sendObject(message);
        } 
        catch (IOException | EncodeException e) {
            e.printStackTrace();
        } 
    }

    /**
     * Sends the current state of the chess board to a specified socket user.
     * @param session The WebSocket session to send the board state to.
     * @param board The board object representing the current game state.
     */
    public void sendBoard(Session session, Board board) {
        Message reply = new Message(null, MessageType.BOARD, board);
        try {
            session.getBasicRemote().sendObject(reply);
        } 
        catch (IOException | EncodeException e) {
            e.printStackTrace();
        }
    }
}