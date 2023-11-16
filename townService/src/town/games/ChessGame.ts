// TODO: remove all eslint-disable
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Player from '../../lib/Player';
import {
  GameMove,
  ChessGameState,
  ChessMove,
  ChessFilePosition,
  ChessRankPosition,
  PieceWithPosition,
  Position,
} from '../../types/CoveyTownSocket';
import Game from './Game';

export type ChessPiece = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | undefined; // Kings, Queens, Rooks, Bishops, Knights, Pawns
export type ChessCell =
  | { piece: ChessPiece; color: 'W' | 'B' }
  | { piece: undefined; color: undefined };

/**
 * A ChessGame is a Game that implements the rules of Chess.
 * @see https://en.wikipedia.org/wiki/Chess
 */
export default class ChessGame extends Game<ChessGameState, ChessMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
    });
  }

  /*
   * Makes API request to obtain best possible move for current game state and returns the move
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid (with specific message noted above)
   */
  protected _bestMove(): GameMove<ChessMove> {
    // eslint-disable-next-line prettier/prettier
    throw new Error('Remove Before Implementing');
  }

  /**
   * Returns all possible moves for the piece at the given rank and file
   * @param _rank The rank position
   * @param _file The file position
   */
  protected _possibleMoves(_rank: ChessRankPosition, _file: ChessFilePosition): void {
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
   * Returns the current state of the board.
   *
   * The board is an 8x8 array of ChessCell, which contains the piece and its color.
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[7][7] is the bottom-right cell
   */
  get board(): ChessCell[][] {
    // Initialize an 8x8 array of ChessCells
    const board: ChessCell[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Function to translate file to array index
    const fileToIndex = (file: ChessFilePosition): number => file.charCodeAt(0) - 'a'.charCodeAt(0);

    // Initialize board with pieces in initial positions
    // For simplicity, only pawns and a few pieces are shown. You'll need to initialize all pieces.
    const initialPositions: { [key: string]: ChessPiece } = {
      a1: 'R',
      b1: 'N',
      c1: 'B',
      d1: 'Q',
      e1: 'K',
      f1: 'B',
      g1: 'N',
      h1: 'R',
      a2: 'P',
      b2: 'P',
      c2: 'P',
      d2: 'P',
      e2: 'P',
      f2: 'P',
      g2: 'P',
      h2: 'P',
      a7: 'P',
      b7: 'P',
      c7: 'P',
      d7: 'P',
      e7: 'P',
      f7: 'P',
      g7: 'P',
      h7: 'P',
      a8: 'R',
      b8: 'N',
      c8: 'B',
      d8: 'Q',
      e8: 'K',
      f8: 'B',
      g8: 'N',
      h8: 'R',
    };
    Object.entries(initialPositions).forEach(([key, piece]) => {
      const file = key[0] as ChessFilePosition;
      const rank = parseInt(key[1], 10) as ChessRankPosition;
      const color: 'W' | 'B' = rank > 6 ? 'B' : 'W';
      board[rank - 1][fileToIndex(file)] = { piece, color };
    });
    return board;
  }

  private _getKingPosition(color: 'W' | 'B'): Position {
    for (let rank = 1; rank <= 8; rank++) {
      for (const fileKey of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        const fileIndex = this._fileToIndex(fileKey as ChessFilePosition);
        const piece = this.board[rank][fileIndex];
        if (piece.piece === 'K' && piece.color === color) {
          return {
            rank: (rank + 1) as ChessRankPosition,
            file: fileKey as ChessFilePosition,
          };
        }
      }
    }
    throw new Error('King not found');
  }

  private _getAllPossibleMoves(color: 'W' | 'B'): ChessMove[] {
    const pieces = this._getPieces(color);
    let moves: ChessMove[] = [];

    pieces.forEach(piece => {
      moves = moves.concat(this._possibleMoves(piece.position.rank, piece.position.file));
    });

    return moves;
  }

  private _getPieces(color: 'W' | 'B'): PieceWithPosition[] {
    const pieces: PieceWithPosition[] = [];
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const cell = this.board[rank][file];
        if (cell && cell.color === color) {
          pieces.push({
            type: cell.piece,
            color: cell.color,
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
   * @param {ChessGameState} gameState - The current state of the chess game.
   * @returns {boolean} - True if the position is a checkmate, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid or if the checkmate
   *                   condition cannot be determined with the provided information.
   */

  public isCheckmate(gameState: ChessGameState): boolean {
    // Determine the current player's color based on the number of moves
    const currentPlayerColor = gameState.moves.length % 2 === 0 ? 'W' : 'B';
    // Find the king's position for the current player
    const kingPosition = this._getKingPosition(currentPlayerColor);
    // If the king is not in check, then it's not checkmate
    if (!this._isKingInCheck(kingPosition, gameState, currentPlayerColor)) {
      return false;
    }
    // Get all possible moves for the current player
    const allPossibleMoves = this._getAllPossibleMoves(currentPlayerColor);
    // Check if any move can take the king out of check
    return !allPossibleMoves.some(move => {
      // Apply each move to a hypothetical game state
      const hypotheticalGameState = this._applyMoveToTemporaryBoard(move, gameState);
      // Check if the king would still be in check after the move
      return !this._isKingInCheck(this._getKingPosition(currentPlayerColor, hypotheticalGameState), hypotheticalGameState, currentPlayerColor);
    });
  }

  private _applyMoveToTemporaryBoard(move: ChessMove, gameState: ChessGameState): ChessGameState {
    // Create a new game state object by copying the existing one
    const tempGameState: ChessGameState = {
      ...gameState,
      moves: [...gameState.moves, move], // Add the new move to the end of the moves array
    };

    // Assuming we have a method that can apply all moves to get the current board state
    const tempBoard = this.board;

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
    tempBoard[fromRankIndex][fromFileIndex] = { piece: undefined, color: undefined };

    // Now, you would need a way to convert this tempBoard back into moves
    // if your gameState strictly represents the game only in moves and not as a board state.

    // Return the updated game state
    return tempGameState;
  }

  private _isKingInCheck(arg0: Position, hypotheticalGameState: any, currentPlayerColor: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Determines if the current position is a stalemate.
   * A stalemate occurs when the player to move is not in check but has no legal move.
   *
   * @param {ChessGameState} gameState - The current state of the chess game.
   * @returns {boolean} - True if the position is a stalemate, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */

  public isStalemate(gameState: ChessGameState): boolean {
    const gameStated = gameState;
    return false; // Default return value
  }

  /**
   * Determines if a player can perform castling.
   * Castling is a move that involves the king and either of the original rooks.
   *
   * @param {ChessGameState} gameState - The current state of the chess game.
   * @returns {boolean} - True if castling is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */
  public canCastle(gameState: ChessGameState): boolean {
    const gameStated = gameState;
    return false; // Default return value
  }
  /**
   * Determines if en passant is possible for a given pawn position.
   * En passant is a special pawn capture that can only occur immediately after a pawn moves two squares forward from its starting position.
   *
   * @param {ChessGameState} gameState - The current state of the chess game.
   * @param {ChessMove} lastMove - The last move made in the game, to check if it was a two-square pawn advance.
   * @returns {boolean} - True if en passant capture is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state or last move is not valid.
   */

  public canEnPassant(gameState: ChessGameState, lastMove: ChessMove): boolean {
    const gameStated = gameState;
    const lastMoved = lastMove;
    return false; // Default return value
  }

  /**
   * Determines if a pawn promotion is possible at the current position.
   * Pawn promotion occurs when a pawn reaches the farthest row from its starting position.
   *
   * @param {ChessGameState} gameState - The current state of the chess game.
   * @returns {boolean} - True if pawn promotion is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */
  public canPromotePawn(gameState: ChessGameState): boolean {
    const gameStated = gameState;
    return false; // Default return value, to be implemented.
  }
}
