package com.example.Chess.Game.Pieces;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.example.Chess.Game.ChessBoard.Board;
import com.example.Chess.Game.Move.Move;
import com.example.Chess.Game.Move.MoveType;

public class Pawn extends Piece {
    public Pawn(int[] position, boolean white) {
        this.position = position;
        this.lastMove = null;
        this.white = white;
        this.type = PieceType.PAWN;
    }

    /**
     * Generates possible en passant moves for the pawn. A separate function for obtaining en passant
     * moves is needed as this function accesses the numMovesMade attribute of the board object. This 
     * is done because chess rules specify that en passants can only be made immediately after the 
     * opposing pawn piece has moved by 2 steps.
     * @param gameBoard current chess board state.
     * @return list of Move objects representing possible en passant moves.
     */
    public List<Move> getEnPassant(Board gameBoard) {
        List<Move> listMoves = new ArrayList<Move>();
        int[] currentPos = this.getPosition();
        
        if (this.isWhite()) {
            int[] attackLeftPos = {currentPos[0] - 1, currentPos[1] - 1};
            String strAttackLeftPos = (currentPos[0] - 1) + "," + (currentPos[1] - 1); 
            if (gameBoard.getBoard().containsKey(strAttackLeftPos)) {
                int[] adjLeftPos = {currentPos[0] - 1, currentPos[1]};
                String strAdjLeftPos = (currentPos[0] - 1) + "," + currentPos[1];
                Piece adjPiece = gameBoard.getBoard().get(strAdjLeftPos);
                if (adjPiece != null) {
                    if (adjPiece.getLastMove() != null) {
                        // checks that the very last move made on the board was that of the opposing pawn moving
                        // forward from its starting position by 2 steps.
                        if (adjPiece.getLastMove().getMoveNum() == gameBoard.getNumMovesMade()) {
                            if (adjPiece.getLastMove().getPrevPos()[1] == 1 && this.getPosition()[1] == 3) {
                                listMoves.add(new Move(MoveType.EN_PASSANT, this.getPosition(), attackLeftPos, adjLeftPos, this.type));
                            }
                        }
                    }
                }
            }

            int[] attackRightPos = {currentPos[0] + 1, currentPos[1] - 1};
            String strAttackRightPos = (currentPos[0] + 1) + "," + (currentPos[1] - 1);
            if (gameBoard.getBoard().containsKey(strAttackRightPos)) {
                int[] adjRightPos = {currentPos[0] + 1, currentPos[1]};
                String strAdjRightPos = (currentPos[0] + 1) + "," + currentPos[1];
                Piece adjPiece = gameBoard.getBoard().get(strAdjRightPos);
                if (adjPiece != null) {
                    if (adjPiece.getLastMove() != null) {
                        // checks that the very last move made on the board was that of the opposing pawn moving
                        // forward from its starting position by 2 steps.
                        if (adjPiece.getLastMove().getMoveNum() == gameBoard.getNumMovesMade()) {
                            if (adjPiece.getLastMove().getPrevPos()[1] == 1 && this.getPosition()[1] == 3) {
                                listMoves.add(new Move(MoveType.EN_PASSANT, this.getPosition(), attackRightPos, adjRightPos, this.type));
                            }
                        }
                    }
                }
            }
        }

        else {
            int[] attackLeftPos = {currentPos[0] - 1, currentPos[1] + 1};
            String strAttackLeftPos = (currentPos[0] - 1) + "," + (currentPos[1] + 1);
            if (gameBoard.getBoard().containsKey(strAttackLeftPos)) {
                int[] adjLeftPos = {currentPos[0] - 1, currentPos[1]};
                String strAdjLeftPos = (currentPos[0] - 1) + "," + currentPos[1];
                Piece adjPiece = gameBoard.getBoard().get(strAdjLeftPos);
                if (adjPiece != null) {
                    if (adjPiece.getLastMove() != null) {
                        // checks that the very last move made on the board was that of the opposing pawn moving
                        // forward from its starting position by 2 steps.
                        if (adjPiece.getLastMove().getMoveNum() == gameBoard.getNumMovesMade()) {
                            if (adjPiece.getLastMove().getPrevPos()[1] == 6 && this.getPosition()[1] == 4) {
                                listMoves.add(new Move(MoveType.EN_PASSANT, this.getPosition(), attackLeftPos, adjLeftPos, this.type));
                            }
                        }
                    }
                }
            }

            int[] attackRightPos = {currentPos[0] + 1, currentPos[1] + 1};
            String strAttackRightPos = (currentPos[0] + 1) + "," + (currentPos[1] + 1);
            if (gameBoard.getBoard().containsKey(strAttackRightPos)) {
                int[] adjRightPos = {currentPos[0] + 1, currentPos[1]};
                String strAdjRightPos = (currentPos[0] + 1) + "," + currentPos[1]; 
                Piece adjPiece = gameBoard.getBoard().get(strAdjRightPos);
                if (adjPiece != null) {
                    if (adjPiece.getLastMove() != null) {
                        // checks that the very last move made on the board was that of the opposing pawn moving
                        // forward from its starting position by 2 steps.
                        if (adjPiece.getLastMove().getMoveNum() == gameBoard.getNumMovesMade()) {
                            if (adjPiece.getLastMove().getPrevPos()[1] == 6 && this.getPosition()[1] == 4) {
                                listMoves.add(new Move(MoveType.EN_PASSANT, this.getPosition(), attackRightPos, adjRightPos, this.type));
                            }
                        }
                    }
                }
            }
        }

        return listMoves;
    }

