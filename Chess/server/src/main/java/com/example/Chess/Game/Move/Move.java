package com.example.Chess.Game.Move;

import com.example.Chess.Game.Pieces.PieceType;

import lombok.Data;

@Data
public class Move {
    private MoveType moveType;
    private int[] prevPos;
    private int[] nextPos;
    private int[] affectPos;
    private PieceType pieceType;
    private int moveNum = -1;

    public Move() { }

    public Move(MoveType moveType, int[] prevPos, int[] nextPos, int[] affectPos, PieceType pieceType) {
        this.moveType = moveType;
        this.prevPos = prevPos;
        this.nextPos = nextPos;
        this.affectPos = affectPos;
        this.pieceType = pieceType;
    }

    /**
     * Check if two move objects can both be said as describing the same chess move
     * @param other move to be checked with
     * @return true if both move objects describe the same move and false if not
     */
    public boolean isSameMove(Move other) {
        if (other == null) 
            return false;
        return
            (this.getMoveType() == other.getMoveType()) && 
            (this.getPrevPos()[0] == other.getPrevPos()[0] && this.getPrevPos()[1] == other.getPrevPos()[1]) &&
            (this.getNextPos()[0] == other.getNextPos()[0] && this.getNextPos()[1] == other.getNextPos()[1]) &&
            (this.getAffectPos()[0] == other.getAffectPos()[0] && this.getAffectPos()[1] == other.getAffectPos()[1]);
    }
}