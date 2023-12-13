import { ITiledMap } from '@jonbell/tiled-map-type-guard';
import { DeepMockProxy, mockClear, mockDeep, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import {
  ClientEventTypes,
  expectArraysToContainSameMembers,
  getEventListener,
  getLastEmittedEvent,
  MockedPlayer,
  mockPlayer,
} from '../TestUtils';
import {
  ChatMessage,
  Interactable,
  PlayerLocation,
  TownEmitter,
  ViewingArea as ViewingAreaModel,
} from '../types/CoveyTownSocket';
import ConversationArea from './ConversationArea';
import Town from './Town';
import {
  getPawnMoves,
  getBishopMoves,
  getKingMoves,
  getKnightMoves,
  getQueenMoves,
  getRookMoves,
} from '../types/ChessPieceMoves'
const mockTwilioVideo = mockDeep<TwilioVideo>();
jest.spyOn(TwilioVideo, 'getInstance').mockReturnValue(mockTwilioVideo);

type TestMapDict = {
  [key in string]: ITiledMap;
};
const testingMaps: TestMapDict = {
  twoConv: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  overlapping: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 40,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  noObjects: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [],
  },
  duplicateNames: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ViewingArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvOneViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvTwoViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 55,
            name: 'Name4',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 600,
            y: 1200,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
};

