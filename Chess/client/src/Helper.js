export default function fillBoard(board, colourSide, opposite, setPieces) {
    // fills the chess board with all pieces set to their initial positions
    // at the start of the chess game
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (y === 1) {
                board[[x, y]] = { left: x, top: y, type: "pawn", colour: opposite, moves: [], moved: false, obscure: [], prev: [] };
            }

            else if (y === 0) {
                if (x === 0 || x === 7) {
                    board[[x, y]] = { left: x, top: y, type: "rook", colour: opposite, moves: [], moved: false };
                }

                else if (x === 1 || x === 6) {
                    board[[x, y]] = { left: x, top: y, type: "knight", colour: opposite, moves: [] };
                }

                else if (x === 2 || x === 5) {
                    board[[x, y]] = { left: x, top: y, type: "bishop", colour: opposite, moves: [] };
                }

                else if (x === 3) {
                    if (colourSide === "white") {
                        board[[x, y]] = { left: x, top: y, type: "queen", colour: opposite, moves: [] };
                    }

                    else {
                        board[[x, y]] = { left: x, top: y, type: "king", colour: opposite, moves: [], moved: false, obscure: [] };
                    }
                }

                else if (x === 4) {
                    if (colourSide === "black") {
                        board[[x, y]] = { left: x, top: y, type: "queen", colour: opposite, moves: [] };
                    }

                    else {
                        board[[x, y]] = { left: x, top: y, type: "king", colour: opposite, moves: [], moved: false, obscure: [] };
                    }
                }
            }

            else if (y === 6) {
                board[[x, y]] = { left: x, top: y, type: "pawn", colour: colourSide, moves: [], moved: false, obscure: [], prev: [] };
            }

            else if (y === 7) {
                if (x === 0 || x === 7) {
                    board[[x, y]] = { left: x, top: y, type: "rook", colour: colourSide, moves: [], moved: false };
                }

                else if (x === 1 || x === 6) {
                    board[[x, y]] = { left: x, top: y, type: "knight", colour: colourSide, moves: [] };
                }

                else if (x === 2 || x === 5) {
                    board[[x, y]] = { left: x, top: y, type: "bishop", colour: colourSide, moves: [] };
                }

                else if (x === 3) {
                    if (colourSide === "white") {
                        board[[x, y]] = { left: x, top: y, type: "queen", colour: colourSide, moves: [] };
                    }
                    else {
                        board[[x, y]] = { left: x, top: y, type: "king", colour: colourSide, moves: [], moved: false, obscure: [] };
                    }
                }

                else if (x === 4) {
                    if (colourSide === "black") {
                        board[[x, y]] = { left: x, top: y, type: "queen", colour: colourSide, moves: [] };
                    }
                    else {
                        board[[x, y]] = { left: x, top: y, type: "king", colour: colourSide, moves: [], moved: false, obscure: [] };
                    }
                }
            }

            else {
                board[[x, y]] = {};
            }
        }
    }

    // sets only the moves of the knights and pawns because those pieces
    // are the only ones with room to move in the beginning of the game
    fillBeginningMoves(board, colourSide);
    setPieces(board);
}

export function fillBeginningMoves(board, colourSide) {
    // sets the moves of the pawns and knights for the player of the colour
    // specified by the argument 'colourSide'
    for (let obj of Object.values(board)) {
        if (obj.type === "pawn") {
            obj.moves = pawnMoves([obj.left, obj.top], colourSide, board);
        }

        else if (obj.type === "knight") {
            obj.moves = knightMoves([obj.left, obj.top], board);
        }
    }
}

