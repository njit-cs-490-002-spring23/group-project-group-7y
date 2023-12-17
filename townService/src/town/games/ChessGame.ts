// TODO: remove all eslint-disable
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchMiddlewares } from 'tsoa';
import axios from 'axios';
import { log } from 'node:console';
import {
  ChessGameState,
  ChessMove,
  ChessFilePosition,
  ChessRankPosition,
  PlayerID,
  ChessCell,
  ChessPiece,
  GameMove,
  ChessPosition,
  PieceWithPosition,
} from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';

import { databaseUpdate } from './database/chessDatabase';
import Game from './Game';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

export const CHESS_BOARD_SIZE = 8;
export const API_CONNECTION_ERROR = 'Cannot connect to StockfishOnline API';
/**
 * A ChessGame is a Game that implements the rules of Chess.
 * @see https://en.wikipedia.blackrg/wiki/Chess
 */
export default class ChessGame extends Game<ChessGameState, ChessMove> {
  public constructor() {
    super({
      board: [[]],
      moves: [],
      status: 'WAITING_TO_START',
      halfMoves: 0,
    });
    this.initializeChessBoard();
  }

  /*
   * Convert file position to column index in board and return index
   *
   * @param {file} The chess board file
   */
  private _fileToColumn(file: ChessFilePosition) {
    return file.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  /*
   * Convert rank position to index in board and return index
   *
   * @param rank The chess board rank
   */
  private _rankToRow(rank: ChessRankPosition) {
    return CHESS_BOARD_SIZE - rank;
  }

  /*
   * Convert column index to file position return file
   *
   * @param file The chess board file
   */
  private _columnToFile(columnIndex: number): ChessFilePosition {
    return String.fromCharCode(columnIndex + 'a'.charCodeAt(0)) as ChessFilePosition;
  }

  /*
   * Convert row index to chess rank and return rank
   *
   * @param rank The chess board rank
   */
  private _rowToRank(rowIndex: number): ChessRankPosition {
    return (CHESS_BOARD_SIZE - rowIndex) as ChessRankPosition;
  }

  /*
   * Returns whose turn (W or B) it is
   *
   */
  private _whoseTurn(): string {
    return this.state.moves.length % 2 === 0 ? 'W' : 'B';
  }

  /**
   * Returns the whether a given player is white or black
   *
   * @param player the player whose gamepieces' color is nedded
   */
  private _playerColor(player: PlayerID): 'W' | 'B' {
    if (this.state.white === player) {
      return 'W';
    }
    return 'B';
  }

  /**
   * Returns the FEN notation for the current game state
   *
   * @see https://www.chess.com/terms/fen-chess
   */
  public fenNotation(): string {
    let fen = '';
    let emptySquareCount = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const currentCell: ChessCell = this.state.board[i][j];
        if (!currentCell) {
          emptySquareCount++;
        } else {
          if (emptySquareCount > 0) {
            fen += emptySquareCount;
            emptySquareCount = 0;
          }
          if (currentCell.piece.pieceColor === 'W') {
            const fenPiece = currentCell.piece.pieceType;
            fen += fenPiece;
          } else {
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
      } else fen += `${lastMove.destinationFile}6 `;
    } else fen += '- ';

    fen += `${this.state.halfMoves} `;

    fen += `${Math.floor(this.state.moves.length / 2) + 1}`;
    return fen;
  }

  /**
   * Returns wheter the given move was a pawn move of 2
   * @returns {true | false}
   */
  private _fenEnPassant(move: ChessMove): boolean {
    if (Math.abs(move.currentRank - move.destinationRank) === 2) {
      return true;
    }
    return false;
  }

  /*
   * Makes API request to obtain best possible move for current game state and returns the move
   *
   * @param move The move to apply to the game
   * @throws APIConnectionError if cannot acces the API
   */
  public async nextBestMove(): Promise<ChessMove> {
    const apiEndpoint = 'https://stockfish.blacknline/api/stockfish.php';
    const requestURL = `${apiEndpoint}?fen=${encodeURIComponent(
      this.fenNotation(),
    )}&depth=10&mode=bestmove`;

    return axios
      .get(requestURL)
      .then(response => {
        const { data } = response.data;
        const curFile = data[9];
        const curRank = parseInt(data[10], 10);
        const destFile = data[11];
        const destRank = parseInt(data[12], 10);
        const pieceRow = this._rankToRow(curRank as ChessRankPosition);
        const pieceCol = this._fileToColumn(curFile as ChessFilePosition);
        const piece = this.state.board[pieceRow][pieceCol]?.piece.pieceType;
        return {
          gamePiece: piece,
          currentRank: curRank,
          currentFile: curFile,
          destinationRank: destRank,
          destinationFile: destFile,
        } as unknown as Promise<ChessMove>;
      })
      .catch(() => {
        throw new Error(API_CONNECTION_ERROR);
      });
  }

  /**
   * Starts form the starting indexes and applies the given displacement continously, adding each blank square as possible move,
   * until a game piece is hit. This hitting set of indices is also added as a possible move if it's a opposing
   */
  public processAndAddMoves(
    currentRank: ChessRankPosition,
    currentFile: ChessFilePosition,
    gamePiece: ChessPiece,
    possibleMoves: ChessMove[],
    rowDisplacement: number,
    colDisplacement: number,
    processOnce?: boolean,
  ): void {
    const { board } = this.state;
    const rowIndex = this._rankToRow(currentRank);
    const colIndex = this._fileToColumn(currentFile);
    let moveRowIndex = rowIndex + rowDisplacement;
    let moveColIndex = colIndex + colDisplacement;
    while (this._validIndex(moveRowIndex, moveColIndex)) {
      if (board[moveRowIndex][moveColIndex] === undefined) {
        const possibleMove: ChessMove = {
          gamePiece,
          currentRank,
          currentFile,
          destinationFile: this._columnToFile(moveColIndex),
          destinationRank: this._rowToRank(moveRowIndex),
        };
        possibleMoves.push(possibleMove);
      } else if (board[moveRowIndex][moveColIndex]?.piece.pieceColor !== gamePiece.pieceColor) {
        const possibleMove: ChessMove = {
          gamePiece,
          currentRank,
          currentFile,
          destinationFile: this._columnToFile(moveColIndex),
          destinationRank: this._rowToRank(moveRowIndex),
        };
        possibleMoves.push(possibleMove);
      } else if (board[moveRowIndex][moveColIndex]?.piece.pieceColor === gamePiece.pieceColor) {
        break;
      }
      if (processOnce && processOnce === true) {
        break;
      }
      moveRowIndex += rowDisplacement;
      moveColIndex += rowDisplacement;
    }
  }

  /**
   * Simple method to return the oppsing player's pieces' color
   *
   * @param color
   */
  private _opponentColor(color: 'W' | 'B') {
    return color === 'W' ? 'B' : 'W';
  }

  /**
   * Redirects possible move request in indices to chess notation and returns possible moves
   * @param rowIndex
   * @param colIndex
   * @returns {ChesMove[]}
   */
  public boardPossibleMoves(rowIndex: number, colIndex: number) {
    log('moves query for: %d, %d', rowIndex, colIndex);
    return this.possibleMoves(this._rowToRank(rowIndex), this._columnToFile(colIndex));
  }

  /**
   * Returns all possible moves for the piece at the given rank and file
   * @param rank The rank position
   * @param file The file position
   * export type ChessPiece = {
  pieceType: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | undefined;
  pieceColor: 'W' | 'B';
}; // Kings, Queens, Rooks, Bishops, Knights, Pawns

   */
  public possibleMoves(
    rank: ChessRankPosition,
    file: ChessFilePosition,
    tempBoard?: Readonly<ChessCell[][]>,
  ): ChessMove[] {
    let board: Readonly<ChessCell[][]>;
    if (tempBoard) {
      board = tempBoard;
    } else {
      board = this.state.board;
    }
    const possibleMoves: ChessMove[] = [];
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
          this.processAndAddMoves(
            rank,
            file,
            chessSquare.piece,
            possibleMoves,
            path.row,
            path.col,
            true,
          );
        }

        // check castle moves
        if (this.canCastle(chessSquare.piece.pieceColor, 'K')) {
          if (
            board[rowIndex][colIndex + 1] === undefined &&
            board[rowIndex][colIndex + 2] === undefined &&
            !this.underAttack(
              rowIndex,
              colIndex + 1,
              this._opponentColor(chessSquare.piece.pieceColor),
            ) &&
            !this.underAttack(
              rowIndex,
              colIndex + 2,
              this._opponentColor(chessSquare.piece.pieceColor),
            )
          ) {
            const possibleMove: ChessMove = {
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
          if (
            board[rowIndex][colIndex - 1] === undefined &&
            board[rowIndex][colIndex - 2] === undefined &&
            board[rowIndex][colIndex - 3] === undefined &&
            !this.underAttack(
              rowIndex,
              colIndex - 1,
              this._opponentColor(chessSquare.piece.pieceColor),
            ) &&
            !this.underAttack(
              rowIndex,
              colIndex + 2,
              this._opponentColor(chessSquare.piece.pieceColor),
            )
          ) {
            const possibleMove: ChessMove = {
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
          this.processAndAddMoves(
            rank,
            file,
            chessSquare.piece,
            possibleMoves,
            path.row,
            path.col,
            true,
          );
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
            /* const p: ChessMove = {
              gamePiece: chessSquare.piece,
              currentRank: rank,
              currentFile: file,
              destinationFile: this._columnToFile(pawnMoveColIndex),
              destinationRank: this._rowToRank(pawanMoveRowIndex),
            };
            possibleMoves.push(p); */
            if (this._validIndex(pawanMoveRowIndex, pawnMoveColIndex)) {
              if (path.type === 'F' && chessSquare.piece.moved === false) {
                const possibleMove: ChessMove = {
                  gamePiece: chessSquare.piece,
                  currentRank: rank,
                  currentFile: file,
                  destinationFile: this._columnToFile(pawnMoveColIndex),
                  destinationRank: this._rowToRank(pawanMoveRowIndex),
                };
                possibleMoves.push(possibleMove);
              } else if (
                path.type === 'N' &&
                board[pawanMoveRowIndex][pawnMoveColIndex] === undefined
              ) {
                const possibleMove: ChessMove = {
                  gamePiece: chessSquare.piece,
                  currentRank: rank,
                  currentFile: file,
                  destinationFile: this._columnToFile(pawnMoveColIndex),
                  destinationRank: this._rowToRank(pawanMoveRowIndex),
                };
                possibleMoves.push(possibleMove);
              } else if (path.type === 'C') {
                if (
                  board[pawanMoveRowIndex][pawnMoveColIndex] !== undefined &&
                  board[pawanMoveRowIndex][pawnMoveColIndex]?.piece.pieceColor !==
                    chessSquare.piece.pieceColor
                ) {
                  const possibleMove: ChessMove = {
                    gamePiece: chessSquare.piece,
                    currentRank: rank,
                    currentFile: file,
                    destinationFile: this._columnToFile(pawnMoveColIndex),
                    destinationRank: this._rowToRank(pawanMoveRowIndex),
                  };
                  possibleMoves.push(possibleMove);
                } else if (
                  this.state.moves[this.state.moves.length - 1] &&
                  this._fenEnPassant(this.state.moves[this.state.moves.length - 1]) &&
                  this._fileToColumn(
                    this.state.moves[this.state.moves.length - 1].destinationFile,
                  ) === pawnMoveColIndex &&
                  this._rankToRow(this.state.moves[this.state.moves.length - 1].destinationRank) +
                    1 ===
                    pawanMoveRowIndex
                ) {
                  const possibleMove: ChessMove = {
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

  /*
   * Applies a player's move to the game.
   * Uses the player's ID to determine which game pieces (white vs black) they are using (ignores move.gamePiece)
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *   ... comment to be updated after implementation
   *
   * If the move is valid, applies the move to the game and updates the game state.
   *
   * If the move ends the game, updates the game's state.
   * If the move results in a tie, updates the game's state to set the status to OVER and sets winner to undefined.
   * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
   * A player wins if they check the the opposing king and the king has no way to get out of check
   * A stalemate result in a tie
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid (with specific message noted above)
   */
  public applyMove(_move: GameMove<ChessMove>): void {
    if (
      (this.state.moves.length % 2 === 0 && _move.playerID !== this.state.white) ||
      (this.state.moves.length % 2 === 1 && _move.playerID !== this.state.black)
    ) {
      throw new InvalidParametersError('Not Your Turn');
    }
    if (this._validateGamePieceMovement(_move)) {
      // updates the moves with the current game move
      const updateValidMovesToGameState = [...this.state.moves, _move.move];
      this.state.moves = updateValidMovesToGameState;

      // updates the state of the board with the new position and sets the old position to undefined1
      this.state.board[_move.move.destinationRank - 1][
        this._fileToIndex(_move.move.destinationFile)
      ] = {
        piece: {
          pieceColor: _move.move.gamePiece.pieceColor,
          pieceType: _move.move.gamePiece.pieceType,
          moved: true,
        },
      };
      this.state.board[_move.move.currentRank - 1][this._fileToIndex(_move.move.currentFile)] =
        undefined;
    } else {
      throw new InvalidParametersError('Invalid Move');
    }
  }

  // Checks if the desination and pieces on the way are empty
  private _checkChessCells(
    currRank: number,
    currFile: number,
    destRank: number,
    destFile: number,
    playerColor: string,
  ): string {
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
      } else {
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

  /**
   * @param {ChessMove} move - determines whether the move is valid or not depending on its piece and movement factors for destination rank and file
   * @returns {boolean} true if the move is valid, or false if not.
   * to do: implement checks for king movement for castling and whether the king is in check or checkmate
   */
  private _validateGamePieceMovement(move: GameMove<ChessMove>): boolean {
    // Explicit declarations of Values so no magic numbers are declared
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
    let diffRank: number;
    let diffFile: number;
    let playerColor;

    if (move.playerID === this.state.white) {
      playerColor = 'W';
      if (chessPieceColor !== 'W') {
        throw new InvalidParametersError('Player 1 can only move white pieces');
      }
    } else {
      playerColor = 'B';
      if (chessPieceColor !== 'B') {
        throw new InvalidParametersError('Player 2 can only move black pieces');
      }
    }
    if (
      destFileNumber < minimumValueForBoard ||
      destFileNumber > maximumValueForBoard ||
      currFileNumber < minimumValueForBoard ||
      currFileNumber > maximumValueForBoard ||
      destToRank < minimumValueForBoard ||
      destToRank > maximumValueForBoard ||
      currInRank < minimumValueForBoard ||
      currInRank > maximumValueForBoard
    ) {
      return false;
    }
    // expect the piece that you want to move to be on that spot
    if (
      this.state.board[currInRank][currFileNumber]?.piece.pieceType !==
      move.move.gamePiece.pieceType
    ) {
      return false;
    }
    switch (chessPiece) {
      case 'P':
        // Checks to see if pawn's initial move is by 2
        if (
          (currInRank === 1 && destToRank === currInRank + 2 && playerColor === 'W') ||
          (currInRank === 6 && destToRank === currInRank - 2 && playerColor === 'B')
        ) {
          // if file changes the move is invalid
          if (destFileNumber !== currFileNumber) {
            return false;
          }
          // checks if the cell is empty.

          result = this._checkChessCells(
            currInRank,
            currFileNumber,
            destToRank,
            destFileNumber,
            playerColor,
          );

          // if result equals empty then the move is valid.
          if (result === 'Empty') {
            return true;
          }

          return false;
        }
        // regular pawn movement by 1
        if (
          (destToRank === currInRank + 1 && playerColor === 'W') ||
          (destToRank === currInRank - 1 && playerColor === 'B')
        ) {
          result = this._checkChessCells(
            currInRank,
            currFileNumber,
            destToRank,
            destFileNumber,
            playerColor,
          );
          // If the file changes, then expect a capture. If not, will return false.
          if (destFileNumber === currFileNumber - 1 || destFileNumber === currFileNumber + 1) {
            if (result === 'Empty') {
              // if moves length is 0 then it is impossible for the pawn to change file
              if (this.state.moves.length === 0) {
                return false;
              }
              // call canEnPassant with the lastMove from the moves ReadOnlyArray and the current move
              if (this.canEnPassant(this.state.moves[this.state.moves.length - 1], move.move)) {
                // capture the pawn piece
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
        // Checks Knights movement whether the rank increases/decreases by 1 then the file should increment/decrement by 2 and vice versa
        if (
          ((destToRank === currInRank + 1 || destToRank === currInRank - 1) &&
            (destFileNumber === currFileNumber + 2 || destFileNumber === currFileNumber - 2)) ||
          ((destFileNumber === currFileNumber + 1 || destFileNumber === currFileNumber - 1) &&
            (destToRank === currInRank + 2 || destToRank === currInRank - 2))
        ) {
          // if the piece on the board matches the player's color then it is an invalid move
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
          } else {
            diffFile = currFileNumber - destFileNumber;
          }
          if (destToRank > currInRank) {
            diffRank = destToRank - currInRank;
          } else {
            diffRank = currInRank - destToRank;
          }
          // the differences should be equal because of how diagonal movement works.
          if (diffRank !== diffFile) {
            return false;
          }
          result = this._checkChessCells(
            currInRank,
            currFileNumber,
            destToRank,
            destFileNumber,
            playerColor,
          );
          if (result === 'Empty' || result === 'Capture Possible') {
            return true;
          }
          return false;
        }
        break;
      case 'K':
        // Checks vertical, horizontal, and diagonal movement
        if (
          (destFileNumber === currFileNumber &&
            (destToRank === currInRank + 1 || destToRank === currInRank - 1)) ||
          (destToRank === currInRank &&
            (destFileNumber === currFileNumber + 1 || destFileNumber === currFileNumber - 1)) ||
          ((destFileNumber === currFileNumber + 1 || destFileNumber === currFileNumber - 1) &&
            (destToRank === currInRank + 1 || destToRank === currInRank - 1))
        ) {
          const val2 = this._checkChessCells(
            currInRank,
            currFileNumber,
            destToRank,
            destFileNumber,
            playerColor,
          );
          if (val2 === 'Empty' || val2 === 'Piece on the board') {
            return true;
          }
        }
        return false;
      case 'Q':
        if (destFileNumber > currFileNumber) {
          diffFile = destFileNumber - currFileNumber;
        } else {
          diffFile = currFileNumber - destFileNumber;
        }
        if (destToRank > currInRank) {
          diffRank = destToRank - currInRank;
        } else {
          diffRank = currInRank - destToRank;
        }
        if (
          (destToRank === currInRank && destFileNumber !== currFileNumber) ||
          (destFileNumber === currFileNumber && destToRank !== currFileNumber)
        ) {
          result = this._checkChessCells(
            currInRank,
            currFileNumber,
            destToRank,
            destFileNumber,
            playerColor,
          );
          if (result === 'Empty' || result === 'Capture Possible') {
            return true;
          }
        }
        if (destFileNumber !== currFileNumber && destToRank !== currInRank) {
          if (diffFile !== diffRank) {
            return false;
          }
          result = this._checkChessCells(
            currInRank,
            currFileNumber,
            destToRank,
            destFileNumber,
            playerColor,
          );
          if (result === 'Empty' || result === 'Capture Possible') {
            return true;
          }
        }
        break;
      case 'R':
        if (
          (destToRank === currInRank && destFileNumber !== currFileNumber) ||
          (destFileNumber === currFileNumber && destToRank !== currInRank)
        ) {
          result = this._checkChessCells(
            currInRank,
            currFileNumber,
            destToRank,
            destFileNumber,
            playerColor,
          );
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

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param _player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  public _join(player: Player): void {
    if (this.state.white === player.id || this.state.black === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.white) {
      this.state = {
        ...this.state,
        white: player.id,
      };
    } else if (!this.state.black) {
      this.state = {
        ...this.state,
        black: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.white && this.state.black) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other player.
   * If the game does not yet have two players in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param _player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (!this._hasPlayer(player.id)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    } else if (this._fullGame() && this.state.status === 'IN_PROGRESS') {
      this.state.status = 'OVER';
      if (this.state.white === player.id) {
        this.state.winner = this.state.black;
      } else this.state.winner = this.state.white;
      this.updateLeaderBoard()
    } else if (this._onlyOnePlayer()) {
      this.state.status = 'WAITING_TO_START';
      this.state.white = undefined;
    }
  }

  /**
   * Decides and returns whether the game is full with two players
   *
   * @returns boolean true if there are two players in the game
   */
  private _fullGame(): boolean {
    if (this.state.white && this.state.black) return true;
    return false;
  }

  /**
   * Decides and returs whether or not there is only one player in the game, meaing a partial game
   *
   * @returns boolean true if there is only one, x player or false is not
   */
  public _onlyOnePlayer(): boolean {
    if (this.state.white && !this.state.black) return true;
    return false;
  }

  /**
   * Decides and returs whether or not if a player is in the game state
   *
   * @param playerID the id of the player
   * @returns boolean true if a player is already present in the game or else false
   */
  private _hasPlayer(playerID: string): boolean {
    let playerPresentInGame = false;
    if (this.state.white && this.state.white === playerID) {
      playerPresentInGame = true;
    } else if (this.state.black && this.state.black === playerID) {
      playerPresentInGame = true;
    }
    return playerPresentInGame;
  }

  /**
   * Update the board in current game state with the given move
   *
   * @param move the move to update the board with
   */
  updateChessBoard(move: ChessMove): void {
    const updatedBoard: ChessCell[][] = [];
    for (let i = 0; i < CHESS_BOARD_SIZE; i++) {
      updatedBoard.push(Array(8).fill(undefined));
      for (let j = 0; j < CHESS_BOARD_SIZE; j++) {
        const currentCell = this.state.board[i][j];
        let updatedCell: ChessCell;
        if (
          i === this._rankToRow(move.destinationRank) &&
          j === this._fileToColumn(move.destinationFile)
        ) {
          updatedCell = {
            piece: move.gamePiece,
          };
          updatedBoard[i][j] = updatedCell;
        } else if (currentCell) {
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
    this.state.board = updatedBoard as ReadonlyArray<ChessCell[]>;
  }

  /**
   * Returns a new chess board with all the pieces
   *
   * The board is an 8x8 array of ChessCell, which contains the piece and its color.
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[7][7] is the bottom-right cell
   */
  initializeChessBoard(): void {
    // Initialize an 8x8 array of ChessCells with null values to represent the empty squares
    const board: ChessCell[][] = Array(8)
      .fill(undefined)
      .map(() => Array(8).fill(undefined));
    // Function to translate file to array index
    const fileToIndex = (file: ChessFilePosition): number => file.charCodeAt(0) - 'a'.charCodeAt(0);
    // Initialize board with pieces in initial positions
    const initialPositions: { [key: string]: ChessPiece } = {
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
      const file = key[0] as ChessFilePosition;
      const rank = parseInt(key[1], 10) as ChessRankPosition;
      if (piece) {
        const cell: ChessCell = {
          piece,
        };
        board[this._rankToRow(rank)][this._fileToColumn(file)] = cell;
      }
    });

    this.state.board = board as ReadonlyArray<ChessCell[]>;
  }

  protected _getKingPosition(color: 'W' | 'B'): ChessPosition {
    for (let rank = 1; rank <= 8; rank++) {
      for (const fileKey of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        const fileIndex = this._fileToIndex(fileKey as ChessFilePosition);
        const piece = this.state.board[rank - 1][fileIndex];
        if (piece?.piece.pieceType === 'K' && piece?.piece.pieceColor === color) {
          return {
            rank: rank as ChessRankPosition,
            file: fileKey as ChessFilePosition,
          };
        }
      }
    }
    throw new Error('King not found');
  }

  protected _getAllPossibleMoves(color: 'W' | 'B'): ChessMove[] {
    const allMoves: ChessMove[] = [];
    for (let rank = 1; rank <= CHESS_BOARD_SIZE; rank++) {
      for (let file = 0; file < CHESS_BOARD_SIZE; file++) {
        const chessFile = this._indexToFile(file) as ChessFilePosition;
        const chessRank = rank as ChessRankPosition;
        const cell = this.state.board[this._rankToRow(chessRank)][file];
        if (cell && cell.piece.pieceColor === color) {
          const moves = this.possibleMoves(chessRank, chessFile);
          allMoves.push(...moves);
        }
      }
    }
    return allMoves;
  }

  protected _getPieces(color: 'W' | 'B'): PieceWithPosition[] {
    const pieces: PieceWithPosition[] = [];
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const cell = this.state.board[rank][file];
        if (cell && cell.piece.pieceColor === color) {
          pieces.push({
            type: cell.piece,
            color: cell.piece.pieceColor,
            position: {
              rank: (rank + 1) as ChessRankPosition,
              file: this._indexToFile(file) as ChessFilePosition,
            },
          });
        }
      }
    }
    return pieces;
  }

  private _fileToIndex(file: ChessFilePosition): number {
    const fileMap: { [key in ChessFilePosition]: number } = {
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

  private _indexToFile(index: number): ChessFilePosition {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return files[index] as ChessFilePosition;
  }

  /**
   * Determines if the current position is a checkmate.
   * Checkmate occurs when a player's king is in a position to be captured (in "check")
   * and there is no legal move that player can make to escape the check. This method
   * should analyze the game state to determine if these conditions are met.
   *
   * @returns {boolean} - True if the position is a checkmate, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid or if the checkmate
   *                   condition cannot be determined with the provided information.
   */

  public isCheckmate(): boolean {
    // Determine the current player's color
    const currentPlayerColor = this.state.moves.length % 2 === 0 ? 'W' : 'B';

    if (!this.isKingInCheck(currentPlayerColor)) {
      return false;
    }

    const allPossibleMoves = this._getAllPossibleMoves(currentPlayerColor);

    // Test each move to see if it can take the king out of check
    for (const move of allPossibleMoves) {
      // Backup the current state
      const originalState = { ...this.state };
      // Apply the move temporarily
      this.updateChessBoard(move);

      const stillInCheck = this.isKingInCheck(currentPlayerColor);

      // Restore the original state
      this.state = originalState;
      // If the king is not in check after this move, it's not checkmate
      if (!stillInCheck) {
        return false;
      }
    }
    // If no move gets the king out of check, it's checkmate
    return true;
  }

  protected _applyMoveToTemporaryBoard(move: ChessMove): ChessGameState {
    // Create a new game state object by copying the existing one
    const tempGameState: ChessGameState = {
      ...this.state,
      moves: [...this.state.moves, move], // Add the new move to the end of the moves array
    };

    const tempBoard = this.state.board;

    // Translate the files to indices
    const fromFileIndex = this._fileToIndex(move.currentFile);
    const toFileIndex = this._fileToIndex(move.destinationFile);

    // Translate the ranks to indices
    const fromRankIndex = move.currentRank - 1;
    const toRankIndex = move.destinationRank - 1;

    // Get the piece being moved from the temporary board
    const piece = tempBoard[fromRankIndex][fromFileIndex];

    // Move the piece to the destination in the temporary board
    tempBoard[toRankIndex][toFileIndex] = piece;

    // Clear the starting square in the temporary board
    tempBoard[fromRankIndex][fromFileIndex] = undefined;

    // Return the updated game state
    return tempGameState;
  }

  /**
   * Retunrs wheterh a set of indices are valid in the chess board
   *
   * @param rowIndex
   * @param colIndex
   */
  private _validIndex(rowIndex: number, colIndex: number) {
    return rowIndex <= 7 && rowIndex >= 0 && colIndex <= 7 && colIndex >= 0;
  }

  /**
   * Returns whether the given square is under attack by the given player color
   *
   * @param rowIndex
   * @param colIndex
   * @param color
   * @param altBoard a alternative board to use for seeing futur effects of moves
   */
  public underAttack(
    rowIndex: number,
    colIndex: number,
    player: 'W' | 'B',
    altBoard?: ChessCell[][],
  ) {
    let board: Readonly<ChessCell[][]>;
    if (altBoard) {
      board = altBoard;
    } else {
      board = this.state.board;
    }
    const playerColor = player;

    // check the square is not under attack by a pawn
    let rightAttackRowI = rowIndex - 1;
    let rightAttackColI = colIndex + 1;
    let leftAttackRowI = rowIndex - 1;
    let leftAttackColI = colIndex - 1;
    if (playerColor === 'W') {
      rightAttackRowI = rowIndex - 1;
      rightAttackColI = colIndex + 1;
      leftAttackRowI = rowIndex - 1;
      leftAttackColI = colIndex - 1;
    } else {
      rightAttackRowI = rowIndex + 1;
      rightAttackColI = colIndex + 1;
      leftAttackRowI = rowIndex + 1;
      leftAttackColI = colIndex - 1;
    }
    if (this._validIndex(rightAttackRowI, rightAttackColI)) {
      if (
        board[rightAttackRowI][rightAttackColI] &&
        board[rightAttackRowI][rightAttackColI]?.piece.pieceColor !== playerColor &&
        board[rightAttackRowI][rightAttackColI]?.piece.pieceType === 'P'
      ) {
        return true;
      }
    }
    if (this._validIndex(leftAttackRowI, leftAttackColI)) {
      if (
        board[leftAttackRowI][leftAttackColI] &&
        board[leftAttackRowI][leftAttackColI]?.piece.pieceColor !== playerColor &&
        board[leftAttackRowI][leftAttackColI]?.piece.pieceType === 'P'
      ) {
        return true;
      }
    }

    // check square is in attack by knight
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
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
          board[checkRowIndex][checkColIndex]?.piece.pieceType === 'N'
        ) {
          return true;
        }
      }
    }

    // check square in attack digonally or linearly (by bishop or queen)
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
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor === playerColor
        ) {
          break;
        }
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
          initialPath.type === 'D'
        ) {
          if (
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'B' ||
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q'
          ) {
            return true;
          }
          if (!checkedKing && board[checkRowIndex][checkColIndex]?.piece.pieceType === 'K') {
            return true;
          }
        }
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
          initialPath.type === 'H'
        ) {
          if (
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'R' ||
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q'
          ) {
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

  /**
   * Returns whether a certain player is in check
   *
   * @param player the player to check if in check
   */
  public isKingInCheck(player: PlayerID, tempBoard?: ChessCell[][]) {
    let board: Readonly<ChessCell[][]>;
    if (tempBoard) {
      board = tempBoard;
    } else {
      board = this.state.board;
    }
    const playerColor = this._playerColor(player);
    const kingLocation = this._getKingPosition(playerColor);
    const kingRow = this._rankToRow(kingLocation.rank);
    const colIndex = this._fileToColumn(kingLocation.file);

    // check king is not checked by a pawn
    let rightAttackRowI = kingRow - 1;
    let rightAttackColI = colIndex + 1;
    let leftAttackRowI = kingRow - 1;
    let leftAttackColI = colIndex - 1;
    if (playerColor === 'W') {
      rightAttackRowI = kingRow - 1;
      rightAttackColI = colIndex + 1;
      leftAttackRowI = kingRow - 1;
      leftAttackColI = colIndex - 1;
    } else {
      rightAttackRowI = kingRow + 1;
      rightAttackColI = colIndex + 1;
      leftAttackRowI = kingRow + 1;
      leftAttackColI = colIndex - 1;
    }
    if (this._validIndex(rightAttackRowI, rightAttackColI)) {
      if (
        board[rightAttackRowI][rightAttackColI] &&
        board[rightAttackRowI][rightAttackColI]?.piece.pieceColor !== playerColor &&
        board[rightAttackRowI][rightAttackColI]?.piece.pieceType === 'P'
      ) {
        return true;
      }
    }
    if (this._validIndex(leftAttackRowI, leftAttackColI)) {
      if (
        board[leftAttackRowI][leftAttackColI] &&
        board[leftAttackRowI][leftAttackColI]?.piece.pieceColor !== playerColor &&
        board[leftAttackRowI][leftAttackColI]?.piece.pieceType === 'P'
      ) {
        return true;
      }
    }

    // check king in attack by knight
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
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
          board[checkRowIndex][checkColIndex]?.piece.pieceType === 'N'
        ) {
          return true;
        }
      }
    }

    // check king in attack digonally or linearly (by bishop or queen)
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
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor === playerColor
        ) {
          break;
        }
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
          initialPath.type === 'D'
        ) {
          if (
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'B' ||
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q'
          ) {
            return true;
          }
        }
        if (
          board[checkRowIndex][checkColIndex] &&
          board[checkRowIndex][checkColIndex]?.piece.pieceColor !== playerColor &&
          initialPath.type === 'H'
        ) {
          if (
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'R' ||
            board[checkRowIndex][checkColIndex]?.piece.pieceType === 'Q'
          ) {
            return true;
          }
        }
        checkRowIndex += initialPath.row;
        checkColIndex += initialPath.col;
      }
    }
    return false;
  }

  /**
   * Determines if the current position is a stalemate.
   * A stalemate occurs when the player to move is not in check but has no legal move.
   *
   * @returns {boolean} - True if the position is a stalemate, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */

  public isStalemate(): boolean {
    // Determine the current player's color
    const currentPlayerColor = this.state.moves.length % 2 === 0 ? 'W' : 'B';

    if (this.isKingInCheck(currentPlayerColor)) {
      return false;
    }

    const allPossibleMoves = this._getAllPossibleMoves(currentPlayerColor);

    // If there are no legal moves, it's a stalemate
    return allPossibleMoves.length === 0;
  }

  /**
   * Determines if a player ('W' or 'B') can perform castling on 'K' or 'Q' side
   * Castling is a move that involves the king and either of the original rooks.
   * @returns {boolean} - True if castling is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */
  public canCastle(player: 'W' | 'B', side: 'K' | 'Q'): boolean {
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
    } else {
      rookColIndex = 0;
    }
    if (board[kingRow][kingCol]?.piece.moved && board[kingRow][kingCol]?.piece.moved === true) {
      canCastle = false;
    } else if (
      board[rookRowIndex][rookColIndex]?.piece.moved &&
      board[rookRowIndex][rookColIndex]?.piece.moved === true
    ) {
      canCastle = false;
    }
    return canCastle; // Default return value
  }

  /**
   * Determines if en passant is possible for a given pawn position.
   * En passant is a special pawn capture that can only occur immediately after a pawn moves two squares forward from its starting position.
   *
   * @param {ChessMove} lastMove - The last move made in the game, to check if it was a two-square pawn advance.
   * @param {ChessMove} currentMove - The current move being made, check if the previous move is in the same rank and the difference in file is by 1
   * @returns {boolean} - True if en passant capture is possible, otherwise false.
   */

  public canEnPassant(lastMove: ChessMove, currentMove: ChessMove): boolean {
    const currentMovesFileNumber = this._fileToIndex(currentMove.currentFile);
    const lastMovesFileNumber = this._fileToIndex(lastMove.destinationFile);

    // Checks the previous moves and determines whether it was a pawn with an initial movement of 2
    if (
      lastMove.gamePiece.pieceType === 'P' &&
      ((lastMove.gamePiece.pieceColor === 'B' &&
        lastMove.currentRank - 1 === 6 &&
        lastMove.destinationRank - 1 === 4) ||
        (lastMove.gamePiece.pieceColor === 'W' &&
          lastMove.currentRank - 1 === 1 &&
          lastMove.destinationRank - 1 === 3)) &&
      (lastMovesFileNumber === currentMovesFileNumber + 1 ||
        lastMovesFileNumber === currentMovesFileNumber - 1)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Promotes a pawn to a new piece if it reaches the opposite end of the board.
   *
   * @param pawnPosition The current position of the pawn to be promoted.
   * @param newPiece The new piece type to which the pawn is to be promoted.
   * @returns {boolean} - Returns true if promotion was successful, false otherwise.
   */
  public promotePawn(pawnPosition: ChessPosition, newPiece: ChessPiece): boolean {
    const { rank, file } = pawnPosition;
    const pawnCell = this.state.board[this._rankToRow(rank)][this._fileToColumn(file)];
    // Check if the cell contains a pawn and it is in the correct position for promotion
    if (
      pawnCell &&
      pawnCell.piece.pieceType === 'P' &&
      ((pawnCell.piece.pieceColor === 'B' && rank === 8) ||
        (pawnCell.piece.pieceColor === 'W' && rank === 1))
    ) {
      // Promote the pawn
      this.state.board[this._rankToRow(rank)][this._fileToColumn(file)] = {
        piece: newPiece,
      };
      return true;
    }

    // Return false if promotion is not valid
    return false;
  }

  /**
   * Updates the database to include the winner of the game state
   * If the username of the player is not found, insert the player into the leaderboard with their username, wins, ties and losses
   * If found, check the state for who won. If the game is set to over and winner is undecided the game ended in a tie.
   */
  public updateLeaderBoard(): void {
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
      } else if (this.state.winner === this._players[0].id && this.state.status === 'OVER') {
        winPlayer1 += 1;
      } else {
        lossPlayer1 += 1;
      }
      databaseUpdate.addUser(this._players[0].userName, winPlayer1, tiePlayer1, lossPlayer1);
    } else if (this.state.winner === undefined && this.state.status === 'OVER') {
      databaseUpdate.updateLeaderBoardRow(this._players[0].userName, 'ties');
    } else if (this.state.winner === this._players[0].userName && this.state.status === 'OVER') {
      databaseUpdate.updateLeaderBoardRow(this._players[0].userName, 'wins');
    } else {
      databaseUpdate.updateLeaderBoardRow(this._players[0].userName, 'losses');
    }
    if (result2 === undefined) {
      if (this.state.winner === undefined && this.state.status === 'OVER') {
        tiePlayer2 += 1;
      } else if (this.state.winner === this._players[1].id && this.state.status === 'OVER') {
        winPlayer2 += 1;
      } else {
        lossPlayer2 += 1;
      }
      databaseUpdate.addUser(this._players[1].userName, winPlayer2, tiePlayer2, lossPlayer2);
    } else if (this.state.winner === undefined && this.state.status === 'OVER') {
      databaseUpdate.updateLeaderBoardRow(this._players[1].userName, 'ties');
    } else if (this.state.winner === this._players[1].userName && this.state.status === 'OVER') {
      databaseUpdate.updateLeaderBoardRow(this._players[1].userName, 'wins');
    } else {
      databaseUpdate.updateLeaderBoardRow(this._players[1].userName, 'losses');
    }
  }

  /**
   * Updates the game history in the database after each move.
   *
   * @param gameId The unique identifier for the game.
   * @param newMove The new move to be added to the game's history.
   */
  async updateGameHistory(gameId: string, newMove: string, newMoveName: string): Promise<void> {
    // Fetch the current game history from the database
    const gameData = await databaseUpdate.getGameHistory(gameId);
    if (!gameData) {
      throw new Error('Game not found in database');
    }

    // Parse the existing moves and add the new move
    const { moves } = gameData;
    moves.push(newMove);
    const updatedMovesJSON = JSON.stringify(moves);
    const { moveNames } = gameData;
    moveNames.push(newMoveName);
    const updatedMoveNamesJSON = JSON.stringify(moveNames);

    // Update the game history in the database
    await databaseUpdate.updateGameHistory(gameId, updatedMovesJSON, updatedMoveNamesJSON);
  }

  /**
   * Logic for updated state based on draw offer, accept and reject
   * @param message
   * @param player
   */
  public drawGame(message: string, player: Player) {
    if (this.state.status === 'IN_PROGRESS') {
      if (message === 'offer') {
        if (this.state.drawOffer && this.state.drawOffer !== player.id) {
          this.state.drawAccept = player.id;
          this.state.winner = undefined;
          this.state.status = 'OVER';
          this.updateLeaderBoard();
        } else {
          this.state.drawOffer = player.id;
        }
      } else if (
        message === 'accept' &&
        this.state.drawOffer &&
        this.state.drawOffer !== player.id
      ) {
        this.state.drawAccept = player.id;
        this.state.winner = undefined;
        this.state.status = 'OVER';
        this.updateLeaderBoard();
      } else if (
        message === 'reject' &&
        this.state.drawOffer &&
        this.state.drawOffer !== player.id
      ) {
        this.state.drawOffer = undefined;
        this.state.drawAccept = undefined;
      }
    } else {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
  }
}
