/*
To avoid ripping-off the bandaid and switching to a proper multi-module workspace setup
we are sharing type definitions only, using tsconfig.json "references" to the shared project.
We still want to prevent relative package imports otherwise using ESLint, because importing anything
besides type declarations could become problematic from a compilation perspective.
*/

import { BroadcastOperator, Socket } from 'socket.io';
/* eslint-disable import/no-relative-packages */
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types/CoveyTownSocket';
/* eslint-disable import/no-relative-packages */
export * from '../../../shared/types/CoveyTownSocket';

export type SocketData = Record<string, never>;
export type CoveyTownSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type TownEmitter = BroadcastOperator<ServerToClientEvents, SocketData>;
export type TownEmitterFactory = (townID: string) => TownEmitter;

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'ChessArea';
export type PlayerID = string;
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
}

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

/**
 * Type for a move in Chess
 * Each move is for a specific gamePiece:
 *  - p for pawn
 *  - b for bishop
 *  - n for knight
 *  - k for king
 *  - q for queen
 *  The current position of the gamePiece is specificed with currentRank and currentFile
 *  The destination position of the gamePiece is specified by destinationRank and destinationFile
 */
export interface ChessMove {
  gamePiece: 'p' | 'b' | 'n' | 'r' | 'k' | 'q';
  currentRank: ChessRankPosition;
  currentFile: ChessFilePosition;
  destinationRank: ChessRankPosition;
  destinationFile: ChessFilePosition;
}

export type ChessRankPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ChessFilePosition = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

/**
 * Type for the state of a Chess game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (white and black)
 * The first player to join the game is white, the second is black
 */
export interface ChessGameState extends WinnableGameState {
  moves: ReadonlyArray<ChessMove>;
  white?: PlayerID;
  black?: PlayerID;
}

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  moves: ReadonlyArray<ChessMove>;
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =
  | ViewingAreaUpdateCommand
  | JoinGameCommand
  | GameMoveCommand<ChessMove>
  | LeaveGameCommand;
export interface ViewingAreaUpdateCommand {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export type InteractableCommandReturnType<CommandType extends InteractableCommand> =
  CommandType extends JoinGameCommand
    ? { gameID: string }
    : CommandType extends ViewingAreaUpdateCommand
    ? undefined
    : CommandType extends GameMoveCommand<ChessMove>
    ? undefined
    : CommandType extends LeaveGameCommand
    ? undefined
    : never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
};
