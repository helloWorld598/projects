import React from "react";
import blackPawn from "../assets/pawnB.png";
import whitePawn from "../assets/pawnW.png";
import blackBishop from "../assets/bishopB.png";
import whiteBishop from "../assets/bishopW.png";
import blackKnight from "../assets/knightB.png";
import whiteKnight from "../assets/knightW.png";
import blackRook from "../assets/rookB.png";
import whiteRook from "../assets/rookW.png";
import blackKing from "../assets/kingB.png";
import whiteKing from "../assets/kingW.png";
import blackQueen from "../assets/queenB.png";
import whiteQueen from "../assets/queenW.png";
import { getMoves, validateMoves, castling, enPassant } from "../Helper";

// function will determine which image should be drawn to the screen for
// each piece on the board and set their moves
export default function ChessPieces(props) {
    function setPieces() {
        const output = []

        // set the moves of all the pieces on the board
        getMoves(props.set, props.side);
        validateMoves(props.set, props.side);
        castling(props.set, props.side);
        enPassant(props.set);

        // iterate through each piece on the board and determine the correct image to 
        // be displayed which will represent each piece on the board

        for (let piece of Object.values(props.set)) {
            if (piece.type !== undefined) {
                const img = (
                    <img src={
                        piece.colour === "white" ?
                            (piece.type === "pawn" ? whitePawn :
                                piece.type === "knight" ? whiteKnight :
                                    piece.type === "bishop" ? whiteBishop :
                                        piece.type === "rook" ? whiteRook :
                                            piece.type === "queen" ? whiteQueen :
                                                piece.type === "king" ? whiteKing : "") :

                            (piece.type === "pawn" ? blackPawn :
                                piece.type === "knight" ? blackKnight :
                                    piece.type === "bishop" ? blackBishop :
                                        piece.type === "rook" ? blackRook :
                                            piece.type === "queen" ? blackQueen :
                                                piece.type === "king" ? blackKing : "")

                    } alt="" className="piece" id={piece.colour} onMouseDown={props.func} style={
                        {
                            left: (parseInt(piece.left) * 100) + parseInt(props.right) + 25 + "px",
                            top: (parseInt(piece.top) * 100) + parseInt(props.down) + 25 + "px",
                        }
                    }
                    />
                )

                output.push(img);
            }
        }

        return output;
    }

    return (
        <React.Fragment>
            {setPieces()}
            {props.markers()}
        </React.Fragment>
    )
}