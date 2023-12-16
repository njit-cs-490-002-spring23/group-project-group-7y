/* eslint-disable @typescript-eslint/no-unused-vars */
import assert from 'assert';
import { nanoid } from 'nanoid';
import {
  GameArea,
  GameResult,
  GameStatus,
  ChessGameState,
  ChessMove,
  Player,
  PlayerID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import GameAreaController from './GameAreaController';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ChessAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './ChessAreaController';
// eslint-disable-next-line import/no-extraneous-dependencies
import mock from 'jest-mock-extended/lib/Mock';
// TODO: WIP
describe.skip('[T1] ChessAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];
  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  function ChessAreaControllerWithProp({
    _id,
    history,
    white,
    black,
    undefinedGame,
    status,
    moves,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    white?: string;
    black?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    moves?: ChessMove[];
    winner?: string;
  }) {
    const id = _id || nanoid();
    const players: PlayerID[] = [];
    if (white) players.push(white);
    if (black) players.push(black);
    const ret = new ChessAreaController(
      id,
      {
        id,
        occupants: players,
        occupantsByID: players,
        history: history || [],
        type: 'ChessArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                white: white,
                black: black,
                moves: moves || [],
                winner: winner,
                board: [[]],
                halfMoves: 0,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
      mockTownController.getPlayer.mockImplementation(playerID => {
        const p = mockTownController.players.find(player => player.id === playerID);
        assert(p);
        return p;
      });
    }
    return ret;
  }
  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is a player in this game', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('should return false if the current player is not a player in this game', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
          black: otherPlayers[1].id,
        });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('gamePiece', () => {
      it('should return the game piece of the current player if the current player is a player in this game', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
        });
        expect(controller.gamePiece).toBe('X');

        //check O
        const controller2 = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          black: ourPlayer.id,
        });
        expect(controller2.gamePiece).toBe('O');
      });
      it('should throw an error if the current player is not a player in this game', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
          black: otherPlayers[1].id,
        });
        expect(() => controller.gamePiece).toThrowError();
      });
    });
    describe('status', () => {
      it('should return the status of the game', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_TO_START if the game is not defined', () => {
        const controller = ChessAreaControllerWithProp({
          undefinedGame: true,
        });
        expect(controller.status).toBe('WAITING_TO_START');
      });
    });
    describe('whoseTurn', () => {
      it('should return the player whose turn it is initially', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(ourPlayer);
      });
      it('should return the player whose turn it is after a move', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
          moves: [
            {
              gamePiece: { pieceType: 'P', pieceColor: 'W', moved: true },
              currentRank: 2,
              currentFile: 'f',
              destinationRank: 3,
              destinationFile: 'f',
            },
          ],
        });
        expect(controller.whoseTurn).toBe(otherPlayers[0]);
      });
      it('should return undefined if the game is not in progress', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'OVER',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(undefined);
      });
    });
    describe('isOurTurn', () => {
      it('should return true if it is our turn', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('should return false if it is not our turn', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('moveCount', () => {
      it('should return the number of moves that have been made', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
          moves: [
            {
              gamePiece: { pieceType: 'P', pieceColor: 'W', moved: true },
              currentRank: 2,
              currentFile: 'f',
              destinationRank: 3,
              destinationFile: 'f',
            },
          ],
        });
        expect(controller.moveCount).toBe(1);
      });
    });
    describe('board', () => {
      it('should return an empty board by default', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.board).toEqual([
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
        ]);
      });
    });
    describe('x', () => {
      it('should return the x player if there is one', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
        expect(controller.white).toBe(ourPlayer);
      });
      it('should return undefined if there is no x player and the game is waiting to start', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.white).toBe(undefined);
      });
      it('should return undefined if there is no x player', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          black: otherPlayers[0].id,
        });
        expect(controller.black).toBe(undefined);
      });
    });
    describe('o', () => {
      it('should return the o player if there is one', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
        });
        expect(controller.white).toBe(ourPlayer);
      });
      it('should return undefined if there is no o player and the game is waiting to start', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.white).toBe(undefined);
      });
      it('should return undefined if there is no o player', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: otherPlayers[0].id,
        });
        expect(controller.white).toBe(undefined);
      });
    });
    describe('winner', () => {
      it('should return the winner if there is one', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'OVER',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('should return undefined if there is no winner', () => {
        const controller = ChessAreaControllerWithProp({
          status: 'OVER',
          white: otherPlayers[0].id,
          black: ourPlayer.id,
        });
        expect(controller.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      /**
       * Mock sendInteractableCommand for joinGame so that controller.joinGame() sets the _instanceID which is needed to make a move
       *
       * @param controller the ChessGameController
       */
      async function mockJoinGame(controller: ChessAreaController) {
        const spy = jest.spyOn(mockTownController, 'sendInteractableCommand');
        spy.mockReturnValue(Promise.resolve({ gameID: controller.id }));
        await controller.joinGame();
        spy.mockRestore();
      }
      it('Should call townController.sendInteractableCommand', async () => {
        const controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          black: otherPlayers[0].id,
          white: ourPlayer.id,
          undefinedGame: false,
        });
        const spy = jest.spyOn(mockTownController, 'sendInteractableCommand');
        await mockJoinGame(controller);
        await controller.makeMove(
          { pieceType: 'P', pieceColor: 'W', moved: true },
          2,
          'f',
          3,
          'f',
          false,
        );
        expect(spy).toHaveBeenLastCalledWith(controller.id, {
          type: 'GameMove',
          gameID: controller.id,
          move: { row: 1, col: 2, gamePiece: 'X' },
        });
      });
    });
  });
  describe('[T1.2] _updateFrom', () => {
    /**
     * Create and return a model ChessGameState with newMoves
     *
     * @param model the ChessGameState to be updated newMoves
     * @param newMoves the new moves to update the game state with
     * @returns a GameArea<ChessGameState> with the newMoves as moves
     */
    function newModelWithNewMoves(
      model: GameArea<ChessGameState>,
      newMoves: ReadonlyArray<ChessMove>,
    ): GameArea<ChessGameState> {
      assert(model.game);
      return {
        ...model,
        game: {
          ...model.game,
          state: {
            ...model.game?.state,
            moves: newMoves,
          },
        },
      } as GameArea<ChessGameState>;
    }
    describe('if the game is in progress', () => {
      let controller: ChessAreaController;
      beforeEach(() => {
        controller = ChessAreaControllerWithProp({
          status: 'IN_PROGRESS',
          white: ourPlayer.id,
          black: otherPlayers[0].id,
        });
      });
      it('should emit a boardChanged event with the new board', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<ChessMove> = [
          {
            gamePiece: { pieceType: 'P', pieceColor: 'W', moved: true },
            currentRank: 2,
            currentFile: 'f',
            destinationRank: 3,
            destinationFile: 'f',
          },
          {
            gamePiece: { pieceType: 'P', pieceColor: 'B', moved: true },
            currentRank: 6,
            currentFile: 'f',
            destinationRank: 5,
            destinationFile: 'f',
          },
        ];
        assert(model.game);
        const newModel = newModelWithNewMoves(model, newMoves);
        const spy = jest.spyOn(GameAreaController.prototype, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        expect(spy).toHaveBeenLastCalledWith('boardChanged', [
          ['X', undefined, undefined],
          [undefined, undefined, 'O'],
          [undefined, undefined, undefined],
        ]);
      });
      it('should not emit a boardChanged event if the board has not changed', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<ChessMove> = [];
        assert(model.game);
        const newModel = newModelWithNewMoves(model, newMoves);
        const spy = jest.spyOn(GameAreaController.prototype, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        expect(spy).not.toHaveBeenLastCalledWith('boardChanged', [
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
          [undefined, undefined, undefined],
        ]);
      });
    });
    it('should call super._updateFrom', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const controller = ChessAreaControllerWithProp({});
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalled();
    });
  });
});
