package com.example.Chess.Game.Pieces;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.example.Chess.Game.Move.Move;
import com.example.Chess.Game.Move.MoveType;

public class Knight extends Piece {
    public Knight(int[] position, boolean white) {
        this.position = position;
        this.lastMove = null;
        this.white = white;
        this.type = PieceType.KNIGHT;
    }

    public List<Move> generateMoves(HashMap<String, Piece> board) {
        List<Move> listMoves = new ArrayList<Move>();

        // generate all possible "L" shaped coordinates that the knight can move to
        int[][] posMoves = {
            new int[] {this.position[0] - 1, this.position[1] - 2}, 
            new int[] {this.position[0] + 1, this.position[1] - 2},
            new int[] {this.position[0] - 2, this.position[1] - 1},
            new int[] {this.position[0] + 2, this.position[1] - 1},
            new int[] {this.position[0] - 1, this.position[1] + 2},
            new int[] {this.position[0] + 1, this.position[1] + 2},
            new int[] {this.position[0] - 2, this.position[1] + 1},
            new int[] {this.position[0] + 2, this.position[1] + 1}
        };

        // check if it is possible for the knight to move to each square from above
        for (int[] posMove: posMoves) {
            String strPosMove = posMove[0] + "," + posMove[1];
            if (board.containsKey(strPosMove)) {
                if (board.get(strPosMove) != null) {
                    if (!this.isSameColour(board.get(strPosMove))) {
                        listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), posMove, posMove, this.type));
                    }
                } else {
                    listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), posMove, posMove, this.type));
                }
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