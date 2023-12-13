import { BreadcrumbLink } from '@chakra-ui/react';
import { 
    ChessMove,
    ChessFilePosition,
    ChessRankPosition 
} from './CoveyTownSocket';

/**
 * Function that returns new _file position 
 * 
 * @param _file is file of current chess piece
 */
function getNewFile(_file: ChessFilePosition, offset: number): ChessMove["destinationFile"] {
    let fileIndex: number = 0;
    switch(_file) {
        case 'a':
            fileIndex: 1;
            break;
        case 'b':
            fileIndex: 2;
            break;
        case 'c':
            fileIndex: 3;
            break;
        case 'd':
            fileIndex: 4;
            break;
        case 'e':
            fileIndex: 5;
            break;
        case 'f':
            fileIndex: 6;
            break;
        case 'g':
            fileIndex: 7;
            break;
        case 'h':
            fileIndex: 8;
            break;
    }
    fileIndex += offset;
    switch (fileIndex) {
        case 1:
            return 'a';
        case 2:
            return 'b';
        case 3:
            return 'c';
        case 4:
            return 'd';
        case 5:
            return 'e';
        case 6:
            return 'f';
        case 7:
            return 'g';
        case 8:
            return 'h';
        default:
            return _file;
    }
}
/**
 * Function that returns all possible Pawn moves at certain rank and file
 * 
 * @param _rank  is rank of current chess piece
 * @param _file  is file of current chess piece
 * @param _color is color of current chess piece
 * @returns possible moves for pawn piece
 */
export function getPawnMoves(_rank: ChessRankPosition, _file: ChessFilePosition, _color: 'white' | 'black'): ChessMove[] {
    const possiblePawnMoves: ChessMove[] = [];
    // Pawn can go forward 1 square
    const forwardMove: ChessMove = {
        gamePiece: 'p',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: _file,
    };
    // Check to see if move is possible or not
    if (isValidMove(forwardMove)) {
        possiblePawnMoves.push(forwardMove);
    }
    // Pawn can go forward 2 squares
    if (_rank == 2 || _rank == 7) {
        const forwardTwoMoves: ChessMove = {
            gamePiece: 'p',
            currentRank: _rank,
            currentFile: _file,
            destinationRank: (_color == 'white' ? _rank + 2 : _rank - 2) as ChessRankPosition,
            destinationFile: _file,
        };
        possiblePawnMoves.push(forwardTwoMoves);
    }
    // Pawn can capture piece on its right
    const captureRight: ChessMove = {
        gamePiece: 'p',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, 1),
    };
    // Check to see if is possible or not
    if (isValidMove(captureRight)) {
        possiblePawnMoves.push(captureRight);
    }
    // Pawn can capture piece on its left
    const captureLeft: ChessMove = {
        gamePiece: 'p',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, -1),
    };
    // Check to see if is possible or not
    if (isValidMove(captureLeft)) {
        possiblePawnMoves.push(captureLeft);
    }
    return possiblePawnMoves;
}
/**
 * Function that returns all possible Bishop moves at certain rank and file
 * 
 * @param _rank  is rank of current chess piece
 * @param _file  is file of current chess piece
 * @param _color is color of current chess piece
 * @returns possible moves for bishop piece
 */
