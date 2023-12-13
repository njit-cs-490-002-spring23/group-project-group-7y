import axios from 'axios';
import { API_CONNECTION_ERROR, } from '../../types/CoveyTownSocket.d';
import { databaseUpdate } from './database/chessDatabase';
import Game from './Game';
import InvalidParametersError from '../../lib/InvalidParametersError';
export const CHESS_BOARD_SIZE = 8;
export default class ChessGame extends Game {
    constructor() {
        super({
            board: [[]],
            moves: [],
            status: 'WAITING_TO_START',
            halfMoves: 0,
        });
        this.initializeChessBoard();
    }
    _fileToColumn(file) {
        return file.charCodeAt(0) - 'a'.charCodeAt(0);
    }
    _rankToRow(rank) {
        return CHESS_BOARD_SIZE - rank;
    }
    _columnToFile(columnIndex) {
        return String.fromCharCode(columnIndex + 'a'.charCodeAt(0));
    }
    _rowToRank(rowIndex) {
        return (CHESS_BOARD_SIZE - rowIndex);
    }
    _whoseTurn() {
        return this.state.moves.length % 2 === 0 ? 'W' : 'B';
    }
    _playerColor(player) {
        if (this.state.white === player) {
            return 'W';
        }
        return 'B';
    }
    fenNotation() {
        let fen = '';
        let emptySquareCount = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const currentCell = this.state.board[i][j];
                if (!currentCell) {
                    emptySquareCount++;
                }
                else {
                    if (emptySquareCount > 0) {
                        fen += emptySquareCount;
                        emptySquareCount = 0;
                    }
                    if (currentCell.piece.pieceColor === 'W') {
                        const fenPiece = currentCell.piece.pieceType;
                        fen += fenPiece;
                    }
                    else {
                        const fenPiece = currentCell.piece.pieceType?.toLowerCase();
                        fen += fenPiece;
                    }
                }
            }
            if (emptySquareCount > 0) {
                fen += emptySquareCount;
                emptySquareCount = 0;
            }
            if (i < 8 - 1) {
                fen += '/';
            }
        }
        fen += ` ${this._whoseTurn().toLowerCase()} `;
        let noCastlingPossible = true;
        if (this.canCastle('W', 'K')) {
            fen += 'K';
            noCastlingPossible = false;
        }
        if (this.canCastle('W', 'K')) {
            fen += 'Q';
            noCastlingPossible = false;
        }
        if (this.canCastle('B', 'K')) {
            fen += 'k';
            noCastlingPossible = false;
        }
        if (this.canCastle('B', 'Q')) {
            fen += 'q';
            noCastlingPossible = false;
        }
        if (noCastlingPossible) {
            fen += '-';
        }
        fen += ' ';
        const lastMove = this.state.moves.at(-1);
        if (lastMove && this._fenEnPassant(lastMove)) {
            if (lastMove.gamePiece.pieceColor === 'W') {
                fen += `${lastMove.destinationFile}3 `;
            }
            else
                fen += `${lastMove.destinationFile}6 `;
        }
        else
            fen += '- ';
        fen += `${this.state.halfMoves} `;
        fen += `${Math.floor(this.state.moves.length / 2) + 1}`;
        return fen;
    }
    _fenEnPassant(move) {
        if (Math.abs(move.currentRank - move.destinationRank) === 2) {
            return true;
        }
        return false;
    }
    async nextBestMove() {
        const apiEndpoint = 'https://stockfish.online/api/stockfish.php';
        const requestURL = `${apiEndpoint}?fen=${encodeURIComponent(this.fenNotation())}&depth=10&mode=bestmove`;
        return axios
            .get(requestURL)
            .then(response => {
            const { data } = response.data;
            const curFile = data[9];
            const curRank = parseInt(data[10], 10);
            const destFile = data[11];
            const destRank = parseInt(data[12], 10);
            const pieceRow = this._rankToRow(curRank);
            const pieceCol = this._fileToColumn(curFile);
            const piece = this.state.board[pieceRow][pieceCol]?.piece.pieceType;
            return {
                gamePiece: piece,
                currentRank: curRank,
                currentFile: curFile,
                destinationRank: destRank,
                destinationFile: destFile,
            };
        })
            .catch(() => {
            throw new Error(API_CONNECTION_ERROR);
        });
    }
    processAndAddMoves(currentRank, currentFile, gamePiece, possibleMoves, rowDisplacement, colDisplacement, processOnce) {
        const { board } = this.state;
        const rowIndex = this._rankToRow(currentRank);
        const colIndex = this._fileToColumn(currentFile);
        let moveRowIndex = rowIndex + rowDisplacement;
        let moveColIndex = colIndex + colDisplacement;
        while (this._validIndex(moveRowIndex, moveColIndex)) {
            if (board[moveRowIndex][moveColIndex] === undefined) {
                const possibleMove = {
                    gamePiece,
                    currentRank,
                    currentFile,
                    destinationFile: this._columnToFile(moveColIndex),
                    destinationRank: this._rowToRank(moveRowIndex),
                };
                possibleMoves.push(possibleMove);
            }
            else if (board[moveRowIndex][moveColIndex]?.piece.pieceColor !== gamePiece.pieceColor) {
                const possibleMove = {
                    gamePiece,
                    currentRank,
                    currentFile,
                    destinationFile: this._columnToFile(moveColIndex),
                    destinationRank: this._rowToRank(moveRowIndex),
                };
                possibleMoves.push(possibleMove);
            }
            else if (board[moveRowIndex][moveColIndex]?.piece.pieceColor === gamePiece.pieceColor) {
                break;
            }
            if (processOnce && processOnce === true) {
                break;
            }
            moveRowIndex += rowDisplacement;
            moveColIndex += rowDisplacement;
        }
    }
    _opponentColor(color) {
        return color === 'W' ? 'B' : 'W';
    }
    possibleMoves(rank, file, tempBoard) {
        let board;
        if (tempBoard) {
            board = tempBoard;
        }
        else {
            board = this.state.board;
        }
        const possibleMoves = [];
        const rowIndex = this._rankToRow(rank);
        const colIndex = this._fileToColumn(file);
        const chessSquare = board[rowIndex][colIndex];
        switch (chessSquare?.piece.pieceType) {
            case 'K': {
                const kingMoves = [
                    { row: -1, col: 0 },
                    { row: 1, col: 0 },
                    { row: 0, col: 1 },
                    { row: 0, col: -1 },
                    { row: -1, col: 1 },
                    { row: -1, col: -1 },
                    { row: 1, col: 1 },
                    { row: 1, col: -1 },
                ];
                for (let i = 0; i < kingMoves.length; i++) {
                    const path = kingMoves[i];
                    this.processAndAddMoves(rank, file, chessSquare.piece, possibleMoves, path.row, path.col, true);
                }
                if (this.canCastle(chessSquare.piece.pieceColor, 'K')) {
                    if (board[rowIndex][colIndex + 1] === undefined &&
                        board[rowIndex][colIndex + 2] === undefined &&
                        !this.underAttack(rowIndex, colIndex + 1, this._opponentColor(chessSquare.piece.pieceColor)) &&
                        !this.underAttack(rowIndex, colIndex + 2, this._opponentColor(chessSquare.piece.pieceColor))) {
                        const possibleMove = {
                            gamePiece: chessSquare.piece,
                            currentRank: rank,
                            currentFile: file,
                            destinationFile: this._columnToFile(colIndex + 2),
                            destinationRank: this._rowToRank(rowIndex),
                        };
                        possibleMoves.push(possibleMove);
                    }
                }
                if (this.canCastle(chessSquare.piece.pieceColor, 'Q')) {
                    if (board[rowIndex][colIndex - 1] === undefined &&
                        board[rowIndex][colIndex - 2] === undefined &&
                        board[rowIndex][colIndex - 3] === undefined &&
                        !this.underAttack(rowIndex, colIndex - 1, this._opponentColor(chessSquare.piece.pieceColor)) &&
                        !this.underAttack(rowIndex, colIndex + 2, this._opponentColor(chessSquare.piece.pieceColor))) {
                        const possibleMove = {
                            gamePiece: chessSquare.piece,
                            currentRank: rank,
                            currentFile: file,
                            destinationFile: this._columnToFile(colIndex - 2),
                            destinationRank: this._rowToRank(rowIndex),
                        };
                        possibleMoves.push(possibleMove);
                    }
                }
                break;
            }
            case 'Q': {
                const queenInitialMoves = [
                    { row: -1, col: 0 },
                    { row: 1, col: 0 },
                    { row: 0, col: 1 },
                    { row: 0, col: -1 },
                    { row: -1, col: 1 },
                    { row: -1, col: -1 },
                    { row: 1, col: 1 },
                    { row: 1, col: -1 },
                ];
                for (let i = 0; i < queenInitialMoves.length; i++) {
                    const path = queenInitialMoves[i];
                    this.processAndAddMoves(rank, file, chessSquare.piece, possibleMoves, path.row, path.col);
                }
                break;
            }
            case 'R': {
                const rookInitialMoves = [
                    { row: -1, col: 0 },
                    { row: 1, col: 0 },
                    { row: 0, col: 1 },
                    { row: 0, col: -1 },
                ];
                for (let i = 0; i < rookInitialMoves.length; i++) {
                    const path = rookInitialMoves[i];
                    this.processAndAddMoves(rank, file, chessSquare.piece, possibleMoves, path.row, path.col);
                }
                break;
            }
            case 'B': {
                const rookInitialMoves = [
                    { row: -1, col: 1 },
                    { row: -1, col: -1 },
                    { row: 1, col: 1 },
                    { row: 1, col: -1 },
                ];
                for (let i = 0; i < rookInitialMoves.length; i++) {
                    const path = rookInitialMoves[i];
                    this.processAndAddMoves(rank, file, chessSquare.piece, possibleMoves, path.row, path.col);
                }
                break;
            }
            case 'N': {
                const knightMoves = [
                    { row: -2, col: -1 },
                    { row: -2, col: 1 },
                    { row: -1, col: -2 },
                    { row: -1, col: 2 },
                    { row: 2, col: -1 },
                    { row: 2, col: 1 },
                    { row: 1, col: -2 },
                    { row: 1, col: -2 },
                ];
                for (let i = 0; i < knightMoves.length; i++) {
                    const path = knightMoves[i];
                    this.processAndAddMoves(rank, file, chessSquare.piece, possibleMoves, path.row, path.col, true);
                }
                break;
            }
            case 'P': {
                const pawnMoves = [
                    { row: -1, col: -1, type: 'C', color: 'W' },
                    { row: -1, col: 1, type: 'C', color: 'W' },
                    { row: -1, col: 0, type: 'N', color: 'W' },
                    { row: -2, col: 0, type: 'F', color: 'W' },
                    { row: 1, col: -1, type: 'C', color: 'B' },
                    { row: 1, col: 1, type: 'C', color: 'B' },
                    { row: 1, col: 0, type: 'N', color: 'B' },
                    { row: 2, col: 0, type: 'F', color: 'B' },
                ];
                for (let i = 0; i < pawnMoves.length; i++) {
                    const path = pawnMoves[i];
                    if (path.color === chessSquare.piece.pieceColor) {
                        const pawanMoveRowIndex = rowIndex + path.row;
                        const pawnMoveColIndex = colIndex + path.col;
                        if (this._validIndex(pawanMoveRowIndex, pawnMoveColIndex)) {
                            if (path.type === 'F' && chessSquare.piece.moved === false) {
                                const possibleMove = {
                                    gamePiece: chessSquare.piece,
                                    currentRank: rank,
                                    currentFile: file,
                                    destinationFile: this._columnToFile(pawnMoveColIndex),
                                    destinationRank: this._rowToRank(pawanMoveRowIndex),
                                };
                                possibleMoves.push(possibleMove);
                            }
                            else if (path.type === 'N' &&
                                board[pawanMoveRowIndex][pawnMoveColIndex] === undefined) {
                                const possibleMove = {
                                    gamePiece: chessSquare.piece,
                                    currentRank: rank,
                                    currentFile: file,
                                    destinationFile: this._columnToFile(pawnMoveColIndex),
                                    destinationRank: this._rowToRank(pawanMoveRowIndex),
                                };
                                possibleMoves.push(possibleMove);
                            }
                            else if (path.type === 'C') {
                                if (board[pawanMoveRowIndex][pawnMoveColIndex] !== undefined &&
                                    board[pawanMoveRowIndex][pawnMoveColIndex]?.piece.pieceColor !==
                                        chessSquare.piece.pieceColor) {
                                    const possibleMove = {
                                        gamePiece: chessSquare.piece,
                                        currentRank: rank,
                                        currentFile: file,
                                        destinationFile: this._columnToFile(pawnMoveColIndex),
                                        destinationRank: this._rowToRank(pawanMoveRowIndex),
                                    };
                                    possibleMoves.push(possibleMove);
                                }
                                else if (this.state.moves[this.state.moves.length - 1] &&
                                    this._fenEnPassant(this.state.moves[this.state.moves.length - 1]) &&
                                    this._fileToColumn(this.state.moves[this.state.moves.length - 1].destinationFile) === pawnMoveColIndex &&
                                    this._rankToRow(this.state.moves[this.state.moves.length - 1].destinationRank) +
                                        1 ===
                                        pawanMoveRowIndex) {
                                    const possibleMove = {
                                        gamePiece: chessSquare.piece,
                                        currentRank: rank,
                                        currentFile: file,
                                        destinationFile: this._columnToFile(pawnMoveColIndex),
                                        destinationRank: this._rowToRank(pawanMoveRowIndex),
                                    };
                                    possibleMoves.push(possibleMove);
                                }
                            }
                        }
                    }
                }
                break;
            }
            default: {
                return [];
            }
        }
        return possibleMoves;
    }
    applyMove(_move) {
        if ((this.state.moves.length % 2 === 0 && _move.playerID !== this.state.white) ||
            (this.state.moves.length % 2 === 1 && _move.playerID !== this.state.black)) {
            throw new InvalidParametersError('Not Your Turn');
        }
        if (this._validateGamePieceMovement(_move)) {
            const updateValidMovesToGameState = [...this.state.moves, _move.move];
            this.state.moves = updateValidMovesToGameState;
            this.state.board[_move.move.destinationRank - 1][this._fileToIndex(_move.move.destinationFile)] = {
                piece: {
                    pieceColor: _move.move.gamePiece.pieceColor,
                    pieceType: _move.move.gamePiece.pieceType,
                    moved: true,
                },
            };
            this.state.board[_move.move.currentRank - 1][this._fileToIndex(_move.move.currentFile)] =
                undefined;
        }
        else {
            throw new InvalidParametersError('Invalid Move');
        }
    }
    _checkChessCells(currRank, currFile, destRank, destFile, playerColor) {
        while (currRank !== destRank || currFile !== destFile) {
            if (currRank !== destRank) {
                currRank = currRank < destRank ? currRank + 1 : currRank - 1;
            }
            if (currFile !== destFile) {
                currFile = currFile < destFile ? currFile + 1 : currFile - 1;
            }
            if (currRank !== destRank && currFile !== destFile) {
                if (this.state.board[currRank][currFile] !== undefined) {
                    return 'Pieces in the way of movement';
                }
            }
            else {
                if (this.state.board[currRank][currFile] === undefined) {
                    return 'Empty';
                }
                if (this.state.board[currRank][currFile]?.piece.pieceColor === playerColor) {
                    return 'Your piece is in the way';
                }
                return 'Capture Possible';
            }
        }
        return 'Error';
    }
    _validateGamePieceMovement(move) {
        const shiftNeededForBoardArray = 1;
        const minimumValueForBoard = 0;
        const maximumValueForBoard = 7;
        const chessPiece = move.move.gamePiece.pieceType;
        const currInRank = move.move.currentRank - shiftNeededForBoardArray;
        const destToRank = move.move.destinationRank - shiftNeededForBoardArray;
        const chessPieceColor = move.move.gamePiece.pieceColor;
        const destFileNumber = this._fileToIndex(move.move.destinationFile);
        const currFileNumber = this._fileToIndex(move.move.currentFile);
        let result;
        let diffRank;
        let diffFile;
        let playerColor;
        if (move.playerID === this.state.white) {
            playerColor = 'W';
            if (chessPieceColor !== 'W') {
                throw new InvalidParametersError('Player 1 can only move white pieces');
            }
        }
        else {
            playerColor = 'B';
            if (chessPieceColor !== 'B') {
                throw new InvalidParametersError('Player 2 can only move black pieces');
            }
        }
        if (destFileNumber < minimumValueForBoard ||
            destFileNumber > maximumValueForBoard ||
            currFileNumber < minimumValueForBoard ||
            currFileNumber > maximumValueForBoard ||
            destToRank < minimumValueForBoard ||
            destToRank > maximumValueForBoard ||
            currInRank < minimumValueForBoard ||
            currInRank > maximumValueForBoard) {
            return false;
        }
        if (this.state.board[currInRank][currFileNumber]?.piece.pieceType !==
            move.move.gamePiece.pieceType) {
            return false;
        }
        switch (chessPiece) {
            case 'P':
                if ((currInRank === 1 && destToRank === currInRank + 2 && playerColor === 'W') ||
                    (currInRank === 6 && destToRank === currInRank - 2 && playerColor === 'B')) {
                    if (destFileNumber !== currFileNumber) {
                        return false;
                    }
                    result = this._checkChessCells(currInRank, currFileNumber, destToRank, destFileNumber, playerColor);
                    if (result === 'Empty') {
                        return true;
                    }
                    return false;
                }
                if ((destToRank === currInRank + 1 && playerColor === 'W') ||
                    (destToRank === currInRank - 1 && playerColor === 'B')) {
                    result = this._checkChessCells(currInRank, currFileNumber, destToRank, destFileNumber, playerColor);
                    if (destFileNumber === currFileNumber - 1 || destFileNumber === currFileNumber + 1) {
                        if (result === 'Empty') {
                            if (this.state.moves.length === 0) {
                                return false;
                            }
                            if (this.canEnPassant(this.state.moves[this.state.moves.length - 1], move.move)) {
                                this.state.board[destToRank - 1][destFileNumber] = undefined;
                                return true;
                            }
                            return false;
                        }
                        if (result === 'Capture Possible') {
                            return true;
                        }
                        return false;
                    }
                    if (result === 'Empty') {
                        return true;
                    }
                    return false;
                }
                break;
            case 'N':
                if (((destToRank === currInRank + 1 || destToRank === currInRank - 1) &&
                    (destFileNumber === currFileNumber + 2 || destFileNumber === currFileNumber - 2)) ||
                    ((destFileNumber === currFileNumber + 1 || destFileNumber === currFileNumber - 1) &&
                        (destToRank === currInRank + 2 || destToRank === currInRank - 2))) {
                    if (this.state.board[destToRank][destFileNumber]?.piece.pieceColor === playerColor) {
                        return false;
                    }
                    return true;
                }
                break;
            case 'B':
                if (destFileNumber !== currFileNumber && destToRank !== currInRank) {
                    if (destFileNumber > currFileNumber) {
                        diffFile = destFileNumber - currFileNumber;
                    }
                    else {
                        diffFile = currFileNumber - destFileNumber;
                    }
                    if (destToRank > currInRank) {
                        diffRank = destToRank - currInRank;
                    }
                    else {
                        diffRank = currInRank - destToRank;
                    }
                    if (diffRank !== diffFile) {
                        return false;
                    }
                    result = this._checkChessCells(currInRank, currFileNumber, destToRank, destFileNumber, playerColor);
                    if (result === 'Empty' || result === 'Capture Possible') {
                        return true;
                    }
                    return false;
                }
                break;
            case 'K':
                if ((destFileNumber === currFileNumber &&
                    (destToRank === currInRank + 1 || destToRank === currInRank - 1)) ||
                    (destToRank === currInRank &&
                        (destFileNumber === currFileNumber + 1 || destFileNumber === currFileNumber - 1)) ||
                    ((destFileNumber === currFileNumber + 1 || destFileNumber === currFileNumber - 1) &&
                        (destToRank === currInRank + 1 || destToRank === currInRank - 1))) {
                    const val2 = this._checkChessCells(currInRank, currFileNumber, destToRank, destFileNumber, playerColor);
                    if (val2 === 'Empty' || val2 === 'Piece on the board') {
                        return true;
                    }
                }
                return false;
            case 'Q':
                if (destFileNumber > currFileNumber) {
                    diffFile = destFileNumber - currFileNumber;
                }
                else {
                    diffFile = currFileNumber - destFileNumber;
                }
                if (destToRank > currInRank) {
                    diffRank = destToRank - currInRank;
                }
                else {
                    diffRank = currInRank - destToRank;
                }
                if ((destToRank === currInRank && destFileNumber !== currFileNumber) ||
                    (destFileNumber === currFileNumber && destToRank !== currFileNumber)) {
                    result = this._checkChessCells(currInRank, currFileNumber, destToRank, destFileNumber, playerColor);
                    if (result === 'Empty' || result === 'Capture Possible') {
                        return true;
                    }
                }
                if (destFileNumber !== currFileNumber && destToRank !== currInRank) {
                    if (diffFile !== diffRank) {
                        return false;
                    }
                    result = this._checkChessCells(currInRank, currFileNumber, destToRank, destFileNumber, playerColor);
                    if (result === 'Empty' || result === 'Capture Possible') {
                        return true;
                    }
                }
                break;
            case 'R':
                if ((destToRank === currInRank && destFileNumber !== currFileNumber) ||
                    (destFileNumber === currFileNumber && destToRank !== currInRank)) {
                    result = this._checkChessCells(currInRank, currFileNumber, destToRank, destFileNumber, playerColor);
                    if (result === 'Empty' || result === 'Capture Possible') {
                        return true;
                    }
                    return false;
                }
                break;
            default:
                return false;
        }
        return false;
    }
    _join(player) {
        if (this._players.length === 0) {
            this.state.white = player.id;
            this.state.status = 'WAITING_TO_START';
        }
        if (this._players.length === 1) {
            this.state.black = player.id;
            this.state.status = 'IN_PROGRESS';
        }
        if (this._players.length >= 2) {
            if (this.state.white === player.id || this.state.black === player.id) {
                throw new InvalidParametersError('PLAYER_ALREADY_IN_GAME_MESSAGE');
            }
            throw new InvalidParametersError('GAME_FULL_MESSAGE');
        }
    }
    _leave(_player) { }
    updateChessBoard(move) {
        const updatedBoard = [];
        for (let i = 0; i < CHESS_BOARD_SIZE; i++) {
            updatedBoard.push(Array(8).fill(undefined));
            for (let j = 0; j < CHESS_BOARD_SIZE; j++) {
                const currentCell = this.state.board[i][j];
                let updatedCell;
                if (i === this._rankToRow(move.destinationRank) &&
                    j === this._fileToColumn(move.destinationFile)) {
                    updatedCell = {
                        piece: move.gamePiece,
                    };
                    updatedBoard[i][j] = updatedCell;
                }
                else if (currentCell) {
                    updatedCell = {
                        piece: {
                            pieceType: currentCell.piece.pieceType,
                            pieceColor: currentCell.piece.pieceColor,
                            moved: true,
                        },
                    };
                    updatedBoard[i][j] = updatedCell;
                }
            }
        }
        this.state.board = updatedBoard;
    }
    initializeChessBoard() {
        const board = Array(8)
            .fill(undefined)
            .map(() => Array(8).fill(undefined));
        const fileToIndex = (file) => file.charCodeAt(0) - 'a'.charCodeAt(0);
        const initialPositions = {
            a1: { pieceType: 'R', pieceColor: 'W', moved: false },
            b1: { pieceType: 'N', pieceColor: 'W', moved: false },
            c1: { pieceType: 'B', pieceColor: 'W', moved: false },
            d1: { pieceType: 'Q', pieceColor: 'W', moved: false },
            e1: { pieceType: 'K', pieceColor: 'W', moved: false },
            f1: { pieceType: 'B', pieceColor: 'W', moved: false },
            g1: { pieceType: 'N', pieceColor: 'W', moved: false },
            h1: { pieceType: 'R', pieceColor: 'W', moved: false },
            a2: { pieceType: 'P', pieceColor: 'W', moved: false },
            b2: { pieceType: 'P', pieceColor: 'W', moved: false },
            c2: { pieceType: 'P', pieceColor: 'W', moved: false },
            d2: { pieceType: 'P', pieceColor: 'W', moved: false },
            e2: { pieceType: 'P', pieceColor: 'W', moved: false },
            f2: { pieceType: 'P', pieceColor: 'W', moved: false },
            g2: { pieceType: 'P', pieceColor: 'W', moved: false },
            h2: { pieceType: 'P', pieceColor: 'W', moved: false },
            a7: { pieceType: 'P', pieceColor: 'B', moved: false },
            b7: { pieceType: 'P', pieceColor: 'B', moved: false },
            c7: { pieceType: 'P', pieceColor: 'B', moved: false },
            d7: { pieceType: 'P', pieceColor: 'B', moved: false },
            e7: { pieceType: 'P', pieceColor: 'B', moved: false },
            f7: { pieceType: 'P', pieceColor: 'B', moved: false },
            g7: { pieceType: 'P', pieceColor: 'B', moved: false },
            h7: { pieceType: 'P', pieceColor: 'B', moved: false },
            a8: { pieceType: 'R', pieceColor: 'B', moved: false },
            b8: { pieceType: 'N', pieceColor: 'B', moved: false },
            c8: { pieceType: 'B', pieceColor: 'B', moved: false },
            d8: { pieceType: 'Q', pieceColor: 'B', moved: false },
            e8: { pieceType: 'K', pieceColor: 'B', moved: false },
            f8: { pieceType: 'B', pieceColor: 'B', moved: false },
            g8: { pieceType: 'N', pieceColor: 'B', moved: false },
            h8: { pieceType: 'R', pieceColor: 'B', moved: false },
        };
        Object.entries(initialPositions).forEach(([key, piece]) => {
            const file = key[0];
            const rank = parseInt(key[1], 10);
            if (piece) {
                const cell = {
                    piece,
                };
                board[this._rankToRow(rank)][this._fileToColumn(file)] = cell;
            }
        });
        this.state.board = board;
    }
    _getKingPosition(color) {
        for (let rank = 1; rank <= 8; rank++) {
            for (const fileKey of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
                const fileIndex = this._fileToIndex(fileKey);
                const piece = this.state.board[rank - 1][fileIndex];
                if (piece?.piece.pieceType === 'K' && piece?.piece.pieceColor === color) {
                    return {
                        rank: rank,
                        file: fileKey,
                    };
                }
            }
        }
        throw new Error('King not found');
    }
    _getAllPossibleMoves(_color) {
        return [];
    }
    _getPieces(color) {
        const pieces = [];
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const cell = this.state.board[rank][file];
                if (cell && cell.piece.pieceColor === color) {
                    pieces.push({
                        type: cell.piece,
                        color: cell.piece.pieceColor,
                        position: {
                            rank: (rank + 1),
                            file: this._indexToFile(file),
                        },
                    });
                }
            }
        }
        return pieces;
    }
    _fileToIndex(file) {
        const fileMap = {
            a: 0,
            b: 1,
            c: 2,
            d: 3,
            e: 4,
            f: 5,
            g: 6,
            h: 7,
        };
        return fileMap[file];
    }
    _indexToFile(index) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return files[index];
    }
    isCheckmate() {
        const currentPlayerColor = this.state.moves.length % 2 === 0 ? 'W' : 'B';
        if (!this.isKingInCheck(currentPlayerColor)) {
            return false;
        }
        const allPossibleMoves = this._getAllPossibleMoves(currentPlayerColor);
        for (const move of allPossibleMoves) {
            const originalState = { ...this.state };
            this.updateChessBoard(move);
            const stillInCheck = this.isKingInCheck(currentPlayerColor);
            this.state = originalState;
            if (!stillInCheck) {
                return false;
            }
        }
        return true;
    }
    _applyMoveToTemporaryBoard(move) {
        const tempGameState = {
            ...this.state,
            moves: [...this.state.moves, move],
        };
        const tempBoard = this.state.board;
        const fromFileIndex = this._fileToIndex(move.currentFile);
        const toFileIndex = this._fileToIndex(move.destinationFile);
        const fromRankIndex = move.currentRank - 1;
        const toRankIndex = move.destinationRank - 1;
        const piece = tempBoard[fromRankIndex][fromFileIndex];
        tempBoard[toRankIndex][toFileIndex] = piece;
        tempBoard[fromRankIndex][fromFileIndex] = undefined;
        return tempGameState;
    }
    _validIndex(rowIndex, colIndex) {
        return rowIndex <= 7 && rowIndex >= 0 && colIndex <= 7 && colIndex >= 0;
    }
    underAttack(rowIndex, colIndex, player, altBoard) {
        let board;
        if (altBoard) {
            board = altBoard;
        }
        else {
            board = this.state.board;
        }
        const playerColor = player;
        let rightAttackRowI = rowIndex - 1;
        let rightAttackColI = colIndex + 1;
        let leftAttackRowI = rowIndex - 1;
        let leftAttackColI = colIndex - 1;
        if (playerColor === 'W') {
            rightAttackRowI = rowIndex - 1;
            rightAttackColI = colIndex + 1;
            leftAttackRowI = rowIndex - 1;
            leftAttackColI = colIndex - 1;
        }
        else {
            rightAttackRowI = rowIndex + 1;
            rightAttackColI = colIndex + 1;
            leftAttackRowI = rowIndex + 1;
            leftAttackColI = colIndex - 1;
        }
        if (this._validIndex(rightAttackRowI, rightAttackColI)) {
            if (board[rightAttackRowI][rightAttackColI] &&
                board[rightAttackRowI][rightAttackColI]?.piece.pieceColor !== playerColor &&
                board[rightAttackRowI][rightAttackColI]?.piece.pieceType === 'P') {
                return true;
            }
        }
        if (this._validIndex(leftAttackRowI, leftAttackColI)) {
            if (board[leftAttackRowI][leftAttackColI] &&
                board[leftAttackRowI][leftAttackColI]?.piece.pieceColor !== playerColor &&
                board[leftAttackRowI][leftAttackColI]?.piece.pieceType === 'P') {
                return true;
            }
        }
        const knightMoves = [
            { row: -2, col: -1 },
            { row: -2, col: 1 },
            { row: -1, col: -2 },
            { row: -1, col: 2 },
            { row: 2, col: -1 },
            { row: 2, col: 1 },
            { row: 1, col: -2 },
            { row: 1, col: -2 },
        ];
        for (let i = 0; i < knightMoves.length; i++) {
            const knightMove = knightMoves[i];
            const checkRowIndex = rowIndex + knightMove.row;
            const checkColIndex = rowIndex + knightMove.col;
            if (this._validIndex(checkRowIndex, checkColIndex)) {
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceType === 'N') {
                    return true;
                }
            }
        }
        const initialPaths = [
            { row: -1, col: 1, type: 'D' },
            { row: -1, col: -1, type: 'D' },
            { row: 1, col: 1, type: 'D' },
            { row: 1, col: -1, type: 'D' },
            { row: -1, col: 0, type: 'L' },
            { row: 1, col: 0, type: 'L' },
            { row: 0, col: 1, type: 'L' },
            { row: 0, col: -1, type: 'L' },
        ];
        for (let i = 0; i < initialPaths.length; i++) {
            const initialPath = initialPaths[i];
            let checkRowIndex = rowIndex + initialPath.row;
            let checkColIndex = rowIndex + initialPath.col;
            let checkedKing = false;
            while (this._validIndex(checkRowIndex, checkColIndex)) {
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor === playerColor) {
                    break;
                }
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
                    initialPath.type === 'D') {
                    if (board[checkRowIndex][checkColIndex]?.piece.pieceType === 'B' ||
                        board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q') {
                        return true;
                    }
                    if (!checkedKing && board[checkRowIndex][checkColIndex]?.piece.pieceType === 'K') {
                        return true;
                    }
                }
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
                    initialPath.type === 'H') {
                    if (board[checkRowIndex][checkColIndex]?.piece.pieceType === 'R' ||
                        board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q') {
                        return true;
                    }
                    if (!checkedKing && board[checkRowIndex][checkColIndex]?.piece.pieceType === 'K') {
                        return true;
                    }
                }
                checkRowIndex += initialPath.row;
                checkColIndex += initialPath.col;
                if (!checkedKing) {
                    checkedKing = true;
                }
            }
        }
        return false;
    }
    isKingInCheck(player, tempBoard) {
        let board;
        if (tempBoard) {
            board = tempBoard;
        }
        else {
            board = this.state.board;
        }
        const playerColor = this._playerColor(player);
        const kingLocation = this._getKingPosition(playerColor);
        const kingRow = this._rankToRow(kingLocation.rank);
        const colIndex = this._fileToColumn(kingLocation.file);
        let rightAttackRowI = kingRow - 1;
        let rightAttackColI = colIndex + 1;
        let leftAttackRowI = kingRow - 1;
        let leftAttackColI = colIndex - 1;
        if (playerColor === 'W') {
            rightAttackRowI = kingRow - 1;
            rightAttackColI = colIndex + 1;
            leftAttackRowI = kingRow - 1;
            leftAttackColI = colIndex - 1;
        }
        else {
            rightAttackRowI = kingRow + 1;
            rightAttackColI = colIndex + 1;
            leftAttackRowI = kingRow + 1;
            leftAttackColI = colIndex - 1;
        }
        if (this._validIndex(rightAttackRowI, rightAttackColI)) {
            if (board[rightAttackRowI][rightAttackColI] &&
                board[rightAttackRowI][rightAttackColI]?.piece.pieceColor !== playerColor &&
                board[rightAttackRowI][rightAttackColI]?.piece.pieceType === 'P') {
                return true;
            }
        }
        if (this._validIndex(leftAttackRowI, leftAttackColI)) {
            if (board[leftAttackRowI][leftAttackColI] &&
                board[leftAttackRowI][leftAttackColI]?.piece.pieceColor !== playerColor &&
                board[leftAttackRowI][leftAttackColI]?.piece.pieceType === 'P') {
                return true;
            }
        }
        const knightMoves = [
            { row: -2, col: -1 },
            { row: -2, col: 1 },
            { row: -1, col: -2 },
            { row: -1, col: 2 },
            { row: 2, col: -1 },
            { row: 2, col: 1 },
            { row: 1, col: -2 },
            { row: 1, col: -2 },
        ];
        for (let i = 0; i < knightMoves.length; i++) {
            const knightMove = knightMoves[i];
            const checkRowIndex = kingRow + knightMove.row;
            const checkColIndex = kingRow + knightMove.col;
            if (this._validIndex(checkRowIndex, checkColIndex)) {
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceType === 'N') {
                    return true;
                }
            }
        }
        const initialPaths = [
            { row: -1, col: 1, type: 'D' },
            { row: -1, col: -1, type: 'D' },
            { row: 1, col: 1, type: 'D' },
            { row: 1, col: -1, type: 'D' },
            { row: -1, col: 0, type: 'L' },
            { row: 1, col: 0, type: 'L' },
            { row: 0, col: 1, type: 'L' },
            { row: 0, col: -1, type: 'L' },
        ];
        for (let i = 0; i < initialPaths.length; i++) {
            const initialPath = initialPaths[i];
            let checkRowIndex = kingRow + initialPath.row;
            let checkColIndex = kingRow + initialPath.col;
            while (this._validIndex(checkRowIndex, checkColIndex)) {
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor === playerColor) {
                    break;
                }
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
                    initialPath.type === 'D') {
                    if (board[checkRowIndex][checkColIndex]?.piece.pieceType === 'B' ||
                        board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q') {
                        return true;
                    }
                }
                if (board[checkRowIndex][checkColIndex] &&
                    board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
                    initialPath.type === 'H') {
                    if (board[checkRowIndex][checkColIndex]?.piece.pieceType === 'R' ||
                        board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q') {
                        return true;
                    }
                }
                checkRowIndex += initialPath.row;
                checkColIndex += initialPath.col;
            }
        }
        return false;
    }
    isStalemate() {
        return false;
    }
    canCastle(player, side) {
        const playerColor = this._playerColor(player);
        const kingLocation = this._getKingPosition(playerColor);
        const kingRow = this._rankToRow(kingLocation.rank);
        const kingCol = this._fileToColumn(kingLocation.file);
        let canCastle = true;
        const { board } = this.state;
        const rookRowIndex = kingRow;
        let rookColIndex;
        if (side === 'K') {
            rookColIndex = 7;
        }
        else {
            rookColIndex = 0;
        }
        if (board[kingRow][kingCol]?.piece.moved && board[kingRow][kingCol]?.piece.moved === true) {
            canCastle = false;
        }
        else if (board[rookRowIndex][rookColIndex]?.piece.moved &&
            board[rookRowIndex][rookColIndex]?.piece.moved === true) {
            canCastle = false;
        }
        return canCastle;
    }
    canEnPassant(lastMove, currentMove) {
        const currentMovesFileNumber = this._fileToIndex(currentMove.currentFile);
        const lastMovesFileNumber = this._fileToIndex(lastMove.destinationFile);
        if (lastMove.gamePiece.pieceType === 'P' &&
            ((lastMove.gamePiece.pieceColor === 'B' &&
                lastMove.currentRank - 1 === 6 &&
                lastMove.destinationRank - 1 === 4) ||
                (lastMove.gamePiece.pieceColor === 'W' &&
                    lastMove.currentRank - 1 === 1 &&
                    lastMove.destinationRank - 1 === 3)) &&
            (lastMovesFileNumber === currentMovesFileNumber + 1 ||
                lastMovesFileNumber === currentMovesFileNumber - 1)) {
            return true;
        }
        return false;
    }
    canPromotePawn() {
        return false;
    }
    updateLeaderBoard() {
        let winPlayer1 = 0;
        let winPlayer2 = 0;
        let lossPlayer1 = 0;
        let lossPlayer2 = 0;
        let tiePlayer1 = 0;
        let tiePlayer2 = 0;
        const result = databaseUpdate.getLeaderBoardRow(this._players[0].userName);
        const result2 = databaseUpdate.getLeaderBoardRow(this._players[1].userName);
        if (result === undefined) {
            if (this.state.winner === undefined && this.state.status === 'OVER') {
                tiePlayer1 += 1;
            }
            else if (this.state.winner === this._players[0].id && this.state.status === 'OVER') {
                winPlayer1 += 1;
            }
            else {
                lossPlayer1 += 1;
            }
            databaseUpdate.addUser(this._players[0].userName, winPlayer1, tiePlayer1, lossPlayer1);
        }
        else if (this.state.winner === undefined && this.state.status === 'OVER') {
            databaseUpdate.updateLeaderBoardRow(this._players[0].userName, 'ties');
        }
        else if (this.state.winner === this._players[0].userName && this.state.status === 'OVER') {
            databaseUpdate.updateLeaderBoardRow(this._players[0].userName, 'wins');
        }
        else {
            databaseUpdate.updateLeaderBoardRow(this._players[0].userName, 'losses');
        }
        if (result2 === undefined) {
            if (this.state.winner === undefined && this.state.status === 'OVER') {
                tiePlayer2 += 1;
            }
            else if (this.state.winner === this._players[1].id && this.state.status === 'OVER') {
                winPlayer2 += 1;
            }
            else {
                lossPlayer2 += 1;
            }
            databaseUpdate.addUser(this._players[1].userName, winPlayer2, tiePlayer2, lossPlayer2);
        }
        else if (this.state.winner === undefined && this.state.status === 'OVER') {
            databaseUpdate.updateLeaderBoardRow(this._players[1].userName, 'ties');
        }
        else if (this.state.winner === this._players[1].userName && this.state.status === 'OVER') {
            databaseUpdate.updateLeaderBoardRow(this._players[1].userName, 'wins');
        }
        else {
            databaseUpdate.updateLeaderBoardRow(this._players[1].userName, 'losses');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlc3NHYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Rvd24vZ2FtZXMvQ2hlc3NHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixPQUFPLEVBV0wsb0JBQW9CLEdBQ3JCLE1BQU0sK0JBQStCLENBQUM7QUFDdkMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFELE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUMxQixPQUFPLHNCQUFzQixNQUFNLGtDQUFrQyxDQUFDO0FBRXRFLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQU1sQyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxJQUErQjtJQUNwRTtRQUNFLEtBQUssQ0FBQztZQUNKLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNYLEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFPTyxhQUFhLENBQUMsSUFBdUI7UUFDM0MsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQU9PLFVBQVUsQ0FBQyxJQUF1QjtRQUN4QyxPQUFPLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUNqQyxDQUFDO0lBT08sYUFBYSxDQUFDLFdBQW1CO1FBQ3ZDLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBc0IsQ0FBQztJQUNuRixDQUFDO0lBT08sVUFBVSxDQUFDLFFBQWdCO1FBQ2pDLE9BQU8sQ0FBQyxn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QUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFdkMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUF1QixFQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEcsTUFBTSxnQkFBZ0IsR0FBa0M7WUFDdEQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDckQsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFF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