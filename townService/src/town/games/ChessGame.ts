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
}
