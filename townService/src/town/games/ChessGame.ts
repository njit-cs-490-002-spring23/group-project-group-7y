// TODO: remove all eslint-disable
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchMiddlewares } from 'tsoa';
import axios from 'axios';
import Player from '../../lib/Player';
import {
  GameMove,
  ChessGameState,
  ChessMove,
  ChessFilePosition,
  ChessRankPosition,
  PieceWithPosition,
  ChessPosition,
  ChessCell,
  ChessPiece,
  PlayerID,
  API_CONNECTION_ERROR,
} from '../../types/CoveyTownSocket.d';
import { databaseUpdate } from './database/chessDatabase';
import Game from './Game';
import InvalidParametersError from '../../lib/InvalidParametersError';

export const CHESS_BOARD_SIZE = 8;

/**
 * A ChessGame is a Game that implements the rules of Chess.
 * @see https://en.wikipedia.org/wiki/Chess
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
            const fenPiece = currentCell.piece.pieceType?.toLowerCase();
            fen += fenPiece;
          } else {
            const fenPiece = currentCell.piece.pieceType;
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
    if (lastMove && lastMove.enPassant) {
      if (lastMove.gamePiece.pieceColor === 'W') {
        fen += `${lastMove.gamePiece.pieceType}3 `;
      } else fen += `${lastMove.gamePiece.pieceType}6 `;
    } else fen += '- ';

    fen += `${this.state.halfMoves} `;

    fen += `${Math.floor(this.state.moves.length / 2) + 1}`;
    return fen;
  }

  /*
   * Makes API request to obtain best possible move for current game state and returns the move
   *
   * @param move The move to apply to the game
   * @throws APIConnectionError if cannot acces the API
   */
  public async nextBestMove(): Promise<ChessMove> {
    const apiEndpoint = 'https://stockfish.online/api/stockfish.php';
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
   * Returns all possible moves for the piece at the given rank and file
   * @param _rank The rank position
   * @param _file The file position
   */
  public possibleMoves(_rank: ChessRankPosition, _file: ChessFilePosition): ChessMove[] {
    // eslint-disable-next-line prettier/prettier
    throw new Error('Remove Before Implementing');
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
                move.move.enPassant = true;
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
  protected _leave(_player: Player): void {}

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
      a1: { pieceType: 'R', pieceColor: 'W' },
      b1: { pieceType: 'N', pieceColor: 'W' },
      c1: { pieceType: 'B', pieceColor: 'W' },
      d1: { pieceType: 'Q', pieceColor: 'W' },
      e1: { pieceType: 'K', pieceColor: 'W' },
      f1: { pieceType: 'B', pieceColor: 'W' },
      g1: { pieceType: 'N', pieceColor: 'W' },
      h1: { pieceType: 'R', pieceColor: 'W' },
      a2: { pieceType: 'P', pieceColor: 'W' },
      b2: { pieceType: 'P', pieceColor: 'W' },
      c2: { pieceType: 'P', pieceColor: 'W' },
      d2: { pieceType: 'P', pieceColor: 'W' },
      e2: { pieceType: 'P', pieceColor: 'W' },
      f2: { pieceType: 'P', pieceColor: 'W' },
      g2: { pieceType: 'P', pieceColor: 'W' },
      h2: { pieceType: 'P', pieceColor: 'W' },
      a7: { pieceType: 'P', pieceColor: 'B' },
      b7: { pieceType: 'P', pieceColor: 'B' },
      c7: { pieceType: 'P', pieceColor: 'B' },
      d7: { pieceType: 'P', pieceColor: 'B' },
      e7: { pieceType: 'P', pieceColor: 'B' },
      f7: { pieceType: 'P', pieceColor: 'B' },
      g7: { pieceType: 'P', pieceColor: 'B' },
      h7: { pieceType: 'P', pieceColor: 'B' },
      a8: { pieceType: 'R', pieceColor: 'B' },
      b8: { pieceType: 'N', pieceColor: 'B' },
      c8: { pieceType: 'B', pieceColor: 'B' },
      d8: { pieceType: 'Q', pieceColor: 'B' },
      e8: { pieceType: 'K', pieceColor: 'B' },
      f8: { pieceType: 'B', pieceColor: 'B' },
      g8: { pieceType: 'N', pieceColor: 'B' },
      h8: { pieceType: 'R', pieceColor: 'B' },
    };
    Object.entries(initialPositions).forEach(([key, piece]) => {
      const file = key[0] as ChessFilePosition;
      const rank = parseInt(key[1], 10) as ChessRankPosition;
      if (piece) {
        const cell: ChessCell = {
          piece,
        };
        board[rank - 1][fileToIndex(file)] = cell;
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
    // Check if the king is currently in check
    if (!this.isKingInCheck(currentPlayerColor)) {
      return false;
    }
    // Get all possible moves for the current player
    const allPossibleMoves = this._getAllPossibleMoves(currentPlayerColor);
    // Test each move to see if it can take the king out of check
    for (const move of allPossibleMoves) {
      // Backup the current state
      const originalState = { ...this.state };
      // Apply the move temporarily
      this.updateChessBoard(move);
      // Check if the king is still in check after the move
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
   * Returns whether a certain player is in check
   *
   * @param player the player to check if in check
   */
  public isKingInCheck(player: PlayerID) {
    const playerColor = this._playerColor(player);
    const kingLocation = this._getKingPosition(playerColor);
    for (let i = 0; i < 8; i++) {
      const boardRow = this.state.board[i];
      for (let j = 0; j < 8; j++) {
        if (boardRow[j] && boardRow[j]?.piece.pieceColor !== playerColor) {
          const moves = this.possibleMoves(this._rowToRank(i), this._columnToFile(j));
          for (let k = 0; k < moves.length; k++) {
            if (
              moves[k].destinationFile === kingLocation.file &&
              moves[k].destinationRank === kingLocation.rank
            ) {
              return true;
            }
          }
        }
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

    // Check if the king is currently not in check
    if (this.isKingInCheck(currentPlayerColor)) {
      return false;
    }

    // Get all possible moves for the current player
    const allPossibleMoves = this._getAllPossibleMoves(currentPlayerColor);

    // If there are no legal moves, it's a stalemate
    return allPossibleMoves.length === 0;
  }
  /**
   * Determines if a player ('W' or 'B') can perform castling on 'K' or 'Q' side
   * Castling is a move that involves the king and either of the original rooks.
   * TODO: remove _ from parameters after implementation
   * @returns {boolean} - True if castling is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */
  public canCastle(_player: 'W' | 'B', _side: 'K' | 'Q'): boolean {
    return true; // Default return value
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
}
