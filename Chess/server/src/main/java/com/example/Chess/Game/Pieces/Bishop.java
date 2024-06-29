package com.example.Chess.Game.Pieces;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.example.Chess.Game.Move.Move;
import com.example.Chess.Game.Move.MoveType;

public class Bishop extends Piece {
    public Bishop(int[] position, boolean white) {
        this.position = position;
        this.lastMove = null;
        this.white = white;
        this.type = PieceType.BISHOP;
    }

    public List<Move> generateMoves(HashMap<String, Piece> board) {
        List<Move> listMoves = new ArrayList<Move>();

        // checks which squares the bishop can move to its bottom right diagonal
        int startX = this.position[0];
        int startY = this.position[1];
        while (true) {
            int[] newPos = {startX + 1, startY + 1};
            String strNewPos = (startX + 1) + "," + (startY + 1);
            if (board.containsKey(strNewPos)) {
                if (board.get(strNewPos) == null) {
                    listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                }
                else {
                    if (!this.isSameColour(board.get(strNewPos))) {
                        listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                    }
                    break;
                }
                startX = newPos[0];
                startY = newPos[1];
            }
            else {
                break;
            }
        }

        // checks which squares the bishop can move to its top left diagonal
        startX = this.position[0];
        startY = this.position[1];
        while (true) {
            int[] newPos = {startX - 1, startY - 1};
            String strNewPos = (startX - 1) + "," + (startY - 1);
            if (board.containsKey(strNewPos)) {
                if (board.get(strNewPos) == null) {
                    listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                }
                else {
                    if (!this.isSameColour(board.get(strNewPos))) {
                        listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                    }
                    break;
                }
                startX = newPos[0];
                startY = newPos[1];
            }
            else {
                break;
            }
        }

        // checks which squares the bishop can move to its bottom left diagonal
        startX = this.position[0];
        startY = this.position[1];
        while (true) {
            int[] newPos = {startX - 1, startY + 1};
            String strNewPos = (startX - 1) + "," + (startY + 1);
            if (board.containsKey(strNewPos)) {
                if (board.get(strNewPos) == null) {
                    listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                }
                else {
                    if (!this.isSameColour(board.get(strNewPos))) {
                        listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                    }
                    break;
                }
                startX = newPos[0];
                startY = newPos[1];
            }
            else {
                break;
            }
        }

        // checks which squares the bishop can move to its top right diagonal
        startX = this.position[0];
        startY = this.position[1];
        while (true) {
            int[] newPos = {startX + 1, startY - 1};
            String strNewPos = (startX + 1) + "," + (startY - 1);
            if (board.containsKey(strNewPos)) {
                if (board.get(strNewPos) == null) {
                    listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                }
                else {
                    if (!this.isSameColour(board.get(strNewPos))) {
                        listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPos, newPos, this.type));
                    }
                    break;
                }
                startX = newPos[0];
                startY = newPos[1];
            }
            else {
                break;
            }
        }

        return listMoves;
    }

    public void applyMove(HashMap<String, Piece> board, Move move) {
        board.put(move.getPrevPos()[0] + "," + move.getPrevPos()[1], null);
        board.put(move.getNextPos()[0] + "," + move.getNextPos()[1], this);

        this.setMoved(true);
        this.setPosition(move.getNextPos());
        this.setLastMove(move);
    }
}