describe('Town', () => {
  const townEmitter: DeepMockProxy<TownEmitter> = mockDeep<TownEmitter>();
  let town: Town;
  let player: Player;
  let playerTestData: MockedPlayer;

  beforeEach(async () => {
    town = new Town(nanoid(), false, nanoid(), townEmitter);
    playerTestData = mockPlayer(town.townID);
    player = await town.addPlayer(playerTestData.userName, playerTestData.socket);
    playerTestData.player = player;
    // Set this dummy player to be off the map so that they do not show up in conversation areas
    playerTestData.moveTo(-1, -1);

    mockReset(townEmitter);
  });

  it('constructor should set its properties', () => {
    const townName = `FriendlyNameTest-${nanoid()}`;
    const townID = nanoid();
    const testTown = new Town(townName, true, townID, townEmitter);
    expect(testTown.friendlyName).toBe(townName);
    expect(testTown.townID).toBe(townID);
    expect(testTown.isPubliclyListed).toBe(true);
  });
  describe('addPlayer', () => {
    it('should use the townID and player ID properties when requesting a video token', async () => {
      const newPlayer = mockPlayer(town.townID);
      mockTwilioVideo.getTokenForTown.mockClear();
      const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);

      expect(mockTwilioVideo.getTokenForTown).toBeCalledTimes(1);
      expect(mockTwilioVideo.getTokenForTown).toBeCalledWith(town.townID, newPlayerObj.id);
    });
    it('should register callbacks for all client-to-server events', () => {
      const expectedEvents: ClientEventTypes[] = [
        'disconnect',
        'chatMessage',
        'playerMovement',
        'interactableUpdate',
      ];
      expectedEvents.forEach(eachEvent =>
        expect(getEventListener(playerTestData.socket, eachEvent)).toBeDefined(),
      );
    });
    describe('[T1] interactableUpdate callback', () => {
      let interactableUpdateHandler: (update: Interactable) => void;
      beforeEach(() => {
        town.initializeFromMap(testingMaps.twoConvTwoViewing);
        interactableUpdateHandler = getEventListener(playerTestData.socket, 'interactableUpdate');
      });
      it('Should not throw an error for any interactable area that is not a viewing area', () => {
        expect(() =>
          interactableUpdateHandler({ id: 'Name1', topic: nanoid(), occupantsByID: [] }),
        ).not.toThrowError();
      });
      it('Should not throw an error if there is no such viewing area', () => {
        expect(() =>
          interactableUpdateHandler({
            id: 'NotActuallyAnInteractable',
            topic: nanoid(),
            occupantsByID: [],
          }),
        ).not.toThrowError();
      });
      describe('When called passing a valid viewing area', () => {
        let newArea: ViewingAreaModel;
        let secondPlayer: MockedPlayer;
        beforeEach(async () => {
          newArea = {
            id: 'Name4',
            elapsedTimeSec: 0,
            isPlaying: true,
            video: nanoid(),
          };
          expect(town.addViewingArea(newArea)).toBe(true);
          secondPlayer = mockPlayer(town.townID);
          mockTwilioVideo.getTokenForTown.mockClear();
          await town.addPlayer(secondPlayer.userName, secondPlayer.socket);

          newArea.elapsedTimeSec = 100;
          newArea.isPlaying = false;
          mockClear(townEmitter);

          mockClear(secondPlayer.socket);
          mockClear(secondPlayer.socketToRoomMock);
          interactableUpdateHandler(newArea);
        });
        it("Should emit the interactable update to the other players in the town using the player's townEmitter, after the viewing area was successfully created", () => {
          const updatedArea = town.getInteractable(newArea.id);
          expect(updatedArea.toModel()).toEqual(newArea);
        });
        it('Should update the model for the viewing area', () => {
          const lastUpdate = getLastEmittedEvent(
            playerTestData.socketToRoomMock,
            'interactableUpdate',
          );
          expect(lastUpdate).toEqual(newArea);
        });
        it('Should not emit interactableUpdate events to players directly, or to the whole town', () => {
          expect(() =>
            getLastEmittedEvent(playerTestData.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() => getLastEmittedEvent(townEmitter, 'interactableUpdate')).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socketToRoomMock, 'interactableUpdate'),
          ).toThrowError();
        });
      });
    });
  });
  describe('Socket event listeners created in addPlayer', () => {
    describe('on socket disconnect', () => {
      function disconnectPlayer(playerToLeave: MockedPlayer) {
        // Call the disconnect event handler
        const disconnectHandler = getEventListener(playerToLeave.socket, 'disconnect');
        disconnectHandler('unknown');
      }
      it("Invalidates the players's session token", async () => {
        const token = player.sessionToken;

        expect(town.getPlayerBySessionToken(token)).toBe(player);
        disconnectPlayer(playerTestData);

        expect(town.getPlayerBySessionToken(token)).toEqual(undefined);
      });
      it('Informs all other players of the disconnection using the broadcast emitter', () => {
        const playerToLeaveID = player.id;

        disconnectPlayer(playerTestData);
        const callToDisconnect = getLastEmittedEvent(townEmitter, 'playerDisconnect');
        expect(callToDisconnect.id).toEqual(playerToLeaveID);
      });
      it('Removes the player from any active conversation area', () => {
        // Load in a map with a conversation area
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(45, 122); // Inside of "Name1" area
        expect(
          town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] }),
        ).toBeTruthy();
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.occupantsByID).toEqual([player.id]);
        disconnectPlayer(playerTestData);
        expect(convArea.occupantsByID).toEqual([]);
        expect(town.occupancy).toBe(0);
      });

      it('Removes the player from any active viewing area', () => {
        // Load in a map with a conversation area
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(156, 567); // Inside of "Name3" area
        expect(
          town.addViewingArea({ id: 'Name3', isPlaying: true, elapsedTimeSec: 0, video: nanoid() }),
        ).toBeTruthy();
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.occupantsByID).toEqual([player.id]);
        disconnectPlayer(playerTestData);
        expect(viewingArea.occupantsByID).toEqual([]);
      });
    });
    describe('playerMovement', () => {
      const newLocation: PlayerLocation = {
        x: 100,
        y: 100,
        rotation: 'back',
        moving: true,
      };

      beforeEach(() => {
        playerTestData.moveTo(
          newLocation.x,
          newLocation.y,
          newLocation.rotation,
          newLocation.moving,
        );
      });

      it('Emits a playerMoved event', () => {
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.id).toEqual(playerTestData.player?.id);
        expect(lastEmittedMovement.location).toEqual(newLocation);
      });
      it("Updates the player's location", () => {
        expect(player.location).toEqual(newLocation);
      });
    });
    describe('interactableUpdate', () => {
      let interactableUpdateCallback: (update: Interactable) => void;
      let update: ViewingAreaModel;
      beforeEach(async () => {
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(156, 567); // Inside of "Name3" viewing area
        interactableUpdateCallback = getEventListener(playerTestData.socket, 'interactableUpdate');
        update = {
          id: 'Name3',
          isPlaying: true,
          elapsedTimeSec: 100,
          video: nanoid(),
        };
        interactableUpdateCallback(update);
      });
      it('forwards updates to others in the town', () => {
        const lastEvent = getLastEmittedEvent(
          playerTestData.socketToRoomMock,
          'interactableUpdate',
        );
        expect(lastEvent).toEqual(update);
      });
      it('does not forward updates to the ENTIRE town', () => {
        expect(
          // getLastEmittedEvent will throw an error if no event was emitted, which we expect to be the case here
          () => getLastEmittedEvent(townEmitter, 'interactableUpdate'),
        ).toThrowError();
      });
      it('updates the local model for that interactable', () => {
        const interactable = town.getInteractable(update.id);
        expect(interactable?.toModel()).toEqual(update);
      });
    });
    it('Forwards chat messages to all players in the same town', async () => {
      const chatHandler = getEventListener(playerTestData.socket, 'chatMessage');
      const chatMessage: ChatMessage = {
        author: player.id,
        body: 'Test message',
        dateCreated: new Date(),
        sid: 'test message id',
      };

      chatHandler(chatMessage);

      const emittedMessage = getLastEmittedEvent(townEmitter, 'chatMessage');
      expect(emittedMessage).toEqual(chatMessage);
    });
  });
  describe('addConversationArea', () => {
    beforeEach(async () => {
      town.initializeFromMap(testingMaps.twoConvOneViewing);
    });
    it('Should return false if no area exists with that ID', () => {
      expect(
        town.addConversationArea({ id: nanoid(), topic: nanoid(), occupantsByID: [] }),
      ).toEqual(false);
    });
    it('Should return false if the requested topic is empty', () => {
      expect(town.addConversationArea({ id: 'Name1', topic: '', occupantsByID: [] })).toEqual(
        false,
      );
      expect(
        town.addConversationArea({ id: 'Name1', topic: undefined, occupantsByID: [] }),
      ).toEqual(false);
    });
    it('Should return false if the area already has a topic', () => {
      expect(
        town.addConversationArea({ id: 'Name1', topic: 'new topic', occupantsByID: [] }),
      ).toEqual(true);
      expect(
        town.addConversationArea({ id: 'Name1', topic: 'new new topic', occupantsByID: [] }),
      ).toEqual(false);
    });
    describe('When successful', () => {
      const newTopic = 'new topic';
      beforeEach(() => {
        playerTestData.moveTo(45, 122); // Inside of "Name1" area
        expect(
          town.addConversationArea({ id: 'Name1', topic: newTopic, occupantsByID: [] }),
        ).toEqual(true);
      });
      it('Should update the local model for that area', () => {
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.topic).toEqual(newTopic);
      });
      it('Should include any players in that area as occupants', () => {
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.occupantsByID).toEqual([player.id]);
      });
      it('Should emit an interactableUpdate message', () => {
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual({
          id: 'Name1',
          topic: newTopic,
          occupantsByID: [player.id],
        });
      });
    });
  });
  describe('[T1] addViewingArea', () => {
    beforeEach(async () => {
      town.initializeFromMap(testingMaps.twoConvOneViewing);
    });
    it('Should return false if no area exists with that ID', () => {
      expect(
        town.addViewingArea({ id: nanoid(), isPlaying: false, elapsedTimeSec: 0, video: nanoid() }),
      ).toBe(false);
    });
    it('Should return false if the requested video is empty', () => {
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: '' }),
      ).toBe(false);
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: undefined }),
      ).toBe(false);
    });
    it('Should return false if the area is already active', () => {
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test' }),
      ).toBe(true);
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test2' }),
      ).toBe(false);
    });
    describe('When successful', () => {
      const newModel: ViewingAreaModel = {
        id: 'Name3',
        isPlaying: true,
        elapsedTimeSec: 100,
        video: nanoid(),
      };
      beforeEach(() => {
        playerTestData.moveTo(160, 570); // Inside of "Name3" area
        expect(town.addViewingArea(newModel)).toBe(true);
      });

      it('Should update the local model for that area', () => {
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.toModel()).toEqual(newModel);
      });

      it('Should emit an interactableUpdate message', () => {
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual(newModel);
      });
      it('Should include any players in that area as occupants', () => {
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.occupantsByID).toEqual([player.id]);
      });
    });
  });

  describe('disconnectAllPlayers', () => {
    beforeEach(() => {
      town.disconnectAllPlayers();
    });
    it('Should emit the townClosing event', () => {
      getLastEmittedEvent(townEmitter, 'townClosing'); // Throws an error if no event existed
    });
    it("Should disconnect each players's socket", () => {
      expect(playerTestData.socket.disconnect).toBeCalledWith(true);
    });
  });
  describe('initializeFromMap', () => {
    const expectInitializingFromMapToThrowError = (map: ITiledMap) => {
      expect(() => town.initializeFromMap(map)).toThrowError();
    };
    it('Throws an error if there is no layer called "objects"', async () => {
      expectInitializingFromMapToThrowError(testingMaps.noObjects);
    });
    it('Throws an error if there are duplicate interactable object IDs', async () => {
      expectInitializingFromMapToThrowError(testingMaps.duplicateNames);
    });
    it('Throws an error if there are overlapping objects', async () => {
      expectInitializingFromMapToThrowError(testingMaps.overlapping);
    });
    it('Creates a ConversationArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoConv);
      const conv1 = town.getInteractable('Name1');
      const conv2 = town.getInteractable('Name2');
      expect(conv1.id).toEqual('Name1');
      expect(conv1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(conv2.id).toEqual('Name2');
      expect(conv2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    it('Creates a ViewingArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoViewing);
      const viewingArea1 = town.getInteractable('Name1');
      const viewingArea2 = town.getInteractable('Name2');
      expect(viewingArea1.id).toEqual('Name1');
      expect(viewingArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(viewingArea2.id).toEqual('Name2');
      expect(viewingArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    describe('Updating interactable state in playerMovements', () => {
      beforeEach(async () => {
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(51, 121);
        expect(town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] })).toBe(
          true,
        );
      });
      it('Adds a player to a new interactable and sets their conversation label, if they move into it', async () => {
        const newPlayer = mockPlayer(town.townID);
        const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
        newPlayer.moveTo(51, 121);

        // Check that the player's location was updated
        expect(newPlayerObj.location.interactableID).toEqual('Name1');

        // Check that a movement event was emitted with the correct label
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.location.interactableID).toEqual('Name1');

        // Check that the conversation area occupants was updated
        const occupants = town.getInteractable('Name1').occupantsByID;
        expectArraysToContainSameMembers(occupants, [newPlayerObj.id, player.id]);
      });
      it('Removes a player from their prior interactable and sets their conversation label, if they moved outside of it', () => {
        expect(player.location.interactableID).toEqual('Name1');
        playerTestData.moveTo(0, 0);
        expect(player.location.interactableID).toBeUndefined();
      });
    });
  });
  describe('Updating town settings', () => {
    it('Emits townSettingsUpdated events when friendlyName changes', async () => {
      const newFriendlyName = nanoid();
      town.friendlyName = newFriendlyName;
      expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
        friendlyName: newFriendlyName,
      });
    });
    it('Emits townSettingsUpdated events when isPubliclyListed changes', async () => {
      const expected = !town.isPubliclyListed;
      town.isPubliclyListed = expected;
      expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
        isPubliclyListed: expected,
      });
    });
  });
});
describe('Join Game'', () => {
  test('should add a player to an empty game', () => {
    const game = new Game();
    const player = new Player("John");
    game._join(player);
    expect(game._players.length).toBe(1);
    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
  });

  test('should not allow adding the same player twice', () => {
    const game = new Game();
    const player = new Player("John");
    game._join(player);
    expect(() => game._join(player)).toThrow(InvalidParametersError);
    expect(() => game._join(player)).toThrow('PLAYER_ALREADY_IN_GAME_MESSAGE');
  });

  test('should add two different players and set game status to IN_PROGRESS', () => {
    const game = new Game();
    const player1 = new Player("John");
    const player2 = new Player("Jane");
    game._join(player1);
    game._join(player2);
    expect(game._players.length).toBe(2);
    expect(game.state.status).toBe('IN_PROGRESS');
  });

  test('should not allow adding more than two players', () => {
    const game = new Game();
    const player1 = new Player("John");
    const player2 = new Player("Jane");
    const player3 = new Player("Bob");
    game._join(player1);
    game._join(player2);
    expect(() => game._join(player3)).toThrow(InvalidParametersError);
    expect(() => game._join(player3)).toThrow('GAME_FULL_MESSAGE');
  });

  test('should not allow adding players to a game that is already in progress', () => {
    const game = new Game();
    const player1 = new Player("John");
    const player2 = new Player("Jane");
    const player3 = new Player("Bob");
    game._join(player1);
    game._join(player2);
    expect(() => game._join(player3)).toThrow(InvalidParametersError);
    expect(() => game._join(player3)).toThrow('GAME_FULL_MESSAGE');
  });
});
describe('Leave Game', () => {
  test('should remove a player and set status to WAITING_TO_START if one player leaves', () => {
    const game = new Game();
    const player1 = new Player("John");
    const player2 = new Player("Jane");
    game._join(player1);
    game._join(player2);
    
    game._leave(player1);
    
    expect(game._players.length).toBe(1);
    expect(game.state.status).toBe('WAITING_TO_START');
  });

  test('should set status to OVER and determine winner if one player leaves and only one remains', () => {
    const game = new Game();
    const player1 = new Player("John");
    const player2 = new Player("Jane");
    game._join(player1);
    game._join(player2);
    
    game._leave(player1);
    
    expect(game._players.length).toBe(1);
    expect(game.state.status).toBe('OVER');
    expect(game.state.winner).toBe(player2.id);
  });

  test('should throw an error if trying to leave a player not in the game', () => {
    const game = new Game();
    const player1 = new Player("John");
    const player2 = new Player("Jane");
    game._join(player1);

    expect(() => game._leave(player2)).toThrow(InvalidParametersError);
    expect(() => game._leave(player2)).toThrow('PLAYER_NOT_IN_GAME_MESSAGE');
  });

  test('should set status to WAITING_TO_START if the last player leaves', () => {
    const game = new Game();
    const player1 = new Player("John");
    game._join(player1);

    game._leave(player1);

    expect(game._players.length).toBe(0);
    expect(game.state.status).toBe('WAITING_TO_START');
  });
});
describe('getPawnMoves Function', () => {
  // Test for a white pawn at rank 2
  test('should return possible moves for white pawn at rank 2', () => {
    const moves = getPawnMoves(2, 'e', 'white');
    expect(moves).toEqual([
      { gamePiece: 'p', currentRank: 2, currentFile: 'e', destinationRank: 3, destinationFile: 'e' },
      { gamePiece: 'p', currentRank: 2, currentFile: 'e', destinationRank: 4, destinationFile: 'e' },
      { gamePiece: 'p', currentRank: 2, currentFile: 'e', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'p', currentRank: 2, currentFile: 'e', destinationRank: 3, destinationFile: 'd' },
    ]);
  });

  // Test for a black pawn at rank 7
  test('should return possible moves for black pawn at rank 7', () => {
    const moves = getPawnMoves(7, 'd', 'black');
    expect(moves).toEqual([
      { gamePiece: 'p', currentRank: 7, currentFile: 'd', destinationRank: 6, destinationFile: 'd' },
      { gamePiece: 'p', currentRank: 7, currentFile: 'd', destinationRank: 5, destinationFile: 'd' },
      { gamePiece: 'p', currentRank: 7, currentFile: 'd', destinationRank: 6, destinationFile: 'e' },
      { gamePiece: 'p', currentRank: 7, currentFile: 'd', destinationRank: 6, destinationFile: 'c' },
    ]);
  });

  // Test for a white pawn at rank 5
  test('should return possible moves for white pawn at rank 5', () => {
    const moves = getPawnMoves(5, 'b', 'white');
    expect(moves).toEqual([
      { gamePiece: 'p', currentRank: 5, currentFile: 'b', destinationRank: 6, destinationFile: 'b' },
      { gamePiece: 'p', currentRank: 5, currentFile: 'b', destinationRank: 7, destinationFile: 'b' },
      { gamePiece: 'p', currentRank: 5, currentFile: 'b', destinationRank: 6, destinationFile: 'c' },
      { gamePiece: 'p', currentRank: 5, currentFile: 'b', destinationRank: 6, destinationFile: 'a' },
    ]);
  });

  // Test for edge case: white pawn at rank 8 (invalid rank)
  test('should return an empty array for invalid rank', () => {
    const moves = getPawnMoves(8, 'd', 'white');
    expect(moves).toEqual([]);
  });

  // Test for edge case: black pawn at rank 1 (invalid rank)
  test('should return an empty array for invalid rank', () => {
    const moves = getPawnMoves(1, 'd', 'black');
    expect(moves).toEqual([]);
  });

  // Test for edge case: white pawn at file 'h' (right edge)
  test('should return possible moves for white pawn at right edge', () => {
    const moves = getPawnMoves(4, 'h', 'white');
    expect(moves).toEqual([
      { gamePiece: 'p', currentRank: 4, currentFile: 'h', destinationRank: 5, destinationFile: 'h' },
      { gamePiece: 'p', currentRank: 4, currentFile: 'h', destinationRank: 6, destinationFile: 'h' },
      { gamePiece: 'p', currentRank: 4, currentFile: 'h', destinationRank: 5, destinationFile: 'g' },
    ]);
  });

  // Test for edge case: black pawn at file 'a' (left edge)
  test('should return possible moves for black pawn at left edge', () => {
    const moves = getPawnMoves(6, 'a', 'black');
    expect(moves).toEqual([
      { gamePiece: 'p', currentRank: 6, currentFile: 'a', destinationRank: 5, destinationFile: 'a' },
      { gamePiece: 'p', currentRank: 6, currentFile: 'a', destinationRank: 4, destinationFile: 'a' },
      { gamePiece: 'p', currentRank: 6, currentFile: 'a', destinationRank: 5, destinationFile: 'b' },
    ]);
  });

  // Test for edge case: black pawn at file 'a' capturing left (left edge)
  test('should return possible moves for black pawn capturing left at left edge', () => {
    const moves = getPawnMoves(6, 'a', 'black');
    expect(moves).toEqual([
      { gamePiece: 'p', currentRank: 6, currentFile: 'a', destinationRank: 5, destinationFile: 'a' },
      { gamePiece: 'p', currentRank: 6, currentFile: 'a', destinationRank: 4, destinationFile: 'a' },
      { gamePiece: 'p', currentRank: 6, currentFile: 'a', destinationRank: 5, destinationFile: 'b' },
    ]);
  });

  // Test for edge case: white pawn at file 'h' capturing right (right edge)
  test('should return possible moves for white pawn capturing right at right edge', () => {
    const moves = getPawnMoves(4, 'h', 'white');
    expect(moves).toEqual([
      { gamePiece: 'p', currentRank: 4, currentFile: 'h', destinationRank: 5, destinationFile: 'h' },
      { gamePiece: 'p', currentRank: 4, currentFile: 'h', destinationRank: 6, destinationFile: 'h' },
      { gamePiece: 'p', currentRank: 4, currentFile: 'h', destinationRank: 5, destinationFile: 'g' },
    ]);
  });
});
describe('getBishopMoves Function', () => {
  // Test for a white bishop at the center of the board
  test('should return possible moves for white bishop at the center', () => {
    const moves = getBishopMoves(4, 'e', 'white');
    expect(moves).toEqual([
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'd' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'c' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'f' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'g' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'd' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'c' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'g' },
    ]);
  });

  // Test for a black bishop at the center of the board
  test('should return possible moves for black bishop at the center', () => {
    const moves = getBishopMoves(4, 'e', 'black');
    expect(moves).toEqual([
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'd' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'c' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'g' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'd' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'c' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'f' },
      { gamePiece: 'b', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'g' },
    ]);
  });

  // Test for a white bishop at the board edge
  test('should return possible moves for white bishop at the board edge', () => {
    const moves = getBishopMoves(1, 'a', 'white');
    expect(moves).toEqual([
      { gamePiece: 'b', currentRank: 1, currentFile: 'a', destinationRank: 2, destinationFile: 'b' },
    ]);
  });

  // Test for a black bishop at the board edge
  test('should return possible moves for black bishop at the board edge', () => {
    const moves = getBishopMoves(8, 'h', 'black');
    expect(moves).toEqual([
      { gamePiece: 'b', currentRank: 8, currentFile: 'h', destinationRank: 7, destinationFile: 'g' },
    ]);
  });

  // Test for a white bishop blocked by other pieces
  test('should return possible moves for white bishop blocked by other pieces', () => {
    const moves = getBishopMoves(1, 'c', 'white');
    expect(moves).toEqual([]);
  });
});
describe('getKnightMoves Function', () => {
  // Test for a white knight at the center of the board
  test('should return possible moves for white knight at the center', () => {
    const moves = getKnightMoves(4, 'e', 'white');
    expect(moves).toEqual([
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'd' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'f' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'c' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'g' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'c' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'g' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'd' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'f' },
    ]);
  });

  // Test for a black knight at the center of the board
  test('should return possible moves for black knight at the center', () => {
    const moves = getKnightMoves(4, 'e', 'black');
    expect(moves).toEqual([
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'd' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'f' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'c' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'g' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'c' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'g' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'd' },
      { gamePiece: 'n', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'f' },
    ]);
  });

  // Test for a white knight at the board edge
  test('should return possible moves for white knight at the board edge', () => {
    const moves = getKnightMoves(1, 'a', 'white');
    expect(moves).toEqual([
      { gamePiece: 'n', currentRank: 1, currentFile: 'a', destinationRank: 3, destinationFile: 'b' },
      { gamePiece: 'n', currentRank: 1, currentFile: 'a', destinationRank: 2, destinationFile: 'c' },
    ]);
  });

  // Test for a black knight at the board edge
  test('should return possible moves for black knight at the board edge', () => {
    const moves = getKnightMoves(8, 'h', 'black');
    expect(moves).toEqual([
      { gamePiece: 'n', currentRank: 8, currentFile: 'h', destinationRank: 6, destinationFile: 'g' },
      { gamePiece: 'n', currentRank: 8, currentFile: 'h', destinationRank: 7, destinationFile: 'f' },
    ]);
  });

  // Test for a white knight blocked by other pieces
  test('should return possible moves for white knight blocked by other pieces', () => {
    const moves = getKnightMoves(3, 'c', 'white');
    expect(moves).toEqual([]);
  });

  // Test for a black knight blocked by other pieces
  test('should return possible moves for black knight blocked by other pieces', () => {
    const moves = getKnightMoves(6, 'f', 'black');
    expect(moves).toEqual([]);
  });
});
describe('getRookMoves Function', () => {
  // Test for a white rook at the center of the board
  test('should return possible moves for white rook at the center', () => {
    const moves = getRookMoves(4, 'e', 'white');
    expect(moves).toEqual([
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'd' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'b' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'f' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'g' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'h' },
    ]);
  });

  // Test for a black rook at the center of the board
  test('should return possible moves for black rook at the center', () => {
    const moves = getRookMoves(4, 'e', 'black');
    expect(moves).toEqual([
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'd' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'b' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'f' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'g' },
      { gamePiece: 'r', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'h' },
    ]);
  });

  // Test for a white rook at the board edge
  test('should return possible moves for white rook at the board edge', () => {
    const moves = getRookMoves(1, 'a', 'white');
    expect(moves).toEqual([
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 2, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 3, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 4, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 5, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 6, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 7, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 8, destinationFile: 'a' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'b' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'd' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'f' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'g' },
      { gamePiece: 'r', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'h' },
    ]);
  });

  // Test for a black rook at the board edge
  test('should return possible moves for black rook at the board edge', () => {
    const moves = getRookMoves(8, 'h', 'black');
    expect(moves).toEqual([
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 7, destinationFile: 'h' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 6, destinationFile: 'h' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 5, destinationFile: 'h' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 4, destinationFile: 'h' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 3, destinationFile: 'h' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 2, destinationFile: 'h' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 1, destinationFile: 'h' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'g' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'f' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'e' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'd' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'b' },
      { gamePiece: 'r', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'a' },
    ]);
  });

  // Test for a white rook blocked by other pieces
  test('should return possible moves for white rook blocked by other pieces', () => {
    const moves = getRookMoves(3, 'c', 'white');
    expect(moves).toEqual([
      { gamePiece: 'r', currentRank: 3, currentFile: 'c', destinationRank: 4, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 3, currentFile: 'c', destinationRank: 5, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 3, currentFile: 'c', destinationRank: 6, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 3, currentFile: 'c', destinationRank: 7, destinationFile: 'c' },
      { gamePiece: 'r', currentRank: 3, currentFile: 'c', destinationRank: 8, destinationFile: 'c' },
    ]);
  });

  // Test for a black rook blocked by other pieces
  test('should return possible moves for black rook blocked by other pieces', () => {
    const moves = getRookMoves(6, 'f', 'black');
    expect(moves).toEqual([
      { gamePiece: 'r', currentRank: 6, currentFile: 'f', destinationRank: 5, destinationFile: 'f' },
      { gamePiece: 'r', currentRank: 6, currentFile: 'f', destinationRank: 4, destinationFile: 'f' },
      { gamePiece: 'r', currentRank: 6, currentFile: 'f', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'r', currentRank: 6, currentFile: 'f', destinationRank: 2, destinationFile: 'f' },
    ]);
  });
});
describe('getKingMoves Function', () => {
  // Test for a white king at the center of the board
  test('should return possible moves for white king at the center', () => {
    const moves = getKingMoves(4, 'e', 'white');
    expect(moves).toEqual([
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'e' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'e' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'd' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'f' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'f' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'd' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'd' },
    ]);
  });

  // Test for a black king at the center of the board
  test('should return possible moves for black king at the center', () => {
    const moves = getKingMoves(4, 'e', 'black');
    expect(moves).toEqual([
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'e' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'e' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'd' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'f' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'f' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'd' },
      { gamePiece: 'k', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'd' },
    ]);
  });

  // Test for a white king at the board edge
  test('should return possible moves for white king at the board edge', () => {
    const moves = getKingMoves(1, 'a', 'white');
    expect(moves).toEqual([
      { gamePiece: 'k', currentRank: 1, currentFile: 'a', destinationRank: 2, destinationFile: 'a' },
      { gamePiece: 'k', currentRank: 1, currentFile: 'a', destinationRank: 1, destinationFile: 'b' },
      { gamePiece: 'k', currentRank: 1, currentFile: 'a', destinationRank: 2, destinationFile: 'b' },
    ]);
  });

  // Test for a black king at the board edge
  test('should return possible moves for black king at the board edge', () => {
    const moves = getKingMoves(8, 'h', 'black');
    expect(moves).toEqual([
      { gamePiece: 'k', currentRank: 8, currentFile: 'h', destinationRank: 7, destinationFile: 'h' },
      { gamePiece: 'k', currentRank: 8, currentFile: 'h', destinationRank: 8, destinationFile: 'g' },
      { gamePiece: 'k', currentRank: 8, currentFile: 'h', destinationRank: 7, destinationFile: 'g' },
    ]);
  });
});
describe('getQueenMoves Function', () => {
  // Test for a white queen at the center of the board
  test('should return possible moves for white queen at the center', () => {
    const moves = getQueenMoves(4, 'e', 'white');
    expect(moves).toEqual([
      // Forward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 7, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 8, destinationFile: 'e' },
      // Backward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 1, destinationFile: 'e' },
      // Right moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'f' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'g' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'h' },
      // Left moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'd' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'c' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'b' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'a' },
      // Diagonal forward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'f' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'g' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 7, destinationFile: 'h' },
      // Diagonal backward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'g' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 1, destinationFile: 'h' },
    ]);
  });

  // Test for a black queen at the center of the board
  test('should return possible moves for black queen at the center', () => {
    const moves = getQueenMoves(4, 'e', 'black');
    expect(moves).toEqual([
      // Forward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 1, destinationFile: 'e' },
      // Backward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 7, destinationFile: 'e' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 8, destinationFile: 'e' },
      // Right moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'f' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'g' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'h' },
      // Left moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'd' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'c' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'b' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 4, destinationFile: 'a' },
      // Diagonal forward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 5, destinationFile: 'f' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 6, destinationFile: 'g' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 7, destinationFile: 'h' },
      // Diagonal backward moves
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 3, destinationFile: 'f' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 2, destinationFile: 'g' },
      { gamePiece: 'q', currentRank: 4, currentFile: 'e', destinationRank: 1, destinationFile: 'h' },
    ]);
  });
});