    public List<Move> generateMoves(HashMap<String, Piece> board) {
        List<Move> listMoves = new ArrayList<Move>();
        int[] currentPos = this.getPosition();
        
        if (this.isWhite()) {
            // check if the white pawn can move forward by one step
            int[] newPosUp = {currentPos[0], currentPos[1] - 1};
            String strNewPosUp = currentPos[0] + "," + (currentPos[1] - 1);
            if (board.containsKey(strNewPosUp)) {
                if (board.get(strNewPosUp) == null) {
                    if (newPosUp[1] == 0) {
                        listMoves.add(new Move(MoveType.PROMOTE, this.getPosition(), newPosUp, newPosUp, this.type));
                    }
                    else {
                        listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPosUp, newPosUp, this.type));
                    }
                }
            }

            // check if the white pawn can move forward by 2 steps if it still on its starting position
            int[] startMoveUp = {currentPos[0], currentPos[1] - 2};
            String strStartMoveUp = currentPos[0] + "," + (currentPos[1] - 2);
            if (!this.isMoved()) {
                if (board.get(strStartMoveUp) == null && board.get(strNewPosUp) == null) {
                    listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), startMoveUp, startMoveUp, this.type)); 
                }
            }

            // check if the white pawn can capture a pawn on its adjacent top left square
            int[] attackLeftPos = {currentPos[0] - 1, currentPos[1] - 1};
            String strAttackLeftPos = (currentPos[0] - 1) + "," + (currentPos[1] - 1); 
            if (board.containsKey(strAttackLeftPos)) {
                if (board.get(strAttackLeftPos) != null) {
                    if (!board.get(strAttackLeftPos).isWhite()) {
                        if (newPosUp[1] == 0) {
                            listMoves.add(new Move(MoveType.PROMOTE, this.getPosition(), attackLeftPos, attackLeftPos, this.type));
                        }
                        else {
                            listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), attackLeftPos, attackLeftPos, this.type));
                        }
                    }
                }
            }

            // check if the white pawn can capture a pawn on its adjacent top right square
            int[] attackRightPos = {currentPos[0] + 1, currentPos[1] - 1};
            String strAttackRightPos = (currentPos[0] + 1) + "," + (currentPos[1] - 1);
            if (board.containsKey(strAttackRightPos)) {
                if (board.get(strAttackRightPos) != null) {
                    if (!board.get(strAttackRightPos).isWhite()) {
                        if (newPosUp[1] == 0) {
                            listMoves.add(new Move(MoveType.PROMOTE, this.getPosition(), attackRightPos, attackRightPos, this.type));
                        }
                        else {
                            listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), attackRightPos, attackRightPos, this.type));
                        }
                    }
                }
            }
        }

        else {
            // check if the black pawn can move forward by one step
            int[] newPosUp = {currentPos[0], currentPos[1] + 1};
            String strNewPosUp = currentPos[0] + "," + (currentPos[1] + 1);
            if (board.containsKey(strNewPosUp)) {
                if (board.get(strNewPosUp) == null) {
                    if (newPosUp[1] == 7) {
                        listMoves.add(new Move(MoveType.PROMOTE, this.getPosition(), newPosUp, newPosUp, this.type));
                    }
                    else {
                        listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), newPosUp, newPosUp, this.type));
                    }
                }
            }

            // check if the black pawn can move forward by 2 steps if it still on its starting position
            int[] startMoveUp = {currentPos[0], currentPos[1] + 2};
            String strStartMoveUp = currentPos[0] + "," + (currentPos[1] + 2);
            if (!this.isMoved()) {
                if (board.get(strStartMoveUp) == null && board.get(strNewPosUp) == null) {
                    listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), startMoveUp, startMoveUp, this.type)); 
                }
            }

            // check if the black pawn can capture a pawn on its adjacent top left square
            int[] attackLeftPos = {currentPos[0] - 1, currentPos[1] + 1};
            String strAttackLeftPos = (currentPos[0] - 1) + "," + (currentPos[1] + 1);
            if (board.containsKey(strAttackLeftPos)) {
                if (board.get(strAttackLeftPos) != null) {
                    if (board.get(strAttackLeftPos).isWhite()) {
                        if (newPosUp[1] == 7) {
                            listMoves.add(new Move(MoveType.PROMOTE, this.getPosition(), attackLeftPos, attackLeftPos, this.type));
                        }
                        else {
                            listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), attackLeftPos, attackLeftPos, this.type));
                        }
                    }
                }
            }

            // check if the black pawn can capture a pawn on its adjacent top right square
            int[] attackRightPos = {currentPos[0] + 1, currentPos[1] + 1};
            String strAttackRightPos = (currentPos[0] + 1) + "," + (currentPos[1] + 1);
            if (board.containsKey(strAttackRightPos)) {
                if (board.get(strAttackRightPos) != null) {
                    if (board.get(strAttackRightPos).isWhite()) {
                        if (newPosUp[1] == 7) {
                            listMoves.add(new Move(MoveType.PROMOTE, this.getPosition(), attackRightPos, attackRightPos, this.type));
                        }
                        else {
                            listMoves.add(new Move(MoveType.TRANSLATE, this.getPosition(), attackRightPos, attackRightPos, this.type));
                        }
                    }
                }
            }
        }

        return listMoves;
    }

    public void applyMove(HashMap<String, Piece> board, Move move) {
        Piece currentPiece = this;

        // if an en passant is made, remove the opposing pawn from the board
        if (move.getMoveType() == MoveType.EN_PASSANT) {
            board.put(move.getAffectPos()[0] + "," + move.getAffectPos()[1], null);
        }

        // if a pawn can promote then replace the pawn with the selected piece of higher value
        else if (move.getMoveType() == MoveType.PROMOTE) {
            if (move.getPieceType() == PieceType.KNIGHT) {
                currentPiece = new Knight(this.getPosition(), this.isWhite());
            }
            else if (move.getPieceType() == PieceType.BISHOP) {
                currentPiece = new Bishop(this.getPosition(), this.isWhite());
            }
            else if (move.getPieceType() == PieceType.ROOK) {
                currentPiece = new Rook(this.getPosition(), this.isWhite());
            }
            else if (move.getPieceType() == PieceType.QUEEN) {
                currentPiece = new Queen(this.getPosition(), this.isWhite());
            }
        }

        board.put(move.getPrevPos()[0] + "," + move.getPrevPos()[1], null);
        board.put(move.getNextPos()[0] + "," + move.getNextPos()[1], currentPiece);

        currentPiece.setMoved(true);
        currentPiece.setPosition(move.getNextPos());
        currentPiece.setLastMove(move);
    }
}