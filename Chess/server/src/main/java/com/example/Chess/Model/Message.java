package com.example.Chess.Model;

import com.example.Chess.Game.ChessBoard.Board;
import com.example.Chess.Game.Move.Move;

import lombok.Data;

@Data
public class Message {
    private String from;
    private MessageType type;
    private Board board;
    private String content;
    private Move move;

    public Message() { }

    /**
     * Constructor for when the message is intended to send the board state
     * @param from the sender of the message
     * @param type the type of message being sent
     * @param board representing the chess board of some game
     */
    public Message(String from, MessageType type, Board board) {
        this.from = from;
        this.type = type;
        this.board = board;
    }

    /**
     * Constructor for when the message is intended to carry some text
     * @param from the sender of the message
     * @param type the type of message being sent
     * @param content representing some text being sent
     */
    public Message(String from, MessageType type, String content) {
        this.from = from;
        this.type = type;
        this.content = content;
    }

    /**
     * Constructor for when the message is intended to send some move
     * @param from the sender of the message
     * @param type the type of message being sent
     * @param move representing some move made on the chess board
     */
    public Message(String from, MessageType type, Move move) {
        this.from = from;
        this.type = type;
        this.move = move;
    }
}