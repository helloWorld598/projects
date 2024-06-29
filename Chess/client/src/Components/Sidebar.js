import React from "react";

// function will construct a side bar which will appear during the game. It can be used to request a
// draw, concede to the opponent and view game messages, such as whether their king has been check
export default function Sidebar(props) {
    const displayMessages = () => {
        let messages = []
        for (let msg of props.messages) {
            messages.push(<p>{msg}</p>);
        }
        return messages;
    }

    // relevant messages will be displayed if a player has been checked, checkmated or drawn
    return (
        <aside style={{ left: props.left, top: props.top }}>
            <h3>Message Board</h3>

            <div className="status-section">
                {
                    props.online &&
                        <React.Fragment>
                            <button className="gameBtns" onClick={props.concede}>Concede match</button>
                            <button className="gameBtns" onClick={props.draw}>Offer to draw the match</button>

                            {
                                (props.offered && props.drawStatus === null) && (
                                    <React.Fragment>
                                        <p>The opponent offered to draw the match</p>
                                        <button className="gameBtns" value="accept" onClick={props.response}>Accept</button>
                                        <button className="gameBtns" value="decline" onClick={props.response}>Decline</button>
                                    </React.Fragment>
                                )
                            }

                            {props.drawStatus === false && <p>The offer to draw was unsuccessful</p>}
                        </React.Fragment>
                }

                {props.loss === null && props.whiteChecked && <p>White has been checked</p>}
                {props.loss === null && props.blackChecked && <p>Black has been checked</p>}
                {props.loss && (props.conceded ? <p>Black forfeits. White wins!</p> : <p>White wins by checkmate!</p>)}
                {props.loss === false && (props.conceded ? <p>White forfeits. Black wins!</p> : <p>Black wins by checkmate!</p>)}
                {props.drawStatus && <p>The game has been drawn</p>}
                {(props.loss !== null || props.drawStatus) && <React.Fragment><br /><button className="gameBtns" onClick={() => document.location.reload()}>Play Again</button></React.Fragment>}
            </div>

            {props.online && <React.Fragment>
                <br />

                <div className="msg-section">
                    {displayMessages()}
                </div>

                <div className="msg-feature">
                    <input id="message" placeholder="Send a message to your opponent" className="msg"/>
                    <button className="msg-btn" onClick={props.send}>Send</button>
                </div>
            </React.Fragment>}
        </aside>
    )
}