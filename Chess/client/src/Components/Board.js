import white from "../assets/cream.png";
import black from "../assets/green.jpeg";
import ChessPieces from "./ChessPieces";
import React from "react";

// function deals with drawing the chess board on the screen
export default function Board(props) {
    function createBoard() {
        const output = [];

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                // calculate the x and y positions of each square on the board
                const right = parseInt(props.right) + (x * 100) + "px";
                const down = parseInt(props.down) + (y * 100) + "px";
                var colour = "";

                if (y % 2 === 0) {
                    if (x % 2 === 0) {
                        colour = "white";
                    }
                    else {
                        colour = "black";
                    }
                }

                else {
                    if (x % 2 === 0) {
                        colour = "black";
                    }
                    else {
                        colour = "white";
                    }
                }

                // pushes the correct image of each square onto the screen
                output.push(
                    <img src={colour === "white" ? white : black} alt="" className="board" onMouseDown={props.func} style={
                        {
                            left: right,
                            top: down
                        }
                    } />
                )
            }
        }

        return output;
    }

    return (
        <section className="chess">
            {createBoard()}
            <ChessPieces set={props.set} side={props.side} func={props.func} right={props.right} down={props.down} markers={props.markers} />
            {props.promotions(props.set, props.side)}
        </section>
    )
}