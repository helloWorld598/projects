import Header from './Header.js';
import Board from './Board.js';
import Marker from '../assets/marker.png'
import PickPromotion from './PickPromotion';
import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Wait from './Wait.js';

// function deals with displaying the chess board onto the screen and associated functionality
export default function App(props) {
    const [markers, setMarkers] = useState(new Array(8).fill(new Array(8).fill(false)));
    const [pieces, setPieces] = useState({});
    const [selected, setSelected] = useState([]);
    const xAdjust = props.x;
    const yAdjust = props.y;
    const [colourSide, setColour] = useState("");
    const [turn, setTurn] = useState(true);
    const connected = props.connected;
    const [username, setUsername] = useState(null);
    const [opponent, setOpponent] = useState("");
    const [whiteKingChecked, setWhiteKingChecked] = useState(false);
    const [blackKingChecked, setBlackKingChecked] = useState(false);
    const [whiteWin, setWhiteWin] = useState(null);
    const [offer, setOffer] = useState(false);
    const [drawn, setDrawn] = useState(null);
    const [promote, setPromote] = useState(false);
    const [promoteMove, setPromoteMove] = useState({});
    const [waiting, setWaiting] = useState(true);
    const [conceded, setConcede] = useState(false);
    const [messages, setMessages] = useState([]);

    // effect to handle initial waiting state based on whether the user is playing online.
    if (!connected && waiting) {
        setWaiting(false);
    }
    
    const socket = useRef(null);

    // function to convert coordinates to chess squares.
    function coorToSquares(x, y) {
        // convert the raw coordinates on a chess board board to x and y values between 0 to 7
        // for black pieces, the coordinates would need to be flipped.
        if (colourSide === "white") {
            return [Math.floor((x - parseInt(xAdjust)) / 100), Math.floor((y - parseInt(yAdjust)) / 100)]
        }
        else {
            return [7 - Math.floor((x - parseInt(xAdjust)) / 100), 7 - Math.floor((y - parseInt(yAdjust)) / 100)]
        }
    }

    // function to handle clicking on chess pieces or board squares.
    function pickObject(event) {
        const [x, y] = coorToSquares(parseInt(event.target.style.left), parseInt(event.target.style.top));

        // determine whether the player has clicked on a piece which belongs to their side when it is their turn.
        // for users playing online the user can only make a move when it is their assigned colour's turn to move
        // but for players playing on the same computer, only pieces of the right colour are allowed to move.
        if (event.target.className === "piece" && selected[0] === undefined && !promote) {
            if ((pieces[x + "," + y].white === turn && !connected) || 
                (
                    (turn && connected && ((pieces[x + "," + y].white && colourSide === "white") || 
                    (!pieces[x + "," + y].white && colourSide === "black"))
                )
            )) {
                setSelected([x, y]);

                // array of all the blue dots signifying valid moves that will be displayed.
                const newArr = [
                    [false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false]
                ];

                // display the markers indicating the valid moves for the piece that was pressed.
                if (pieces[x + "," + y] !== undefined) {
                    if (pieces[x + "," + y].moves) {
                        for (let move of pieces[x + "," + y].moves) {
                            if (colourSide === "white")
                                newArr[move.nextPos[1]][move.nextPos[0]] = true;
                            else if (colourSide === "black")
                                newArr[7 - move.nextPos[1]][7 - move.nextPos[0]] = true;
                        }
                        setMarkers(newArr);
                    }
                }
            }
            else {
                // remove all markers from the chess board.
                setMarkers(new Array(8).fill(new Array(8).fill(false)));
                setSelected([]);
            }
        }
        
        // check if the user has clicked on a place on the board after selecting a piece they want to move.
        else if (pieces[x + "," + y] !== undefined && selected[0] !== undefined && !promote) {
            const [selectedX, selectedY] = selected;
            
            // check if the square the user clicked on is a position that the piece the user selected 
            // earlier is allowed to move to. then send the move to the server.
            if (pieces[selectedX + "," + selectedY].moves) {
                for (let move of pieces[selectedX + "," + selectedY].moves) {
                    if (colourSide === "white") {
                        if (move.nextPos[0] === x && move.nextPos[1] === y) {
                            if (move["moveType"] === "PROMOTE") {
                                setPromote(true);
                                setPromoteMove(move);
                            }
                            else {
                                const msg = {"from": username === null ? "null" : username["name"], "type": "MOVE", "move": move};
                                socket.current.send(JSON.stringify(msg));
                                break;
                            }
                        }
                    }

                    else {
                        if (move.nextPos[0] === x && move.nextPos[1] === y) {
                            if (move["moveType"] === "PROMOTE") {
                                setPromote(true);
                                setPromoteMove(move);
                            }
                            else {
                                const msg = {"from":username === null ? "null" : username["name"], "type": "MOVE", "move": move};
                                socket.current.send(JSON.stringify(msg));
                                break;
                            }
                        }
                    }
                }
            }

            // remove all markers from the chess board.
            setMarkers(new Array(8).fill(new Array(8).fill(false)));
            setSelected([]);
        }

        // check if the user has selected a new piece that a pawn can promote to.
        else if (promote && event.target.className === "choice") {
            const msg = {"from": username === null ? "null" : username["name"], "type": "MOVE", "move": {...promoteMove, "pieceType": event.target.title.toUpperCase()}};
            socket.current.send(JSON.stringify(msg));
            setPromote(false);
        }

        // otherwise just check the chess board of any markers.
        else if (!promote) {
            setMarkers(new Array(8).fill(new Array(8).fill(false)));
            setSelected([]);
        }
    }

    // function draws the markers or blue dots on the screen indicating valid moves for a piece.
    function showMarkers() {
        const output = [];

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (markers[y][x]) {
                    output.push(
                        <img src={Marker} alt="" className="marker" onMouseDown={pickObject} style={
                            {
                                position: "absolute",
                                left: (x * 100) + parseInt(xAdjust) + 37 + "px",
                                top: (y * 100) + parseInt(yAdjust) + 37 + "px",
                                width: "25px",
                                height: "25px"
                            }
                        }
                        />
                    )
                }
            }
        }

        return output;
    }

    // function to send a concede match message to the server.
    const concedeMatch = () => {
        const msg = {"from": username["name"], "type": "CONCEDE", "content": ""};
        socket.current.send(JSON.stringify(msg));
    }

    // function to send a draw offer request to the server.
    const offerDraw = () => {
        const msg = {"from": username["name"], "type": "DRAWOFFER", "content": ""};
        setDrawn(null);
        socket.current.send(JSON.stringify(msg));
    }

     // function to respond to a draw offer and send to the server.
    const respondOffer = (e) => {
        var msg = {};
        if (e.target.value === "accept") {
            msg = {"from": username["name"], "type": "DRAW", "content": ""};
        }
        else if (e.target.value === "decline") {
            msg = {"from": username["name"], "type": "DECLINEDRAW", "content": ""};
            setOffer(false);
        }
        socket.current.send(JSON.stringify(msg));
    }

    // function to send a chat message to the server.
    const sendMessage = () => {
        const msg_text = document.getElementById("message").value;
        const msg = {"from": username["name"], "type": "MSG", "content": username["name"] + ": " + msg_text};
        socket.current.send(JSON.stringify(msg));
        setMessages([...messages, "You: " + msg_text]);
        document.getElementById("message").value = "";
    }

    // function to close the WebSocket connection.
    const closeSocket = () => {
        socket.close();
    }

    // effect to fetch the user's username and security number when connected.
    React.useEffect(() => {
        if (connected) {
            fetch("/api/get")
            .then(data => {
                if (data["status"] === 200) {
                    return data.json();
                }
                else {
                    return {};
                }
            })
            .then(data => {
                for (let key in data) {
                    if (username === null || username["name"] !== key)
                        setUsername({"name": key, "num": data[key]});
                }
            });
        }
    }, []);

    // effect to manage WebSocket connection and message handling.
    React.useEffect(() => {
        let client;
        // check that the user is playing online, has a username and has no prior
        // websocket connection before connecting to the server.
        if ((username !== null || !connected) && socket.current === null) {
            client = new WebSocket("/websocket");
        }
        
        // when a websocket connection is established send an initialisation message to the server
        // containing the user's username and security number
        function handleOpen() {
            let toSend = null;
            if (connected) {
                toSend = {"from": username["name"], "type": "INIT", "content": username["num"]};
            }
            else {
                toSend = {"from": "null", "type": "INIT", "content": "SINGLE"}; 
            }
            client.send(JSON.stringify(toSend));
        }
        
        // handles reception of websocket messages from the server
        function handleMessage(event) {
            const message = JSON.parse(event.data);

            // handles messages when the server sends the chess board to the user
            if (message["type"] === "BOARD") {
                if (waiting) {
                    setWaiting(false);
                }

                if (message["board"]["state"] === "WHITEWIN") {
                    setWhiteWin(true);
                }

                else if (message["board"]["state"] === "BLACKWIN") {
                    setWhiteWin(false);
                }
    
                else if (message["board"]["state"] === "DRAW") {
                    setDrawn(true);
                }
                
                setPieces(message["board"]["board"]);

                setWhiteKingChecked(message["board"]["whiteKing"]["checked"]);
                setBlackKingChecked(message["board"]["blackKing"]["checked"]);

                // if the user is not playing online, after playing a move, set the turn
                // to whatever is provided in the board object
                if (!connected) {
                    setTurn(message["board"]["whiteTurn"]);
                    setColour("white");
                }
                
                else {
                    // if the user's username matches the "player1" field in the board object sent
                    // by the server, set that user to be white and adjust their turns accordingly
                    if (message["board"]["player1"] === username["name"]) {
                        setColour("white");
                        setOpponent(message["board"]["player2"]);
                        if (message["board"]["whiteTurn"]) {
                            setTurn(true);
                        }
                        else {
                            setTurn(false);
                        }
                    }
                    // if the user's username matches the "player2" field in the board object sent by
                    // by the server, set that user to be black and adjust their turns accordingly
                    else if (message["board"]["player2"] === username["name"]) {
                        setColour("black");
                        setOpponent(message["board"]["player1"]);
                        if (!message["board"]["whiteTurn"]) {
                            setTurn(true);
                        }
                        else {
                            setTurn(false);
                        }
                    }
                }
            }

            else if (message["type"] === "DRAWOFFER") {
                setOffer(true);
            }

            else if (message["type"] === "DECLINEDRAW") {
                setDrawn(false);
            }

            else if (message["type"] === "CONCEDE") {
                setConcede(true);
            }

            else if (message["type"] === "MSG") {
                setMessages([...messages, message["content"]]);
            }
        }
        
        // save the websocket object as a react reference and 
        // add the above functions as event handlers
        if (username !== null || !connected) {
            if (socket.current === null) {
                socket.current = client;
            }
            socket.current.addEventListener('open', handleOpen);
            socket.current.addEventListener('message', handleMessage);
        }
        
        return () => {
            if ((username !== null || !connected) && socket.current === null) {
                client.removeEventListener('open', handleOpen);
                client.removeEventListener('message', handleMessage);
                client.close();
            }
        };
    }, [username, messages]);

    // effect to update handlers for mouse clicks on the chess board and when the
    // user leaves the webpage, their socket connection must be terminated
    React.useEffect(() => {
        document.addEventListener("mousedown", pickObject);
        document.addEventListener("beforeunload", closeSocket);

        return () => {
            document.removeEventListener("mousedown", pickObject);
            document.removeEventListener("beforeinput", closeSocket);
        }
    }, [pieces, selected, promote, promoteMove, username]);

    // if the user is currently waiting for another user to be paired with them display the
    // wait webpage, otherwise display the webpage containing the chess board
    return ( waiting ? <Wait /> : 
        (
            <div className="App">
                <Header />
                { connected && username !== null && opponent !== "" && <h3>{username["name"]} vs {opponent}</h3> }

                <Board 
                    right={xAdjust} 
                    down={yAdjust} 
                    set={pieces} 
                    side={colourSide}
                    markers={showMarkers} 
                />
                {promote && <PickPromotion
                    side={turn ? "white" : "black"}
                    x={selected[0] * 100 + parseInt(xAdjust) + 75}
                    y={selected[1] * 100 + parseInt(yAdjust)}
                    coord={selected[0] + "," + selected[1]}
                />}
                <Sidebar 
                    online={connected} 
                    concede={concedeMatch} 
                    draw={offerDraw} 
                    drawStatus={drawn} 
                    loss={whiteWin} 
                    offered={offer}
                    conceded={conceded}
                    whiteChecked={whiteKingChecked}
                    blackChecked={blackKingChecked}
                    response={respondOffer}
                    send={sendMessage}
                    messages={messages}
                    left={900 + parseInt(xAdjust) + "px"} 
                    top={parseInt(yAdjust) + "px"} 
                />
            </div>
        )
    );
}