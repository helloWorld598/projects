import React, { useState } from "react";
import { checkMate, kingChecked, draw } from "../Helper";

// function will construct a side bar which will appear during the game. It can be used to request a
// draw, concede to the opponent and view game messages, such as whether their king has been check
export default function Sidebar(props) {
    const [blackChecked, setBlackChecked] = useState(false);
    const [whiteChecked, setWhiteChecked] = useState(false);
    const [whiteCheckMated, setWhiteCheckMated] = useState(false);
    const [blackCheckMated, setBlackCheckMated] = useState(false);
    const [drawn, setdrawn] = useState(false);

    function checkBoard() {
        // determine whether the black of white kings have been checkmated
        if (blackCheckMated !== checkMate(props.set, "black")) {
            setBlackCheckMated(!blackCheckMated);
            return;
        }

        if (whiteCheckMated !== checkMate(props.set, "white")) {
            setWhiteCheckMated(!whiteCheckMated)
            return;
        }

        // determine whether a draw has occurred from the perspective of the white side
        if (props.side === "white") {
            if (drawn !== draw(props.set, "white") && props.playerTurn) {
                setdrawn(!drawn);
            }
            else if (drawn !== draw(props.set, "black") && props.playerTurn === false) {
                setdrawn(!drawn);
            }
        }

        // determine whether a draw has occurred from the perspective of the black side
        else {
            if (drawn !== draw(props.set, "black") && props.playerTurn) {
                setdrawn(!drawn);
                return;
            }
            else if (drawn !== draw(props.set, "white") && props.playerTurn === false) {
                setdrawn(!drawn);
                return;
            }
        }

        // determine whether the kings have been checked
        if (blackChecked !== kingChecked(props.set, "black") && blackCheckMated === false) {
            setBlackChecked(!blackChecked);
        }

        if (whiteChecked !== kingChecked(props.set, "white") && whiteCheckMated === false) {
            setWhiteChecked(!whiteChecked);
        }
    }
    // relevant messages will be displayed if a player has been checked, checkmated or drawn
    return (
        <aside style={{ left: props.left, top: props.top }}>
            {checkBoard()}

            <h3>Message Board</h3>

            {props.online &&
                <React.Fragment>
                    <button class="gameBtns" onClick={props.concede}>Concede match</button>
                    <button class="gameBtns" onClick={props.draw}>Offer to draw the match</button>

                    {props.loss && <p>You have conceded the match</p>}
                    {props.loss === false && <p>The opponent conceded the match. You win</p>}

                    {
                        (props.offered && props.drawStatus === null) && (
                            <React.Fragment>
                                <p>The opponent offered to draw the match</p>
                                <button class="gameBtns" value="accept" onClick={props.response}>Accept</button>
                                <button class="gameBtns" value="decline" onClick={props.response}>Decline</button>
                            </React.Fragment>
                        )
                    }

                    {props.drawStatus && <p>The match has been drawn by offer</p>}
                    {props.drawStatus === false && <p>The offer to draw was unsuccessful</p>}
                </React.Fragment>
            }

            {blackCheckMated && <p>Black has been checkmated. White wins!</p>}
            {whiteCheckMated && <p>White has been checkmated. Black wins!</p>}
            {blackChecked && blackCheckMated === false && <p>Black has been checked</p>}
            {whiteChecked && whiteCheckMated === false && <p>White has been checked</p>}

            {drawn && <p>The game has been drawn</p>}
        </aside>
    )
}