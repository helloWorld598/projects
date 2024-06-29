package com.example.Chess.Game.Pieces;

import java.util.List;
import java.util.HashMap;

import com.example.Chess.Game.Move.Move;

import lombok.Data;

@Data
public abstract class Piece {
    protected boolean moved = false;
    protected int[] position;
    protected Move lastMove;
    protected List<Move> moves;
    protected boolean white;
    protected PieceType type;

    /**
     * Abstract method to generate all possible legal moves for the piece.
     * 
     * @param board current board state represented as a hashmap where keys are positions and values are pieces
     * @return list of move objects representing all possible legal moves for the piece.
     */
    public abstract List<Move> generateMoves(HashMap<String, Piece> board);

    /**
     * Abstract method to apply a move to the board for this piece.
     * 
     * @param board current board state represented as a HashMap where keys are positions and values are pieces.
     * @param move object representing the move to be applied.
     */
    public abstract void applyMove(HashMap<String, Piece> board, Move move);

    /**
     * Method to check if this piece and another piece are of the same colour.
     * 
     * @param piece the other piece object to compare colour with.
     * @return true if both pieces are of the same colour, false otherwise.
     */
    public boolean isSameColour(Piece piece) {
        return this.isWhite() == piece.isWhite();
    }

    /**
     * Static method to create a copy of this piece object.
     * 
     * @param board current board state represented as a HashMap where keys are positions and values are pieces.
     * This is used when a copy of the board is created in Board.isValidPossibleMove.
     * @param strPos position of the piece to be copied, represented as a string.
     * @return new Piece object that is a copy of the piece at the specified position on the board.
     */
    public static Piece copyPiece(HashMap<String, Piece> board, String strPos) {
        Piece copy = null;
        
        if (!board.containsKey(strPos)) {
            return null;
        }

        // Create a new instance of the piece based on its type.
        Piece pieceToCopy = board.get(strPos);
        if (pieceToCopy.getType() == PieceType.PAWN) {
            copy = new Pawn(pieceToCopy.getPosition(), pieceToCopy.isWhite());
        }
        else if (pieceToCopy.getType() == PieceType.KNIGHT) {
            copy = new Knight(pieceToCopy.getPosition(), pieceToCopy.isWhite());
        }
        else if (pieceToCopy.getType() == PieceType.BISHOP) {
            copy = new Bishop(pieceToCopy.getPosition(), pieceToCopy.isWhite());
        }
        else if (pieceToCopy.getType() == PieceType.ROOK) {
            copy = new Rook(pieceToCopy.getPosition(), pieceToCopy.isWhite());
        }
        else if (pieceToCopy.getType() == PieceType.QUEEN) {
            copy = new Queen(pieceToCopy.getPosition(), pieceToCopy.isWhite());
        }
        else if (pieceToCopy.getType() == PieceType.KING) {
            copy = new King(pieceToCopy.getPosition(), pieceToCopy.isWhite());
        }

        // Copy the last move, list of moves, and moved status to the new piece instance.
        copy.setLastMove(pieceToCopy.getLastMove());
        copy.setMoves(pieceToCopy.getMoves());
        copy.setMoved(pieceToCopy.isMoved());

        return copy;
    }
}