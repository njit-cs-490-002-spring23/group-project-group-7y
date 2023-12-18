export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: Interactable[];
}
export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'ChessArea';
export type Interactable = ConversationArea | ViewingArea | ChessArea;

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';
export interface Player {
  id: string;
  userName: string;
  location: PlayerLocation;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface ConversationArea {
  id: string;
  topic?: string;
  occupantsByID: string[];
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea {
  id: string;
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
}

export type PlayerID = string;
export type InteractableID = string;
export type GameInstanceID = string;

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
  id: string;
  occupantsByID: string[];
  game: GameInstance<T> | undefined;
  history: GameResult[];
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
  gamePiece: ChessPiece;
  currentRank: ChessRankPosition;
  currentFile: ChessFilePosition;
  destinationRank: ChessRankPosition;
  destinationFile: ChessFilePosition;
}
export type BoardLocation = {
  rowIndex: number;
  colIndex: number;
};

export type ChessRankPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ChessFilePosition = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

export const API_CONNECTION_ERROR = 'Cannot connect to StockfishOnline API';
export type ChessPiece = {
  pieceType: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | undefined;
  pieceColor: 'W' | 'B';
  moved : boolean;
}; // Kings, Queens, Rooks, Bishops, Knights, Pawns

export type ChessCell = { piece: ChessPiece } | undefined;
/**
 * Type for the state of a Chess game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (white and black)
 * The first player to join the game is white, the second is black
 */
export interface ChessGameState extends WinnableGameState {
  board: ReadonlyArray<ChessCell[]>;
  moves: ReadonlyArray<ChessMove>;
  white?: PlayerID;
  black?: PlayerID;
  drawOffer?: PlayerID;
  drawAccept?: PlayerID;
  blackPromotionPiece?: 'K' | 'Q' | 'R' | 'B' | 'N';
  whitePromotionPiece?: 'K' | 'Q' | 'R' | 'B' | 'N';
  halfMoves: number;
}

export interface ChessPosition {
  rank: ChessRankPosition;
  file: ChessFilePosition;
}

export interface PieceWithPosition {
  type: ChessPiece;
  color: 'W' | 'B';
  position: Position;
}

export type GameData = {
  gameId: string;
  date: string;
  playerOne: string;
  playerTwo: string;
  result: string;
  moves: string[];
  moveNames: string[];
};

export type LeaderBoardRow = {
  username: string;
  wins: number;
  ties: number;
  losses: number;
};

/**
 * Type for the result of a game
 */

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
  | PossibleMovesCommand
  | DrawGameCommand
  | GameMoveCommand<ChessMove>
  | LeaveGameCommand;
export interface ViewingAreaUpdateCommand {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}

export interface PossibleMovesCommand {
  type: 'PossibleMoves';
  gameID: GameInstanceID;
  rowIndex: number;
  colIndex: number;
}

export interface DrawGameCommand {
  type: 'DrawGame';
  gameID: GameInstanceID;
  message: string;
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
    : CommandType extends DrawGameCommand
    ? undefined
    : CommandType extends PossibleMovesCommand
    ? { possibleMoves: ChessMove[] }
    : never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
};
