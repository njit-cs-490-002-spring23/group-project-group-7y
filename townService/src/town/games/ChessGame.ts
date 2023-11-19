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
import Game from './Game';

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
  public async bestMove(): Promise<ChessMove> {
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
  protected _possibleMoves(_rank: ChessRankPosition, _file: ChessFilePosition): ChessMove[] {
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
  public applyMove(_move: GameMove<ChessMove>): void {}

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param _player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  public _join(_player: Player): void {}

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

  // TODO: change _color to color, and uncomment code when possibleMoves is done.
  protected _getAllPossibleMoves(_color: 'W' | 'B'): ChessMove[] {
    // const pieces = this._getPieces(color);
    // let moves: ChessMove[] = [];
    // pieces.forEach(piece => {
    //   moves = moves.concat(this._possibleMoves(piece.position.rank, piece.position.file));
    // });

    // return moves;
    return [];
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
    // Determine the current player's color based on the number of moves
    const currentPlayerColor = this.state.moves.length % 2 === 0 ? 'W' : 'B';
    // Find the king's position for the current player
    const kingPosition = this._getKingPosition(currentPlayerColor);
    // If the king is not in check, then it's not checkmate
    // TODO: Uncomment when isKingInCheck is implemented
    // if (!this._isKingInCheck(kingPosition, gameState, currentPlayerColor)) {
    //   return false;
    // }
    // Get all possible moves for the current player
    const allPossibleMoves = this._getAllPossibleMoves(currentPlayerColor);
    // Check if any move can take the king out of check
    return !allPossibleMoves.some(move => {
      // Apply each move to a hypothetical game state
      const hypotheticalGameState = this._applyMoveToTemporaryBoard(move);
      // Check if the king would still be in check after the move
      // TODO: Uncomment when isKingInCheck is implemented, then remove the return false
      // return !this._isKingInCheck(this._getKingPosition(currentPlayerColor, hypotheticalGameState), hypotheticalGameState, currentPlayerColor);
      // Default return for now
      return false;
    });
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
          const moves = this._possibleMoves(this._rowToRank(i), this._columnToFile(j));
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
    return false; // Default return value
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
   * @returns {boolean} - True if en passant capture is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state or last move is not valid.
   */

  public canEnPassant(lastMove: ChessMove): boolean {
    const lastMoved = lastMove;
    return false; // Default return value
  }

  /**
   * Determines if a pawn promotion is possible at the current position.
   * Pawn promotion occurs when a pawn reaches the farthest row from its starting position.
   *
   * @returns {boolean} - True if pawn promotion is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */
  public canPromotePawn(): boolean {
    return false; // Default return value, to be implemented.
  }
}