export function pawnMoves(pos, colourSide, board) {
    // determine the valid moves of the pawns which are of the colour specified by the
    // argument 'colourSide' as the colour of the pawns affects its direction of travel
    const x = pos[0];
    const y = pos[1];
    const output = [];

    if (colourSide === board[pos].colour) {
        // allows the pawn to move two steps ahead only at the game's start
        if (y === 6 && board[[x, y - 2]].colour === undefined && board[[x, y - 1]].colour === undefined) {
            output.push([x, y - 2]);
        }

        // deals with the pawn being able to move up one step
        if (y - 1 >= 0) {
            if (board[[x, y - 1]].colour === undefined) {
                output.push([x, y - 1]);
            }
            
            // below code determines when the pawn can move sideways to capture another pawn
            if (x - 1 >= 0) {
                if (board[[x - 1, y - 1]].colour !== colourSide && board[[x - 1, y - 1]].colour !== undefined) {
                    output.push([x - 1, y - 1]);
                }
            }

            if (x + 1 <= 7) {
                if (board[[x + 1, y - 1]].colour !== colourSide && board[[x + 1, y - 1]].colour !== undefined) {
                    output.push([x + 1, y - 1]);
                }
            }
        }
    }

    else {
        // allows the pawn to move two steps ahead only at the game's start
        if (y === 1 && board[[x, y + 2]].colour === undefined && board[[x, y + 1]].colour === undefined) {
            output.push([x, y + 2]);
        }

        // deals with the pawn being able to move up one step
        if (y + 1 <= 7) {
            if (board[[x, y + 1]].colour === undefined) {
                output.push([x, y + 1]);
            }

            // below code determines when the pawn can move sideways to kill another pawn
            if (x - 1 >= 0) {
                if (board[[x - 1, y + 1]].colour === colourSide && board[[x - 1, y + 1]].colour !== undefined) {
                    output.push([x - 1, y + 1]);
                }
            }

            if (x + 1 <= 7) {
                if (board[[x + 1, y + 1]].colour === colourSide && board[[x + 1, y + 1]].colour !== undefined) {
                    output.push([x + 1, y + 1]);
                }
            }
        }
    }

    return output;
}

export function knightMoves(pos, board) {
    const x = pos[0];
    const y = pos[1];
    const output = [];

    // below code calculates all the movements of a knight

    if (x + 1 <= 7 && y + 2 <= 7) {
        if (board[[x + 1, y + 2]].colour !== board[[x, y]].colour || board[[x + 1, y + 2]].colour === undefined) {
            output.push([x + 1, y + 2]);
        }
    }

    if (x + 2 <= 7 && y + 1 <= 7) {
        if (board[[x + 2, y + 1]].colour !== board[[x, y]].colour || board[[x + 2, y + 1]].colour === undefined) {
            output.push([x + 2, y + 1]);
        }
    }

    if (x - 2 >= 0 && y + 1 <= 7) {
        if (board[[x - 2, y + 1]].colour !== board[[x, y]].colour || board[[x - 2, y + 1]].colour === undefined) {
            output.push([x - 2, y + 1]);
        }
    }

    if (x - 1 >= 0 && y + 2 <= 7) {
        if (board[[x - 1, y + 2]].colour !== board[[x, y]].colour || board[[x - 1, y + 2]].colour === undefined) {
            output.push([x - 1, y + 2]);
        }
    }

    if (x - 1 >= 0 && y - 2 >= 0) {
        if (board[[x - 1, y - 2]].colour !== board[[x, y]].colour || board[[x - 1, y - 2]].colour === undefined) {
            output.push([x - 1, y - 2]);
        }
    }

    if (x + 1 <= 7 && y - 2 >= 0) {
        if (board[[x + 1, y - 2]].colour !== board[[x, y]].colour || board[[x + 1, y - 2]].colour === undefined) {
            output.push([x + 1, y - 2]);
        }
    }

    if (x + 2 <= 7 && y - 1 >= 0) {
        if (board[[x + 2, y - 1]].colour !== board[[x, y]].colour || board[[x + 2, y - 1]].colour === undefined) {
            output.push([x + 2, y - 1]);
        }
    }

    if (x - 2 >= 0 && y - 1 >= 0) {
        if (board[[x - 2, y - 1]].colour !== board[[x, y]].colour || board[[x - 2, y - 1]].colour === undefined) {
            output.push([x - 2, y - 1]);
        }
    }

    return output;
}

