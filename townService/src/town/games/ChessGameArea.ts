import Player from '../../lib/Player';
import {
  GameResult,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import ChessGame from './ChessGame';
import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
/**
 * A ChessGameArea is a GameArea that hosts a TicTacToeGame.
 * @see ChessGame
 * @see GameArea
 */
export default class ChessGameArea extends GameArea<ChessGame> {
  private _type: InteractableType = 'ChessArea';

  protected getType(): InteractableType {
    return this._type;
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinGame') {
      return this.handleJoinCommand(player) as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GameMove') {
      return this.handleGameMoveCommand(
        command,
        player,
      ) as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      return this.handleLeaveGameCommand(
        command,
        player,
      ) as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  /**
   * if a game exists and it's over, this method will update this.history to include the resuls of the game that ended
   *
   */
  private _updateHistoryIfGameOver() {
    if (this.game && this.game.state.status === 'OVER') {
      const gamePlayer = this._occupants.filter(
        eachPlayer =>
          eachPlayer.id === this.game?.state.white || eachPlayer.id === this.game?.state.black,
      );
      const gameResult: GameResult = {
        gameID: this.game.id,
        scores: {},
        moves: [],
      };
      gamePlayer.forEach(player => {
        let score = 0;
        if (player.id === this.game?.state.winner) {
          score = 1;
        }
        gameResult.scores[player.userName] = score;
      });
      this._history.push(gameResult);
    }
  }

  /**
   * Handle a JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid.
   */
  public handleJoinCommand<CommandType extends InteractableCommand>(
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game) {
      this._game.join(player);
    } else {
      this._game = new ChessGame();
      this._game.join(player);
    }
    this._emitAreaChanged();
    return { gameID: this._game.id } as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Handle a GameMove (applies a move to the game) command from a player in this game area.
   *
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   */
  public handleGameMoveCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game && command.type === 'GameMove') {
      if (command.gameID !== this._game.id) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      this._game.applyMove({
        gameID: this._game.id,
        playerID: player.id,
        move: command.move,
      });
      this._updateHistoryIfGameOver();
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
  }

  /**
   * Handle a LeaveGame (leaves the game) command from a player in this game area.
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   */
  public handleLeaveGameCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (this._game && command.type === 'LeaveGame') {
      if (command.gameID !== this._game.id) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      this._game.leave(player);
      this._updateHistoryIfGameOver();
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
  }
}
