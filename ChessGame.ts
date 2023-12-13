// TODO: remove all eslint-disable
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BreadcrumbLink } from '@chakra-ui/react';
import InvalidParametersError from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMove,
  ChessGameState,
  ChessMove,
  ChessFilePosition,
  ChessRankPosition,
} from '../../types/CoveyTownSocket';
import Game from './Game';
import { F } from 'ramda';
import { moveSyntheticComments } from 'typescript';

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
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param _player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  public _join(_player: Player): void {
    // Check to see if player in game
    if (this._players.includes(_player)) {
      throw new InvalidParametersError('PLAYER_ALREADY_IN_GAME_MESSAGE');
    }
    //Check to see if game is full
    if (this._players.length >= 2) {
      throw new InvalidParametersError('GAME_FULL_MESSAGE');
    }
    //Add _player to _players list
    this._players.push(_player);
    //Update game status if 2 players are in game
    if (this._players.length == 2) {
      this.state.status = 'IN_PROGRESS';
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
  protected _leave(_player: Player): void {
    //Check to see if player is in game
    const playerIndex = this._players.indexOf(_player);
    if (playerIndex == -1) {
      throw new InvalidParametersError('PLAYER_NOT_IN_GAME_MESSAGE');
    }
    //Remove player from game
    this._players.splice(playerIndex, 1);
    //Check to see if game over
    if (this._players.length == 1) {
      this.state.status = 'OVER';
      this.state.winner = this._players[0].id; 
    }
    //Check to see if no players in game
    else if (this._players.length == 0) {
      this.state.status = 'WAITING_TO_START';
    }
  } 
}