export function getBishopMoves(_rank: ChessRankPosition, _file: ChessFilePosition, _color: 'white' | 'black'): ChessMove[] {
    const possibleBishopMoves: ChessMove[] = [];
    let copyRank = _rank;
    let copyFile = _file;
    // Bishop can move diagonally foward to the left
    for (let i = _rank; i < 8; i++) {
        const forwardDiagonalLeft: ChessMove = {
            gamePiece: 'b',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, -1),
        };
        if (isValidMove(forwardDiagonalLeft)) {
            possibleBishopMoves.push(forwardDiagonalLeft);
        } else {
            break;
        }
        if (forwardDiagonalLeft.currentFile == 'a') {
            break;
        } else {
            copyRank = forwardDiagonalLeft.destinationRank;
            copyFile = forwardDiagonalLeft.destinationFile;
        }
}
    // Bishop can move diagonally foward to the right
    copyRank = _rank;
    copyFile = _file;
    for (let i = _rank; i < 8; i++) {
        const forwardDiagonalRight: ChessMove = {
            gamePiece: 'b',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, 1),
        };
        if (isValidMove(forwardDiagonalRight)) {
            possibleBishopMoves.push(forwardDiagonalRight);
        } else {
            break;
        }
        if (forwardDiagonalRight.currentFile == 'h') {
            break;
        } else {
            copyRank = forwardDiagonalRight.destinationRank;
            copyFile = forwardDiagonalRight.destinationFile;
        }
    }
    copyRank = _rank;
    copyFile = _file;
    // Bishop can move diagonally backward to the left
    for (let i = _rank; i > 1; i--) {
        const backwardDiagonalLeft: ChessMove = {
            gamePiece: 'b',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, -1),
        };
        if (isValidMove(backwardDiagonalLeft)) {
            possibleBishopMoves.push(backwardDiagonalLeft);
        } else {
            break;
        }
        // Check to see if piece has hit edge of the board
        if (backwardDiagonalLeft.currentFile == 'a') {
            break;
        } else {
            copyRank = backwardDiagonalLeft.destinationRank;
            copyFile = backwardDiagonalLeft.destinationFile;
        }
    }
    copyRank = _rank;
    copyFile = _file;
    // Bishop can move diagonally backward to the right
    for (let i = _rank; i > 1; i--) {
        const backwardDiagonalRight: ChessMove = {
            gamePiece: 'b',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, 1),
        };
        if (isValidMove(backwardDiagonalRight)) {
            possibleBishopMoves.push(backwardDiagonalRight);
        } else {
            break;
        }
        // Check to see if piece has hit the edge of the board
        if (backwardDiagonalRight.currentFile == 'h') {
            break;
        } else {
            copyRank = backwardDiagonalRight.destinationRank;
            copyFile = backwardDiagonalRight.destinationFile;
        }
    }
    return possibleBishopMoves;
}
/**
 * Function that returns all possible Knight moves at certain rank and file
 * 
 * @param _rank  is rank of current chess piece
 * @param _file  is file of current chess piece
 * @param _color is color of current chess piece
 * @returns possible moves for knight piece
 */
export function getKnightMoves(_rank: ChessRankPosition, _file: ChessFilePosition, _color: 'white' | 'black'): ChessMove[] {
    const possibleKnightMoves: ChessMove[] = [];

    //  -
    // |
    const forwardVerticalRightL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 2 : _rank - 2) as ChessRankPosition,
        destinationFile: getNewFile(_file, 1),
    };
    if (isValidMove(forwardVerticalRightL)) {
        possibleKnightMoves.push(forwardVerticalRightL);
    }
    //  -
    //   |
    const forwardVerticalLeftL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 2 : _rank - 2) as ChessRankPosition,
        destinationFile: getNewFile(_file, -1),
    };
    if (isValidMove(forwardVerticalLeftL)) {
        possibleKnightMoves.push(forwardVerticalLeftL);
    }
    // |
    //  -
    const backwardVerticalRightL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank - 2 : _rank + 2) as ChessRankPosition,
        destinationFile: getNewFile(_file, 1),
    };
    if (isValidMove(backwardVerticalRightL)) {
        possibleKnightMoves.push(backwardVerticalRightL);
    }
    //   |
    //  -
    const backwardVerticalLeftL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank - 2 : _rank + 2) as ChessRankPosition,
        destinationFile: getNewFile(_file, -1),
    };
    if (isValidMove(backwardVerticalLeftL)) {
        possibleKnightMoves.push(backwardVerticalLeftL);
    } 
    //  --
    // '
    const forwardHorizontalRightL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, 2),
    };
    if (isValidMove(forwardHorizontalRightL)) {
        possibleKnightMoves.push(forwardHorizontalRightL);
    }
    // --
    //   '
    const forwardHorizontalLeftL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, -2),
    };
    if (isValidMove(forwardHorizontalLeftL)) {
        possibleKnightMoves.push(forwardHorizontalLeftL);
    }
    // '
    //  --
    const backwardHorizontalRightL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, 2),
    };
    if (isValidMove(backwardHorizontalRightL)) {
        possibleKnightMoves.push(backwardHorizontalRightL);
    }
    //   '
    // -- 
    const backwardHorizontalLeftL: ChessMove = {
        gamePiece: 'n',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, -2),
    };
    if (isValidMove(backwardHorizontalLeftL)) {
        possibleKnightMoves.push(backwardHorizontalLeftL);
    }
    return possibleKnightMoves;
}
/**
 * Function that returns all possible Rook moves at certain rank and file
 * 
 * @param _rank  is rank of current chess piece
 * @param _file  is file of current chess piece
 * @param _color is color of current chess piece
 * @returns possible moves for rook piece
 */
