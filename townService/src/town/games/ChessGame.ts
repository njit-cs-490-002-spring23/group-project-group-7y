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
  ChessPosition,
  ChessCell,
  ChessPiece,
} from '../../types/CoveyTownSocket';
import Game from './Game';

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
    // Initialize an 8x8 array of ChessCells with null values to represent the empty squares
    const board: ChessCell[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    // Function to translate file to array index
    const fileToIndex = (file: ChessFilePosition): number => file.charCodeAt(0) - 'a'.charCodeAt(0);
    // Initialize board with pieces in initial positions
    const initialPositions: { [key: string]: ChessPiece } = {
      a1: { pieceType: 'R', pieceColor: 'white' },
      b1: { pieceType: 'N', pieceColor: 'white' },
      c1: { pieceType: 'B', pieceColor: 'white' },
      d1: { pieceType: 'Q', pieceColor: 'white' },
      e1: { pieceType: 'K', pieceColor: 'white' },
      f1: { pieceType: 'B', pieceColor: 'white' },
      g1: { pieceType: 'N', pieceColor: 'white' },
      h1: { pieceType: 'R', pieceColor: 'white' },
      a2: { pieceType: 'P', pieceColor: 'white' },
      b2: { pieceType: 'P', pieceColor: 'white' },
      c2: { pieceType: 'P', pieceColor: 'white' },
      d2: { pieceType: 'P', pieceColor: 'white' },
      e2: { pieceType: 'P', pieceColor: 'white' },
      f2: { pieceType: 'P', pieceColor: 'white' },
      g2: { pieceType: 'P', pieceColor: 'white' },
      h2: { pieceType: 'P', pieceColor: 'white' },
      a7: { pieceType: 'P', pieceColor: 'black' },
      b7: { pieceType: 'P', pieceColor: 'black' },
      c7: { pieceType: 'P', pieceColor: 'black' },
      d7: { pieceType: 'P', pieceColor: 'black' },
      e7: { pieceType: 'P', pieceColor: 'black' },
      f7: { pieceType: 'P', pieceColor: 'black' },
      g7: { pieceType: 'P', pieceColor: 'black' },
      h7: { pieceType: 'P', pieceColor: 'black' },
      a8: { pieceType: 'R', pieceColor: 'black' },
      b8: { pieceType: 'N', pieceColor: 'black' },
      c8: { pieceType: 'B', pieceColor: 'black' },
      d8: { pieceType: 'Q', pieceColor: 'black' },
      e8: { pieceType: 'K', pieceColor: 'black' },
      f8: { pieceType: 'B', pieceColor: 'black' },
      g8: { pieceType: 'N', pieceColor: 'black' },
      h8: { pieceType: 'R', pieceColor: 'black' },
    };
    Object.entries(initialPositions).forEach(([key, piece]) => {
      const file = key[0] as ChessFilePosition;
      const rank = parseInt(key[1], 10) as ChessRankPosition;
      if (piece) {
        const cell: ChessCell = {
          piece,
          color: piece.pieceColor === 'white' ? 'W' : 'B',
        };
        board[rank - 1][fileToIndex(file)] = cell;
      }
    });

    return board;
  }

  protected _getKingPosition(color: 'W' | 'B'): ChessPosition {
    for (let rank = 1; rank <= 8; rank++) {
      for (const fileKey of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        const fileIndex = this._fileToIndex(fileKey as ChessFilePosition);
        const piece = this.board[rank - 1][fileIndex];
        if (piece?.piece.pieceType === 'K' && piece.color === color) {
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
    tempBoard[fromRankIndex][fromFileIndex] = undefined;

    // Return the updated game state
    return tempGameState;
  }

  protected _isKingInCheck(
    _arg0: ChessPosition,
    _hypotheticalGameState: unknown,
    _currentPlayerColor: string,
  ) {
    throw new Error('Method not implemented.');
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
   * Determines if a player can perform castling.
   * Castling is a move that involves the king and either of the original rooks.
   *
   * @returns {boolean} - True if castling is possible, otherwise false.
   * @throws {Error} - Throws an error if the game state is not valid.
   */
  public canCastle(): boolean {
    return false; // Default return value
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