export function rookMoves(pos, board) {
    const output = [];

    var x = pos[0] - 1;
    // determines the horzontal (leftwards) movement of the rook
    while (x >= 0) {
        if (board[[x, pos[1]]].colour === undefined) {
            output.push([x, pos[1]]);
            x--;
        }

        else if (board[[x, pos[1]]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([x, pos[1]]);
            break;
        }

        else {
            break;
        }
    }

    x = pos[0] + 1;
    // determines the horizontal (rightwards) movements of the rook
    while (x <= 7) {
        if (board[[x, pos[1]]].colour === undefined) {
            output.push([x, pos[1]]);
            x++;
        }

        else if (board[[x, pos[1]]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([x, pos[1]]);
            break;
        }

        else {
            break;
        }
    }

    var y = pos[1] - 1;
    // determines the horizonal (upwards) movements of the rook
    while (y >= 0) {
        if (board[[pos[0], y]].colour === undefined) {
            output.push([pos[0], y]);
            y--;
        }

        else if (board[[pos[0], y]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([pos[0], y]);
            break;
        }

        else {
            break;
        }
    }

    y = pos[1] + 1;
    // determines the vertical (downward) movements of the rook
    while (y <= 7) {
        if (board[[pos[0], y]].colour === undefined) {
            output.push([pos[0], y]);
            y++;
        }

        else if (board[[pos[0], y]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([pos[0], y]);
            break;
        }

        else {
            break;
        }
    }

    return output;
}

export function bishopMoves(pos, board) {
    const output = [];

    var x = pos[0] + 1;
    var y = pos[1] + 1;
    // deals with diagonal (bottom right) movements of bishop
    while (x <= 7 && y <= 7) {
        if (board[[x, y]].colour === undefined) {
            output.push([x, y]);
            x++;
            y++;
        }

        else if (board[[x, y]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([x, y]);
            break;
        }

        else {
            break;
        }
    }

    x = pos[0] - 1;
    y = pos[1] + 1;
    // deals with diagonal (bottom left) movements of bishop
    while (x >= 0 && y <= 7) {
        if (board[[x, y]].colour === undefined) {
            output.push([x, y]);
            x--;
            y++;
        }

        else if (board[[x, y]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([x, y]);
            break;
        }

        else {
            break;
        }
    }

    x = pos[0] - 1;
    y = pos[1] - 1;
    // deals with diagonal (top left) movements of bishop
    while (x >= 0 && y >= 0) {
        if (board[[x, y]].colour === undefined) {
            output.push([x, y]);
            x--;
            y--;
        }

        else if (board[[x, y]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([x, y]);
            break;
        }

        else {
            break;
        }
    }

    x = pos[0] + 1;
    y = pos[1] - 1;
    // deals with diagonal (top right) movements of bishop
    while (x <= 7 && y >= 0) {
        if (board[[x, y]].colour === undefined) {
            output.push([x, y]);
            x++;
            y--;
        }

        else if (board[[x, y]].colour !== board[[pos[0], pos[1]]].colour) {
            output.push([x, y]);
            break;
        }

        else {
            break;
        }
    }

    return output;
}

export function queenMoves(pos, board) {
    // the queen's moves are just a combination of rook and bishop moves
    return bishopMoves(pos, board).concat(rookMoves(pos, board));
}

export function getMoves(board, colourSide) {
    // assign each piece on the board which of the colour equal to the argument 'colourSide' with their valid moves
    for (let piece of Object.values(board)) {
        if (piece.type === "pawn") {
            piece.moves = pawnMoves([piece.left, piece.top], colourSide, board);
        }

        else if (piece.type === "knight") {
            piece.moves = knightMoves([piece.left, piece.top], board);
        }

        else if (piece.type === "rook") {
            piece.moves = rookMoves([piece.left, piece.top], board);
        }

        else if (piece.type === "bishop") {
            piece.moves = bishopMoves([piece.left, piece.top], board);
        }

        else if (piece.type === "queen") {
            piece.moves = queenMoves([piece.left, piece.top], board);
        }

        else if (piece.type === "king") {
            piece.moves = kingMoves([piece.left, piece.top], board);
        }
    }
}

export function kingMoves(pos, board) {
    const output = [];
    const x = pos[0];
    const y = pos[1];

    // deals with the king's movements one step left, right, up and down

    if (x + 1 <= 7) {
        if (board[[x + 1, y]].colour !== board[pos].colour) {
            output.push([x + 1, y]);
        }
    }

    if (x - 1 >= 0) {
        if (board[[x - 1, y]].colour !== board[pos].colour) {
            output.push([x - 1, y]);
        }
    }

    if (y - 1 >= 0) {
        if (board[[x, y - 1]].colour !== board[pos].colour) {
            output.push([x, y - 1]);
        }
    }

    if (y + 1 <= 7) {
        if (board[[x, y + 1]].colour !== board[pos].colour) {
            output.push([x, y + 1]);
        }
    }

    if (x + 1 <= 7 && y + 1 <= 7) {
        if (board[[x + 1, y + 1]].colour !== board[pos].colour) {
            output.push([x + 1, y + 1]);
        }
    }

    if (x + 1 <= 7 && y - 1 >= 0) {
        if (board[[x + 1, y - 1]].colour !== board[pos].colour) {
            output.push([x + 1, y - 1]);
        }
    }

    if (x - 1 >= 0 && y + 1 <= 7) {
        if (board[[x - 1, y + 1]].colour !== board[pos].colour) {
            output.push([x - 1, y + 1]);
        }
    }

    if (x - 1 >= 0 && y - 1 >= 0) {
        if (board[[x - 1, y - 1]].colour !== board[pos].colour) {
            output.push([x - 1, y - 1]);
        }
    }

    return output;
}

export function castling(board, colourSide) {
    // Determines the conditions for when a king and rook can castle
    var playerKing = undefined;
    var otherKing = undefined;

    // gets the objects of both kings on the board
    for (let piece of Object.values(board)) {
        if (piece.colour === colourSide && piece.type === "king") {
            playerKing = piece;
        }

        else if (piece.colour !== colourSide && piece.type === "king") {
            otherKing = piece;
        }
    }

    if (playerKing !== undefined) {
        playerKing.obscure = [];

        // kings can only castle if they have never moved and never been checked
        if (playerKing.moved === false) {
            if (playerKing.colour === "white" && kingChecked(board, "white") === false) {
                // check that there are no pieces between the player's king and rook on the left side of board and that the rook on the left has never moved
                if (board[[0, 7]].moved === false && board[[1, 7]].moves === undefined && board[[2, 7]].moves === undefined && board[[3, 7]].moves === undefined) {
                    // append the position of the king if it were to castle to the left
                    playerKing.obscure.push([2, 7]);
                }

                // check that there are no pieces between the player's king and rook on the right side of board and that the rook on the right has never moved
                if (board[[7, 7]].moved === false && board[[5, 7]].moves === undefined && board[[6, 7]].moves === undefined) {
                    // append the position of the king if it were to castle to the right
                    playerKing.obscure.push([6, 7]);
                }
            }

            // apply similar logic but if the player's king was black
            else if (playerKing.colour === "black" && kingChecked(board, "black") === false) {
                if (board[[0, 7]].moved === false && board[[1, 7]].moves === undefined && board[[2, 7]].moves === undefined) {
                    playerKing.obscure.push([1, 7]);
                }

                if (board[[7, 7]].moved === false && board[[4, 7]].moves === undefined && board[[5, 7]].moves === undefined && board[[6, 7]].moves === undefined) {
                    playerKing.obscure.push([5, 7]);
                }
            }
        }
    }

    // applies similar logic to above but to the king at the top of the board
    if (otherKing !== undefined) {
        otherKing.obscure = [];

        if (otherKing.moved === false) {
            if (otherKing.colour === "black" && kingChecked(board, "black") === false) {
                if (board[[0, 0]].moved === false && board[[1, 0]].moves === undefined && board[[2, 0]].moves === undefined && board[[3, 0]].moves === undefined) {
                    otherKing.obscure.push([2, 0]);
                }

                if (board[[7, 0]].moved === false && board[[5, 0]].moves === undefined && board[[6, 0]].moves === undefined) {
                    otherKing.obscure.push([6, 0]);
                }
            }

            else if (otherKing.colour === "white" && kingChecked(board, "white") === false) {
                if (board[[0, 0]].moved === false && board[[1, 0]].moves === undefined && board[[2, 0]].moves === undefined) {
                    otherKing.obscure.push([1, 0]);
                }

                if (board[[7, 0]].moved === false && board[[4, 0]].moves === undefined && board[[5, 0]].moves === undefined && board[[6, 0]].moves === undefined) {
                    otherKing.obscure.push([5, 0]);
                }
            }
        }
    }
}

export function executeCastling(pos, move, board) {
    const pieces = structuredClone(board);
    // given pos represents the position of the king, deal with 
    // the movement of the rook and king should it castle to the
    // left or right

    if (pos[1] === 7) {
        if (move[0] < pos[0]) {
            pieces[move] = pieces[pos];
            pieces[move].moved = true;
            pieces[pos] = {};
            pieces[move].left = move[0];
            pieces[[move[0] + 1, move[1]]] = pieces[[0, 7]];
            pieces[[move[0] + 1, move[1]]].moved = true;
            pieces[[0, 7]] = {};
            pieces[[move[0] + 1, move[1]]].left = move[0] + 1;
        }

        else {
            pieces[move] = pieces[pos];
            pieces[move].moved = true;
            pieces[pos] = {};
            pieces[move].left = move[0]
            pieces[[move[0] - 1, move[1]]] = pieces[[7, 7]];
            pieces[[move[0] - 1, move[1]]].moved = true;
            pieces[[7, 7]] = {};
            pieces[[move[0] - 1, move[1]]].left = move[0] - 1;
        }
    }

    else if (pos[1] === 0) {
        if (move[0] < pos[0]) {
            pieces[move] = pieces[pos];
            pieces[move].moved = true;
            pieces[pos] = {};
            pieces[move].left = move[0];
            pieces[[move[0] + 1, move[1]]] = pieces[[0, 0]];
            pieces[[move[0] + 1, move[1]]].moved = true;
            pieces[[0, 0]] = {};
            pieces[[move[0] + 1, move[1]]].left = move[0] + 1;
        }

        else {
            pieces[move] = pieces[pos];
            pieces[move].moved = true;
            pieces[pos] = {};
            pieces[move].left = move[0]
            pieces[[move[0] - 1, move[1]]] = pieces[[7, 0]];
            pieces[[move[0] - 1, move[1]]].moved = true;
            pieces[[7, 0]] = {};
            pieces[[move[0] - 1, move[1]]].left = move[0] - 1;
        }
    }

    return pieces;
}

export function enPassant(board) {
    // determines when a pawn can execute en passant, a special pawn move where
    // a pawn moves two squares forward from its starting position on its initial move and the
    // opponent has a pawn on an adjacent file and moves that pawn forward two squares from its starting position
    // then the player with the first pawn has the option, to capture the opponent's pawn

    for (let coor of Object.keys(board)) {
        const piece = board[coor];
        const x = parseInt(coor.split(",")[0]);
        const y = parseInt(coor.split(",")[1]);

        if (piece.type === "pawn") {
            piece.obscure = [];
        }

        if (piece.type === "pawn" && piece.top === 3) {
            if (x - 1 >= 0) {
                if (board[[x - 1, y]].colour !== piece.colour && board[[x - 1, y]].type === "pawn") {
                    if (board[[x - 1, y]].prev !== undefined) {
                        if (board[[x - 1, y]].prev[1] === 6) {
                            piece.obscure.push([x - 1, 2]);
                        }
                    }
                }
            }

            if (x + 1 <= 7) {
                if (board[[x + 1, y]].colour !== piece.colour && board[[x + 1, y]].type === "pawn") {
                    if (board[[x + 1, y]].prev !== undefined) {
                        if (board[[x + 1, y]].prev[1] === 6) {
                            piece.obscure.push([x + 1, 2]);
                        }
                    }
                }
            }
        }

        else if (piece.type === "pawn" && piece.top === 4) {
            if (x - 1 >= 0) {
                if (board[[x - 1, y]].colour !== piece.colour && board[[x - 1, y]].type === "pawn") {
                    if (board[[x - 1, y]].prev !== undefined) {
                        if (board[[x - 1, y]].prev[1] === 1) {
                            piece.obscure.push([x - 1, 5]);
                        }
                    }
                }
            }

            if (x + 1 <= 7) {
                if (board[[x + 1, y]].colour !== piece.colour && board[[x + 1, y]].type === "pawn") {
                    if (board[[x + 1, y]].prev !== undefined) {
                        if (board[[x + 1, y]].prev[1] === 1) {
                            piece.obscure.push([x + 1, 5]);
                        }
                    }
                }
            }
        }
    }
}

export function executeEnPassant(pos, move, board) {
    // executes en passant and returns the new board in the aftermath of the en passant
    const pieces = structuredClone(board);

    pieces[move] = pieces[pos];
    pieces[move].left = move[0];
    pieces[move].top = move[1];
    pieces[pos] = {};
    if (move[1] > pos[1]) {
        pieces[[move[0], move[1] - 1]] = {};
    }
    else {
        pieces[[move[0], move[1] + 1]] = {};
    }

    return pieces;
}

export function checkMoveThreatensKing(pos, move, colourSide, board) {
    // deals with the special case of whether a move by a piece could lead to
    // their king being threatened by another piece. For example, if a rook is
    // pinned to their King by an enemy bishop, the rook is not allowed to move anywhere
    const copy = structuredClone(board);

    // first a clone of the board is created and the move specified by the 'move' argument
    // is performed on the piece at the position specified by 'pos'. then the moves of all
    // pieces are calculated

    copy[move] = copy[pos];
    copy[move].left = move[0];
    copy[move].top = move[1];
    copy[pos] = {};

    getMoves(copy, colourSide);

    var king = undefined;
    // find the player's king
    for (let piece of Object.values(copy)) {
        if (piece.colour === board[pos].colour && piece.type === "king") {
            king = piece;
            break;
        }
    }

    // if one of pieces of the other side has a move which allows it to capture the king
    // then the move specified in the arguments is to be considered invalid
    if (king !== undefined) {
        for (let piece of Object.values(copy)) {
            if (piece.colour !== board[pos].colour && piece.colour !== undefined) {
                const moves = piece.moves.map(val => val[0] + ',' + val[1]);
                if (moves.indexOf(king.left + ',' + king.top) !== -1) {
                    return true;
                }
            }
        }
    }

    return false;
}

export function validateMoves(board, colourSide) {
    // checks whether all the moves by the player of the colour specifed by 'colourSide'
    // are actually valid when applying the rules of checkMoveThreatensKing
    for (let piece of Object.values(board)) {
        if (piece.moves !== undefined) {
            for (let index = piece.moves.length - 1; index >= 0; index--) {
                const move = piece.moves[index];
                if (checkMoveThreatensKing([piece.left, piece.top], move, colourSide, board)) {
                    piece.moves.splice(index, 1);
                }
            }
        }
    }
}

export function promotePawn(img, board, coordinates, setState) {
    // sets the new board after the pawn has been promoted
    const copy = structuredClone(board);
    copy[coordinates].type = img.title;
    setState(copy);
}

export function kingChecked(board, side) {
    // checks whether the black or white kings have been checked depending on the side argument
    // if side is white then check if the white king has been checked otherwise check black
    var whiteKing = undefined;
    var blackKing = undefined;

    for (let piece of Object.values(board)) {
        if (piece.type === "king" && piece.colour === "black" && side === "black") {
            blackKing = piece;
        }

        else if (piece.type === "king" && piece.colour === "white" && side === "white") {
            whiteKing = piece;
        }
    }

    // checks whether one of the pieces is in a position where it can capture the king on
    // the next move assuming that the other side does nothing to prevent capture
    // if true then that means the king has been checked 
    for (let piece of Object.values(board)) {
        if (piece.moves !== undefined) {
            const moves = piece.moves.map(val => val[0] + "," + val[1]);
            if (side === "white" && piece.colour === "black") {
                if (moves.indexOf(whiteKing.left + "," + whiteKing.top) !== -1) {
                    return true;
                }
            }

            else if (side === "black" && piece.colour === "white") {
                if (moves.indexOf(blackKing.left + "," + blackKing.top) !== -1) {
                    return true;
                }
            }
        }
    }

    return false;
}

export function checkMate(board, side) {
    // a king of the colour specified by the argument side is considered check mated 
    // when the king is checked and there are no valid moves left for the king's pieces
    for (let piece of Object.values(board)) {
        if (piece.colour === side && piece.moves.length > 0) {
            return false;
        }
    }

    if (kingChecked(board, side)) {
        return true;
    }

    return false;
}

export function draw(board, side) {
    // checks whether the chess game has been drawn
    var count = 0;

    for (let piece of Object.values(board)) {
        if (piece.type !== undefined) {
            count++;
        }
    }

    // if there are only two pieces left on the board (one black and white king)
    // then that means the game is drawn
    if (count === 2) {
        return true;
    }

    // if there are still valid moves left for the player of colour specified by
    // the argument 'side' then the game is not drawn yet
    for (let piece of Object.values(board)) {
        if (piece.colour === side && piece.moves.length > 0) {
            return false;
        }
    }

    // if the king has not been drawned but there are no valid moves left by the
    // player of 'side' then the game is also drawn
    if (!kingChecked(board, side)) {
        return true;
    }

    return false;
}