export function getRookMoves(_rank: ChessRankPosition, _file: ChessFilePosition, _color: 'white' | 'black'): ChessMove[] {
    const possibleRookMoves: ChessMove[] = [];
    let copyRank = _rank;
    let copyFile = _file;
    const fileIndex = (_file.charCodeAt(0) - 'a'.charCodeAt(0)) + 1;
    // Rook can move however many spaces forward
    for (let i = _rank; i < 8; i++) {
        const forwardMove: ChessMove = {
            gamePiece: 'r',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
            destinationFile: _file,
        };
        if (isValidMove(forwardMove)) {
            possibleRookMoves.push(forwardMove);
        } else {
            break;
        }
        copyRank = forwardMove.destinationRank;
    }
    copyRank = _rank;
    // Rook can move however many spaces backward
    for (let i = _rank; i > 1; i--) {
        const backwardMove: ChessMove = {
            gamePiece: 'r',
            currentRank: copyRank,
            currentFile: _file, 
            destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
            destinationFile: _file,
        };
        if (isValidMove(backwardMove)) {
            possibleRookMoves.push(backwardMove);
        } else {
            break;
        }
        copyRank = backwardMove.destinationRank;
    }
    // Rook can move however many spaces to the right
    for (let i = fileIndex; i < 8; i++) {
        const rightMove: ChessMove = {
            gamePiece: 'r',
            currentRank: _rank,
            currentFile: copyFile,
            destinationRank: _rank,
            destinationFile: getNewFile(copyFile, 1),
        };
        if (isValidMove(rightMove)) {
            possibleRookMoves.push(rightMove);
        } else {
            break;
        }
        if (copyFile == 'h') {
            break;
        } else {
            copyFile = rightMove.destinationFile;
        }
    }
    // Rook can move however many spaces to the left
    for (let i = fileIndex; i > 1; i--) {
        const leftMove: ChessMove = {
            gamePiece: 'r',
            currentRank: _rank,
            currentFile: copyFile,
            destinationRank: _rank,
            destinationFile: getNewFile(copyFile, -1),
        };
        if (isValidMove(leftMove)) {
            possibleRookMoves.push(leftMove);
        } else {
            break;
        }
        if (copyFile == 'a') {
            break;
        } else {
            copyFile = leftMove.destinationFile;
        }
    }
    return possibleRookMoves;
}
/**
 * Function that returns all possible King moves at certain rank and file
 * 
 * @param _rank  is rank of current chess piece
 * @param _file  is file of current chess piece
 * @param _color is color of current chess piece
 * @returns possible moves for king piece
 */
export function getKingMoves(_rank: ChessRankPosition, _file: ChessFilePosition, _color: 'white' | 'black'): ChessMove[] {
    const possibleKingMoves: ChessMove[] = [];
    // King can move forward 1 space
    const forwardMove: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: _file,
    };
    if (isValidMove(forwardMove)) {
        possibleKingMoves.push(forwardMove);
    }
    // King can move backward 1 space
    const backwardMove: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
        destinationFile: _file,
    };
    if (isValidMove(backwardMove)) {
        possibleKingMoves.push(backwardMove);
    }
    // King can move 1 space to the right
    const rightMove: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: _rank,
        destinationFile: getNewFile(_file, 1),
    };
    if (isValidMove(rightMove)) {
        possibleKingMoves.push(rightMove);
    }
    // King can move 1 space to the left
    const leftMove: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: _rank,
        destinationFile: getNewFile(_file, -1)
    };
    if (isValidMove(leftMove)) {
        possibleKingMoves.push(leftMove);
    }
    // King can go diagonally forward to the right
    const forwardDiagonalRight: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, 1),
    };
    if (isValidMove(forwardDiagonalRight)) {
        possibleKingMoves.push(forwardDiagonalRight);
    }
    // King can go diagonally forward to the left
    const forwardDiagonalLeft: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank + 1 : _rank - 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, -1),
    };
    if (isValidMove(forwardDiagonalLeft)) {
        possibleKingMoves.push(forwardDiagonalLeft);
    }
    // King can go diagonally backward to the right
    const backwardDiagonalRight: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, 1),
    };
    if (isValidMove(backwardDiagonalRight)) {
        possibleKingMoves.push(backwardDiagonalRight);
    }
    // King can go diagonally backward to the left
    const backwardDiagonalLeft: ChessMove = {
        gamePiece: 'k',
        currentRank: _rank,
        currentFile: _file,
        destinationRank: (_color == 'white' ? _rank - 1 : _rank + 1) as ChessRankPosition,
        destinationFile: getNewFile(_file, -1),
    };
    if (isValidMove(backwardDiagonalLeft)) {
        possibleKingMoves.push(backwardDiagonalLeft);
    }
    return possibleKingMoves;
}
/**
 * Function that returns all possible Queen moves at certain rank and file
 * 
 * @param _rank  is rank of current chess piece
 * @param _file  is file of current chess piece
 * @param _color is color of current chess piece
 * @returns possible moves for queen piece
 */
