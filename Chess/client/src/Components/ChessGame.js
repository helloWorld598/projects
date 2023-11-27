import Header from './Header.js';
import Board from './Board.js';
import Marker from '../assets/marker.png'
import fillBoard, { executeCastling, executeEnPassant, kingChecked, checkMate } from '../Helper';
import PickPromotion from './PickPromotion';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import io from 'socket.io-client-latest';

export default function App(props) {
    const board = {};
    const socket = io.connect(`http://${window.location.hostname}:3001`);
    const [data, setData] = useState({});
    const [markers, setMarkers] = useState(new Array(8).fill(new Array(8).fill(false)));
    const [pieces, setPieces] = useState({});
    const [selected, setSelected] = useState({});
    const [disable, setDisable] = useState(false);
    const xAdjust = props.x;
    const yAdjust = props.y;
    const [colourSide, setColour] = useState("");
    const [opposite, setOpposite] = useState("");
    const [turn, setTurn] = useState(colourSide === "white" ? true : false);
    if (props.colour !== undefined && colourSide === "") {
        setColour(props.colour);
        setOpposite(props.colour === "white" ? "black" : "white");
        setTurn(props.colour === "white" ? true : false)
    }
    const connected = props.connected;
    const [conceded, setConceded] = useState(null);
    const [offer, setOffer] = useState(false);
    const [drawn, setDrawn] = useState(null);
    const [promoted, setPromoted] = useState(false);

    function coorToSquares(x, y) {
        // convert the actual coordinates or a piece on the board to x and y values between 0 to 7
        return [Math.floor((x - parseInt(xAdjust)) / 100), Math.floor((y - parseInt(yAdjust)) / 100)]
    }

    // checks whether or not a pawn can promote and if it can display the promotion bar
    function checkPromotion(board, colourSide) {
        for (let piece of Object.values(board)) {
            if (piece.type === "pawn") {
                if (colourSide === "white") {
                    if (piece.colour === "white" && piece.top === 0) {
                        setDisable(true);
                        return <PickPromotion
                            changeTurn={setDisable}
                            side={piece.colour}
                            x={piece.left * 100 + parseInt(xAdjust) + 75}
                            y={piece.top * 100 + parseInt(yAdjust)}
                            coord={piece.left + "," + piece.top}
                            set={board}
                            func={connected ? function (boardPieces) {
                                setPieces(boardPieces);
                                setPromoted(true);
                            } : setPieces}
                        />;
                    }

                    else if (piece.colour === "black" && piece.top === 7) {
                        // if the player is playing online then the player does not need to see the
                        // opponent's promotion bar
                        if (connected) {
                            setTurn(false);
                        }

                        else {
                            setDisable(true);
                            return <PickPromotion
                                changeTurn={setDisable}
                                side={piece.colour}
                                x={piece.left * 100 + parseInt(xAdjust) + 75}
                                y={1260 + parseInt(yAdjust) - (piece.top * 100)}
                                coord={piece.left + "," + piece.top}
                                set={board}
                                func={setPieces}
                            />;
                        }
                    }
                }

                else {
                    if (piece.colour === "white" && piece.top === 7) {
                        if (connected) {
                            setTurn(false);
                        }

                        else {
                            setDisable(true);
                            return <PickPromotion
                                changeTurn={setDisable}
                                side={piece.colour}
                                x={piece.left * 100 + parseInt(xAdjust) + 75}
                                y={1260 + parseInt(yAdjust) - (piece.top * 100)}
                                coord={piece.left + "," + piece.top}
                                set={board}
                                func={setPieces}
                            />;
                        }
                    }

                    else if (piece.colour === "black" && piece.top === 0) {
                        setDisable(true);
                        return <PickPromotion
                            changeTurn={setDisable}
                            side={piece.colour}
                            x={piece.left * 100 + parseInt(xAdjust) + 75}
                            y={piece.top * 100 + parseInt(yAdjust)}
                            coord={piece.left + "," + piece.top}
                            set={board}
                            func={connected ? function (boardPieces) {
                                setPieces(boardPieces);
                                setPromoted(true);
                            } : setPieces}
                        />;
                    }
                }
            }
        }
    }

    function pickObject(event) {
        if (conceded === null && drawn === null) {
            // determine whether the player has clicked on a piece which they want to move
            if (event.target.className === "piece" && (selected.className === undefined || selected.id === event.target.id) && ((turn === true && event.target.id === colourSide) || (turn === false && event.target.id === opposite && connected === false)) && disable === false) {
                setSelected(event.target);

                const [x, y] = coorToSquares(parseInt(event.target.style.left), parseInt(event.target.style.top));
                // array of all the blue dots signifying valid moves that will be displayed
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

                // display the markers indicating the valid moves for the piece that was pressed
                if (pieces[[x, y]].moves !== undefined) {
                    for (let move of pieces[[x, y]].moves) {
                        newArr[move[1]][move[0]] = true;
                    }
                    setMarkers(newArr);
                }

                // do the same but with special moves such as en passant
                if (pieces[[x, y]].obscure !== undefined) {
                    for (let move of pieces[[x, y]].obscure) {
                        newArr[move[1]][move[0]] = true;
                    }
                    setMarkers(newArr);
                }
            }

            // this determines that the user has clicked a spot to move the piece or clicked on a piece to capture
            else if ((event.target.className === "piece" && event.target.id !== selected.id) || (selected.className !== undefined && (pieces[coorToSquares(parseInt(event.target.style.left), parseInt(event.target.style.top))].type === undefined || pieces[coorToSquares(parseInt(event.target.style.left), parseInt(event.target.style.top))].colour !== pieces[coorToSquares(parseInt(selected.style.left), parseInt(selected.style.top))].colour)) || (event.target.className === "marker")) {
                const [x, y] = coorToSquares(parseInt(event.target.style.left), parseInt(event.target.style.top));
                const [prevX, prevY] = coorToSquares(parseInt(selected.style.left), parseInt(selected.style.top));
                const moves = pieces[[prevX, prevY]].moves.map(val => val[0] + "," + val[1]);
                var newPieces = findChecks(pieces);

                // record the previous position of the piece if no recorded position has been recorded
                // this attribute is used when determining when the player can perform en passant or castle
                if (pieces[[prevX, prevY]].prev !== undefined) {
                    pieces[[prevX, prevY]].prev = [prevX, prevY];
                }

                if (pieces[[prevX, prevY]].obscure !== undefined) {
                    const stringArr = pieces[[prevX, prevY]].obscure.map(val => val[0] + "," + val[1]);
                    // check if the user has performed an 'obscure' or special move
                    if (stringArr.indexOf(x + "," + y) !== -1) {
                        // if it was the king that was moved and this the king's first move, perform castling
                        if (pieces[[prevX, prevY]].type === "king" && newPieces[[prevX, prevY]].moved === false) {
                            newPieces = executeCastling([prevX, prevY], [x, y], pieces);
                            setTurn(!turn);
                        }
                        // otherwise perform en passant
                        else {
                            newPieces = executeEnPassant([prevX, prevY], [x, y], pieces);
                            setTurn(!turn);
                        }
                    }
                    // check if the user has performed a normal valid move
                    else if (moves.indexOf(x + "," + y) !== -1) {
                        // update the board to reflect this new movement
                        newPieces = { ...newPieces, [x + "," + y]: { ...newPieces[[prevX, prevY]], left: x, top: y, moved: true }, [prevX + "," + prevY]: {} };
                        // disable is used to prevent the software from giving the turn to the opposite colour when playing offline and is used when promoting
                        // a pawn as after moving a pawn to a position where it can promote, users need to select the promoted piece before resuming game
                        if (!disable) {
                            setTurn(!turn);
                        }
                        else if (connected) {
                            setTurn(!turn);
                        }
                    }
                }

                else if (moves.indexOf(x + "," + y) !== -1) {
                    newPieces = { ...newPieces, [x + "," + y]: { ...newPieces[[prevX, prevY]], left: x, top: y, moved: true }, [prevX + "," + prevY]: {} };
                    if (!disable) {
                        setTurn(!turn);
                    }
                    else if (connected) {
                        setTurn(!turn);
                    }
                }

                setSelected({});
                setPieces(newPieces);

                // send the new board to the adversary user
                if (connected) {
                    if (y !== 0 && y !== 7) {
                        socket.emit("play", { to: data.opponID, newBoard: newPieces });
                    }
                    else if (newPieces[[x, y]].type !== "pawn") {
                        socket.emit("play", { to: data.opponID, newBoard: newPieces });
                    }
                }

                // get rid of all the blue dots on the screen
                setMarkers(new Array(8).fill(new Array(8).fill(false)));
            }

            else {
                setMarkers(new Array(8).fill(new Array(8).fill(false)));
            }
        }
    }

    // function determines whether a black or white king has been checked and if so then the black king needs to
    // be considered as having moved, because after being checked a king cannot perform castling again
    function findChecks(board) {
        const blackChecked = kingChecked(board, "black");
        const whiteChecked = kingChecked(board, "white");
        var found = undefined;

        for (let coord of Object.keys(board)) {
            if (blackChecked) {
                if (board[coord].colour === "black" && board[coord].type === "king" && board[coord].moved === false) {
                    found = coord;
                }
            }

            else if (whiteChecked) {
                if (board[coord].colour === "white" && board[coord].type === "king" && board[coord].moved === false) {
                    found = coord;
                }
            }
        }

        if (found !== undefined) {
            return { ...board, [found]: { ...board[found], moved: true } };
        }

        return board;
    }

    // function draws the markers or blue dots on the screen indicating valid moves for a piece
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

    // function sends a message to adversary user that the player has conceded the match
    function concedeMatch() {
        if (drawn === null && conceded === null && !checkMate(pieces, "white") && !checkMate(pieces, "black")) {
            setConceded(true);
            socket.emit("concede", { to: data.opponID });
        }
    }

    // function sends a message to adversary user that the player would like to draw the match
    function offerDraw() {
        if (drawn === null && conceded === null) {
            socket.emit("offer", { to: data.opponID });
        }
    }

    // function sends a reply to adversary user whether the player would like to draw the match or not
    function respondOffer(event) {
        if (drawn === null && conceded === null) {
            if (event.target.value === "accept") {
                setDrawn(true);
            }
            else {
                setOffer(false);
            }

            socket.emit("res", { to: data.opponID, response: event.target.value });
        }
    }

    // functions sends a message to the user indicating that a promotion has taken place
    function sendPromote() {
        if (promoted) {
            socket.emit("play", { to: data.opponID, newBoard: pieces });
            setPromoted(false);
        }
    }

    // fetch the user's data which includes what colour they are playing as
    React.useEffect(() => {
        fetch("/api")
            .then(res => res.json())
            .then(data => {
                setData(data);
                setColour(data.colour)

                if (data.colour === "white") {
                    setTurn(true);
                    setOpposite("black");
                }

                else {
                    setTurn(false);
                    setOpposite("white");
                }
            });
    }, []);

    // draw the board to the screen depending on what colour the user is
    React.useEffect(() => {
        if (colourSide !== "") {
            fillBoard(board, colourSide, opposite, setPieces);
        }
    },
        [colourSide]);

    // logic for handling the reception of socket messages
    React.useEffect(() => {
        socket.on("move", (message) => {
            if (message.to === data.id) {
                const actualBoard = {};

                // inverts the board as from the perspective of one user the board is inverted compared to the other
                for (let coord of Object.keys(message.newBoard)) {
                    const [x, y] = coord.split(",");
                    const newX = 7 - parseInt(x);
                    const newY = 7 - parseInt(y);
                    actualBoard[[newX, newY]] = { ...message.newBoard[[x, y]], left: newX, top: newY };
                }

                setPieces(actualBoard);
                setTurn(true);
            }
        });

        socket.on("win", (message) => {
            if (message.to === data.id) {
                setConceded(false);
            }
        })

        socket.on("offering", (message) => {
            if (message.to === data.id) {
                setOffer(true);
            }
        })

        socket.on("outcome", (message) => {
            if (message.to === data.id) {
                if (message.response === "accept") {
                    setDrawn(true);
                }

                else {
                    setDrawn(false);
                    setTimeout(() => setDrawn(null), 5000);
                }
            }
        })

        return (() => {
            socket.close("move");
            socket.close("win");
            socket.close("move");
            socket.close("outcome");
        })
    }, [socket])

    return (
        <div className="App">
            <Header />
            {connected && <p>Matchup: {data.name} (You) vs {data.opponent}</p>}
            <Board right={xAdjust} down={yAdjust} set={pieces} func={pickObject} side={colourSide} opposing={opposite} markers={showMarkers} promotions={checkPromotion} />
            <Sidebar playerTurn={turn} online={connected} side={colourSide} set={pieces} concede={concedeMatch} draw={offerDraw} drawStatus={drawn} loss={conceded} offered={offer} response={respondOffer} left={900 + parseInt(xAdjust) + "px"} top={parseInt(yAdjust) + "px"} />
            {sendPromote()}
        </div>
    );
}