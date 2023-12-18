import {
  GameArea,
  GameStatus,
  ChessGameState,
  ChessCell,
  ChessFilePosition,
  ChessPiece,
  ChessRankPosition,
  BoardLocation,
  PlayerID,
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
 * This class is responsible for managing the state of the Chess, and for sending commands to the server
 */
export default class ChessAreaController extends GameAreaController<ChessGameState, ChessEvents> {
  /**
   * Returns the current state of the board.
   *
   * The board is a 8x8 array of ChessCell, which is The piece type with color, or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[7][7] is the bottom-right cell
   */
  get board(): ChessCell[][] {
    const readBoard = this.game?.state.board;
    const board: ChessCell[][] = [];
    for (let i = 0; i < 8; i++) {
      const row: ChessCell[] = [];
      for (let j = 0; j < 8; j++) {
        if (!readBoard || !readBoard[i][j] || !readBoard[i][j]?.piece) {
          row.push(undefined);
        } else if (readBoard && readBoard[i][j]?.piece) {
          const cell = readBoard[i][j]?.piece;
          if (!cell) row.push(undefined);
          else {
            row.push({
              piece: {
                pieceColor: cell.pieceColor,
                pieceType: cell.pieceType,
                moved: cell.moved,
              },
            });
          }
        }
      }
      board.push(row);
    }
    return board;
  }

  /**
   * Returns the player with the 'X' game piece, if there is one, or undefined otherwise
   */
  get game() {
    return this._model.game;
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

  public drawOfferer(): PlayerID | undefined {
    return this._model.game?.state.drawOffer;
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
    console.log('Chess Agrea State Updated Called');
    const boardBeforeUpdate = this.board;
    const turnBeforeUpdate = this.whoseTurn;
    const beforeDrawOffer = this.game?.state.drawOffer;
    super._updateFrom(newModel);
    let boardChangedFlag = false;
    for (let i = 0; i < 8; i += 1) {
      if (boardChangedFlag) break;
      for (let j = 0; j < 8; j += 1) {
        const cellBeforeUpdate = boardBeforeUpdate[i][j];
        const cellAfterUpdate = this.board[i][j];
        if (cellAfterUpdate && cellAfterUpdate) {
          if (
            cellAfterUpdate.piece.pieceColor !== cellBeforeUpdate?.piece.pieceColor ||
            cellAfterUpdate.piece.pieceType !== cellBeforeUpdate.piece.pieceColor
          ) {
            boardChangedFlag = true;
            break;
          }
        }
      }
    }
    if (boardChangedFlag) this.emit('boardChanged', this.board);
    if ((turnBeforeUpdate || this.whoseTurn) && turnBeforeUpdate?.id !== this.whoseTurn?.id) {
      this.emit('turnChanged', this.isOurTurn);
    }
    if (this.game && beforeDrawOffer !== newModel.game?.state.drawOffer) {
      this.emit('drawOffered', this.game.state.drawOffer);
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
    currentRowIndex: number,
    currentColIndex: number,
    destinationRowIndex: number,
    destinationColIndex: number,
  ) {
    const cellPiece = this._model.game?.state.board[currentRowIndex][currentColIndex]?.piece;
    if (!this._instanceID || !this.isActive()) throw new Error(exports.NO_GAME_IN_PROGRESS_ERROR);
    else if (cellPiece !== undefined) {
      await this._townController.sendInteractableCommand(this.id, {
        gameID: this._instanceID,
        move: {
          gamePiece: cellPiece,
          currentRank: this._rowToRank(currentRowIndex),
          currentFile: this._columnToFile(currentColIndex),
          destinationRank: this._rowToRank(destinationRowIndex),
          destinationFile: this._columnToFile(destinationColIndex),
        },
        type: 'GameMove',
      });
    }
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
    return 8 - rank;
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
    return (8 - rowIndex) as ChessRankPosition;
  }

  /**
   * Sends a request to the server to get the possible moves for a game piece at chess square location
   *
   * @param rowIndex
   * @param colIndex
   * @returns {ChessMove[]}
   * @throws An error if the server rejects the request to join the game.
   */
  public async possibleMoves(rowIndex: number, colIndex: number): Promise<BoardLocation[]> {
    if (!this._instanceID || !this.isActive()) throw new Error('Game Not In Progress');
    const { possibleMoves } = await this._townController.sendInteractableCommand(this.id, {
      gameID: this._instanceID,
      type: 'PossibleMoves',
      rowIndex: rowIndex,
      colIndex: colIndex,
    });
    const moves: BoardLocation[] = [];
    for (let i = 0; i < possibleMoves.length; i++) {
      const move = possibleMoves[i];
      moves.push({
        rowIndex: this._rankToRow(move.destinationRank),
        colIndex: this._fileToColumn(move.destinationFile),
      });
    }
    return moves;
  }

  /**
   * Send draw request with either offer, accept, or reject to server
   *
   * @param type accept, offer, or reject
   * @throws An error if the server rejects the request to join the game.
   */
  public async drawCommand(type: string) {
    if (!this._instanceID || !this.isActive()) throw new Error('Game Not In Progress');
    await this._townController.sendInteractableCommand(this.id, {
      gameID: this._instanceID,
      type: 'DrawGame',
      message: type,
    });
  }
}