export function getQueenMoves(_rank: ChessRankPosition, _file: ChessFilePosition, _color: 'white' | 'black'): ChessMove[] {
    const possibleQueenMoves: ChessMove[] = [];
    let copyRank = _rank;
    let copyFile = _file;
    let fileIndex = (_file.charCodeAt(0) - 'a'.charCodeAt(0)) + 1;
    // Queen can move however many spaces forward
    for (let i = _rank; i < 8; i++) {
        const forwardMove: ChessMove = {
            gamePiece: 'q',
            currentRank: copyRank,
            currentFile: _file,
            destinationRank: (_color == 'white' ? copyRank + 1 : copyRank - 1) as ChessRankPosition,
            destinationFile: _file,
        };
        copyRank = forwardMove.destinationRank;
        if (isValidMove(forwardMove)) {
            possibleQueenMoves.push(forwardMove);
        } else {
            break;
        }
    }
    copyRank = _rank;
    // Queen can move however many spaces backward
    for (let i = _rank; i > 1; i--) {
        const backwardMove: ChessMove = {
            gamePiece: 'q',
            currentRank: copyRank,
            currentFile: _file,
            destinationRank: (_color == 'white' ? copyRank - 1 : copyRank + 1) as ChessRankPosition,
            destinationFile: _file,
        };
        copyRank = backwardMove.destinationRank;
        if (isValidMove(backwardMove)) {
            possibleQueenMoves.push(backwardMove);
        } else {
            break;
        }
    }
    // Queen can move however many spaces to the right
    for (let i = fileIndex; i < 8; i++) {
        const rightMove: ChessMove = {
            gamePiece: 'q',
            currentRank: _rank,
            currentFile: copyFile,
            destinationRank: _rank,
            destinationFile: getNewFile(copyFile, 1),
        };
        if (isValidMove(rightMove)) {
            possibleQueenMoves.push(rightMove);
        } else {
            break;
        }
        copyFile = rightMove.destinationFile;
    }
    copyFile = _file;
    // Queen can move however many spaces to the left
    for (let i = fileIndex; i > 1; i--) {
        const leftMove: ChessMove = {
            gamePiece: 'q',
            currentRank: _rank,
            currentFile: copyFile,
            destinationRank: _rank,
            destinationFile: getNewFile(copyFile, -1),
        };
        if (isValidMove(leftMove)) {
            possibleQueenMoves.push(leftMove);
        } else {
            break;
        }
        copyFile = leftMove.destinationFile;
    }
    copyRank = _rank;
    copyFile = _file;
    // Queen can move however many spaces diagonally forward to the left
    for (let i =  _rank; i < 8; i++) {
        const forwardDiagonalLeft: ChessMove = {
            gamePiece: 'q',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? copyRank + 1 : copyRank - 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, -1),
        };
        if (isValidMove(forwardDiagonalLeft)) {
            possibleQueenMoves.push(forwardDiagonalLeft);
        } else { 
            break;
        }
        copyFile = forwardDiagonalLeft.destinationFile;
        if (copyFile == 'a') {
            break;
        }
    }
    copyRank = _rank;
    copyFile = _file;
    // Queen can move however many spaces diagonally forward to the right
    for (let i =  _rank; i < 8; i++) {
        const forwardDiagonalRight: ChessMove = {
            gamePiece: 'q',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? copyRank + 1 : copyRank - 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, 1),
        };
        if (isValidMove(forwardDiagonalRight)) {
            possibleQueenMoves.push(forwardDiagonalRight);
        } else { 
            break;
        }
        copyFile = forwardDiagonalRight.destinationFile;
        if (copyFile == 'h') {
            break;
        }
    }
    copyRank = _rank;
    copyFile = _file;
    // Queen can move however many spaces diagonally backward to the left
    for (let i =  _rank; i > 1; i--) {
        const backwardDiagonalLeft: ChessMove = {
            gamePiece: 'q',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? copyRank - 1 : copyRank + 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, -1),
        };
        if (isValidMove(backwardDiagonalLeft)) {
            possibleQueenMoves.push(backwardDiagonalLeft);
        } else { 
            break;
        }
        copyFile = backwardDiagonalLeft.destinationFile;
        if (copyFile == 'a') {
            break;
        }
    }
    copyRank = _rank;
    copyFile = _file;
    // Queen can move however many spaces backward diagonally to the right
    for (let i =  _rank; i > 1; i--) {
        const backwardDiagonalRight: ChessMove = {
            gamePiece: 'q',
            currentRank: copyRank,
            currentFile: copyFile,
            destinationRank: (_color == 'white' ? copyRank - 1 : copyRank + 1) as ChessRankPosition,
            destinationFile: getNewFile(copyFile, 1),
        };
        if (isValidMove(backwardDiagonalRight)) {
            possibleQueenMoves.push(backwardDiagonalRight);
        } else { 
            break;
        }
        copyFile = backwardDiagonalRight.destinationFile;
        if (copyFile == 'h') {
            break;
        }
    }
    return possibleQueenMoves;
}