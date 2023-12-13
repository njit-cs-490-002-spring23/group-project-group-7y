import {
  GameArea,
  GameStatus,
  ChessGameState,
  ChessCell,
  ChessFilePosition,
  ChessPiece,
  ChessRankPosition,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type ChessEvents = GameEventTypes & {
  boardChanged: (board: ChessCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class ChessAreaController extends GameAreaController<ChessGameState, ChessEvents> {
  /**
   * Returns the current state of the board.
   *
   * The board is a 3x3 array of ChessCell, which is either 'X', 'O', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[2][2] is the bottom-right cell
   */
  get board(): ChessCell[][] {
    const board: ChessCell[][] = Array(8)
      .fill(undefined)
      .map(() => Array(8).fill(undefined));
    const fileToIndex = (file: ChessFilePosition): number => file.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankToIndex = (rank: ChessRankPosition): number => 8 - rank;
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
        board[rankToIndex(rank)][fileToIndex(file)] = cell;
      }
    });
    return board;
  }

  /**
   * Returns the player with the 'X' game piece, if there is one, or undefined otherwise
   */
  get white(): PlayerController | undefined {
    return this._players.find(eachPlayer => eachPlayer.id === this._model.game?.state.white);
  }

  /**
   * Returns the player with the 'O' game piece, if there is one, or undefined otherwise
   */
  get black(): PlayerController | undefined {
    return this._players.find(eachPlayer => eachPlayer.id === this._model.game?.state.black);
  }

  /**
   * Returns the number of moves that have been made in the game
   */
  get moveCount(): number {
    const numberOfMoves = this._model.game?.state.moves.length;
    return numberOfMoves ? numberOfMoves : 0;
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    return this._players.find(eachPlayer => eachPlayer.id === this._model.game?.state.winner);
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   */
  get whoseTurn(): PlayerController | undefined {
    if (this._model.game && this._model.game.state.status === 'IN_PROGRESS') {
      return this.moveCount % 2 === 0 ? this.white : this.black;
    }
    return undefined;
  }

  /**
   * Returns true if it is our turn to make a move in the game
   * Returns false if it is not our turn, or if the game is not in progress
   */
  get isOurTurn(): boolean {
    return (this._model.game &&
      this._model.game.state.status === 'IN_PROGRESS' &&
      this.whoseTurn === this._townController.ourPlayer) as boolean;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return (
      this._townController.ourPlayer === this.white || this._townController.ourPlayer === this.black
    );
  }

  /**
   * Returns the game piece of the current player, if the current player is a player in this game
   *
   * Throws an error PLAYER_NOT_IN_GAME_ERROR if the current player is not a player in this game
   */
  get gamePiece(): 'W' | 'B' {
    if (!this.isPlayer) throw new Error(PLAYER_NOT_IN_GAME_ERROR);
    return this._townController.ourPlayer.id === this.white?.id ? 'W' : 'B';
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    return this.isActive() ? 'IN_PROGRESS' : 'WAITING_TO_START';
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    return this._model.game !== undefined && this._model.game.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this ChessAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */
  protected _updateFrom(newModel: GameArea<ChessGameState>): void {
    const boardBeforeUpdate = this.board;
    const turnBeforeUpdate = this.whoseTurn;
    super._updateFrom(newModel);
    let boardChangedFlag = false;
    for (let i = 0; i < 3; i += 1) {
      if (boardChangedFlag) break;
      for (let j = 0; j < 3; j += 1) {
        const cellBeforeUpdate = boardBeforeUpdate[i][j];
        const cellAfterUpdate = this.board[i][j];
        if ((cellBeforeUpdate || cellAfterUpdate) && cellBeforeUpdate !== cellAfterUpdate) {
          boardChangedFlag = true;
          break;
        }
      }
    }
    if (boardChangedFlag) this.emit('boardChanged', this.board);
    if ((turnBeforeUpdate || this.whoseTurn) && turnBeforeUpdate?.id !== this.whoseTurn?.id) {
      this.emit('turnChanged', this.isOurTurn);
    }
  }

  /**
   * Sends a request to the server to make a move in the game.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'GameMove',
   * and send the gameID provided by `this._instanceID`.
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param row Row of the move
   * @param col Column of the move
   */
  public async makeMove(
    gamePiece: ChessPiece,
    currentRank: ChessRankPosition,
    currentFile: ChessFilePosition,
    destinationRank: ChessRankPosition,
    destinationFile: ChessFilePosition,
    enPassant: boolean,
  ) {
    if (!this._instanceID || !this.isActive()) throw new Error(exports.NO_GAME_IN_PROGRESS_ERROR);
    else {
      await this._townController.sendInteractableCommand(this.id, {
        gameID: this._instanceID,
        move: {
          gamePiece: gamePiece,
          currentRank: currentRank,
          currentFile: currentFile,
          destinationRank: destinationRank,
          destinationFile: destinationFile,
          enPassant: enPassant,
        },
        type: 'GameMove',
      });
    }
  }
}
