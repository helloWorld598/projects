package com.example.Chess.Game.Pieces;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.example.Chess.Game.Move.Move;
import com.example.Chess.Game.Move.MoveType;

public class King extends Piece {
    private boolean checked = false;
    private boolean castling = true;

    public King(int[] position, boolean white) {
        this.position = position;
        this.lastMove = null;
        this.white = white;
        this.type = PieceType.KING;
    }

    /**
     * checks if the king can castle
     * @return true if the king can castle or false if not
     */
    public boolean canCastle() {
        return this.castling;
    }

    /**
     * checks if the king has been checked
     * @return true if the king has been checked or false if not
     */
    public boolean isChecked() {
        return this.checked;
    }

    /**
     * sets whether the king has been checked. If it has been checked
     * the king can never castle again.
     * @param checked whether or not the king has been checked
     */
    public void setChecked(boolean checked) {
        this.checked = checked;
        if (checked) {
            this.castling = false;
        }
    }

    public List<Move> generateMoves(HashMap<String, Piece> board) {
        List<Move> listMoves = new ArrayList<Move>();

        // possible movement directions for the king
        int[][] posMoves = {
            new int[] {this.position[0] - 1, this.position[1]}, 
            new int[] {this.position[0] + 1, this.position[1]},
            new int[] {this.position[0], this.position[1] - 1},
            new int[] {this.position[0], this.position[1] + 1},
            new int[] {this.position[0] - 1, this.position[1] - 1},
            new int[] {this.position[0] + 1, this.position[1] + 1},
            new int[] {this.position[0] - 1, this.position[1] + 1},
            new int[] {this.position[0] + 1, this.position[1] - 1}
        };

        // iterate through possible move positions and check if the king can move to any of these positions
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

        // check for castling moves if king is eligible
        // all squares to the left or right of the king must be empty of pieces except for the rooks and the king and rook must not have moved yet.
        if (this.canCastle()) {
            if (this.isWhite()) {
                Piece rook1 = board.get("0,7");
                Piece rook2 = board.get("7,7");
                if (rook1 != null && rook1.isWhite() && !rook1.isMoved() && board.get("1,7") == null && board.get("2,7") == null && board.get("3,7") == null) {
                    listMoves.add(new Move(MoveType.LEFT_CASTLE, this.getPosition(), new int[] {2, 7}, new int[] {0, 7}, this.type)); 
                }
                if (rook2 != null && rook2.isWhite() && !rook2.isMoved() && board.get("5,7") == null && board.get("6,7") == null) {
                    listMoves.add(new Move(MoveType.RIGHT_CASTLE, this.getPosition(), new int[] {6, 7}, new int[] {7, 7}, this.type));
                }
            }
            else {
                Piece rook1 = board.get("0,0");
                Piece rook2 = board.get("7,0");
                if (rook1 != null && !rook1.isWhite() && !rook1.isMoved() && board.get("1,0") == null && board.get("2,0") == null && board.get("3,0") == null) {
                    listMoves.add(new Move(MoveType.LEFT_CASTLE, this.getPosition(), new int[] {2, 0}, new int[] {0, 0}, this.type)); 
                }
                if (rook2 != null && !rook2.isWhite() && !rook2.isMoved() && board.get("5,0") == null && board.get("6,0") == null) {
                    listMoves.add(new Move(MoveType.RIGHT_CASTLE, this.getPosition(), new int[] {6, 0}, new int[] {7, 0}, this.type));
                }
            }
        }

        return listMoves;
    }

    public void applyMove(HashMap<String, Piece> board, Move move) {
        // move the king and rook to the correct positions after castling
        if (move.getMoveType() == MoveType.LEFT_CASTLE) {
            Piece rook = board.get(move.getAffectPos()[0] + "," + move.getAffectPos()[1]);
            if (rook.isWhite()) {
                rook.applyMove(board, new Move(MoveType.LEFT_CASTLE, rook.getPosition(), new int[] {3, 7}, new int[] {3, 7}, rook.getType()));
            }
            else {
                rook.applyMove(board, new Move(MoveType.LEFT_CASTLE, rook.getPosition(), new int[] {3, 0}, new int[] {3, 0}, rook.getType()));
            }
        }

        else if (move.getMoveType() == MoveType.RIGHT_CASTLE) {
            Piece rook = board.get(move.getAffectPos()[0] + "," + move.getAffectPos()[1]);
            if (rook.isWhite()) {
                rook.applyMove(board, new Move(MoveType.RIGHT_CASTLE, rook.getPosition(), new int[] {5, 7}, new int[] {5, 7}, rook.getType()));
            }
            else {
                rook.applyMove(board, new Move(MoveType.RIGHT_CASTLE, rook.getPosition(), new int[] {5, 0}, new int[] {5, 0}, rook.getType()));
            } 
        }

        board.put(move.getPrevPos()[0] + "," + move.getPrevPos()[1], null);
        board.put(move.getNextPos()[0] + "," + move.getNextPos()[1], this);

        this.setMoved(true);
        this.setPosition(move.getNextPos());
        this.setLastMove(move);
        this.castling = false;
    }
}