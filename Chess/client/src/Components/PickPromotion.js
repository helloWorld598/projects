import whiteBishop from "../assets/bishopW.png";
import blackBishop from "../assets/bishopB.png";
import whiteKnight from "../assets/knightW.png";
import blackKnight from "../assets/knightB.png";
import whiteRook from "../assets/rookW.png";
import blackRook from "../assets/rookB.png";
import whiteQueen from "../assets/queenW.png";
import blackQueen from "../assets/queenB.png";
import React from "react";

// function will display a selection of pieces that the pawn can promote to and
// will handle promotion of the pawn depending on which piece the user chooses
export default function PickPromotion(props) {
    return (
        <div className="selection" style={
            {
                left: props.x + "px",
                top: props.y + "px",
            }
        }>
            {
                props.side === "white" && (
                    <React.Fragment>
                        <img src={whiteBishop} alt="" title="bishop" className="choice" style={{ backgroundColor: "black" }} /><br />
                        <img src={whiteKnight} alt="" title="knight" className="choice" style={{ backgroundColor: "black" }} /><br />
                        <img src={whiteRook} alt="" title="rook" className="choice" style={{ backgroundColor: "black" }} /><br />
                        <img src={whiteQueen} alt="" title="queen" className="choice" style={{ backgroundColor: "black" }} /><br />
                    </React.Fragment>
                )
            }

            {
                props.side === "black" && (
                    <React.Fragment>
                        <img src={blackBishop} alt="" title="bishop" className="choice" style={{ backgroundColor: "white" }} /><br />
                        <img src={blackKnight} alt="" title="knight" className="choice" style={{ backgroundColor: "white" }} /><br />
                        <img src={blackRook} alt="" title="rook" className="choice" style={{ backgroundColor: "white" }} /><br />
                        <img src={blackQueen} alt="" title="queen" className="choice" style={{ backgroundColor: "white" }} /><br />
                    </React.Fragment>
                )
            }
        </div>
    )
}