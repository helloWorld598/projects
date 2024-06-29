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

// function will determine which image should be drawn to the screen for each piece on the board
export default function ChessPieces(props) {
    function setPieces() {
        const output = []
        // iterate through each piece on the board and determine the correct image to 
        // be displayed which will represent each piece on the board
        for (let piece of Object.values(props.set)) {
            if (piece !== null) {
                const img = (
                    <img src={
                        piece.white ?
                            (piece.type === "PAWN" ? whitePawn :
                                piece.type === "KNIGHT" ? whiteKnight :
                                    piece.type === "BISHOP" ? whiteBishop :
                                        piece.type === "ROOK" ? whiteRook :
                                            piece.type === "QUEEN" ? whiteQueen :
                                                piece.type === "KING" ? whiteKing : "") :

                            (piece.type === "PAWN" ? blackPawn :
                                piece.type === "KNIGHT" ? blackKnight :
                                    piece.type === "BISHOP" ? blackBishop :
                                        piece.type === "ROOK" ? blackRook :
                                            piece.type === "QUEEN" ? blackQueen :
                                                piece.type === "KING" ? blackKing : "")

                    } alt="" className="piece" id={piece.colour} style={{
                            left: props.side === "white" ?
                                ((parseInt(piece.position[0]) * 100) + parseInt(props.right) + 25 + "px") :
                                (((7 - parseInt(piece.position[0])) * 100) + parseInt(props.right) + 25 + "px"),
                            top: props.side === "white" ?
                                ((parseInt(piece.position[1]) * 100) + parseInt(props.down) + 25 + "px") :
                                (((7 - parseInt(piece.position[1])) * 100) + parseInt(props.down) + 25 + "px")
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