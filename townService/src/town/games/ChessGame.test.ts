import ChessGame from './ChessGame';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import { ChessMove } from '../../types/CoveyTownSocket';

describe('ChessGame', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  describe('board', () => {
    it('should initialize with the correct starting positions', () => {
      const { board } = game.state;
      expect(board[0][0]).toEqual({ piece: { pieceType: 'R', pieceColor: 'W' } }); // White rook at A1
      expect(board[0][7]).toEqual({ piece: { pieceType: 'R', pieceColor: 'W' } }); // White rook at H1
      expect(board[7][0]).toEqual({ piece: { pieceType: 'R', pieceColor: 'B' } }); // Black rook at A8
      expect(board[7][7]).toEqual({ piece: { pieceType: 'R', pieceColor: 'B' } }); // Black rook at H8
      expect(board[1][1]).toEqual({ piece: { pieceType: 'P', pieceColor: 'W' } }); // White Pawn at B2
      expect(board[6][6]).toEqual({ piece: { pieceType: 'P', pieceColor: 'B' } }); // Black Pawn at G7
    });
  });

  describe('_getKingPosition', () => {
    it('should return the correct position of the king', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - we are testing spying on a private method
      const whiteKingPosition = game._getKingPosition('W');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - we are testing spying on a private method
      const blackKingPosition = game._getKingPosition('B');
      expect(whiteKingPosition).toEqual({ rank: 1, file: 'e' }); // White King position
      expect(blackKingPosition).toEqual({ rank: 8, file: 'e' }); // Black King position
    });
  });

  describe('_getPieces', () => {
    it('should return all pieces for a given color', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - we are testing spying on a private method
      const whitePieces = game._getPieces('W');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - we are testing spying on a private method
      const blackPieces = game._getPieces('B');
      expect(whitePieces.length).toBeGreaterThan(0);
      expect(blackPieces.length).toBeGreaterThan(0);
    });
  });
  describe('during game in progress', () => {
    let player1: Player;
    let player2: Player;
    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
    });
    describe('isCheckmate', () => {
      // Remove .skip after possibleMoves
      it.skip('should return false if the king is not in checkmate (e.g., starting position)', () => {
        game = new ChessGame();
        expect(game.isCheckmate()).toBe(false);
      });
      // Remove .skip after possibleMoves
      it.skip("should return true when the king is in checkmate (Fool's Mate)", () => {
        const whitePlayerId = 'player1Id';
        const blackPlayerId = 'player2Id';
        // Simulate the moves leading to Fool's Mate
        game.applyMove({
          playerID: whitePlayerId,
          move: {
            gamePiece: { pieceType: 'P', pieceColor: 'W' },
            currentRank: 2,
            currentFile: 'f',
            destinationRank: 3,
            destinationFile: 'f',
          },
          gameID: '123',
        });
        game.applyMove({
          playerID: blackPlayerId,
          move: {
            gamePiece: { pieceType: 'P', pieceColor: 'B' },
            currentRank: 7,
            currentFile: 'e',
            destinationRank: 5,
            destinationFile: 'e',
          },
          gameID: '123',
        });
        game.applyMove({
          playerID: whitePlayerId,
          move: {
            gamePiece: { pieceType: 'P', pieceColor: 'W' },
            currentRank: 2,
            currentFile: 'g',
            destinationRank: 4,
            destinationFile: 'g',
          },
          gameID: '123',
        });
        game.applyMove({
          playerID: blackPlayerId,
          move: {
            gamePiece: { pieceType: 'Q', pieceColor: 'B' },
            currentRank: 8,
            currentFile: 'h',
            destinationRank: 4,
            destinationFile: 'h',
          },
          gameID: '123',
        }); // Checkmate
        expect(game.isCheckmate()).toBe(true);
      });
    });
    describe('bestMove', () => {
      it('should produce the correct fen for the starting board', () => {
        expect(game.fenNotation()).toEqual(
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        );
      });
      it('should respond with the next best move for the start board', async () => {
        const move = await game.nextBestMove();
        expect(move).toEqual({
          gamePiece: 'P',
          currentRank: 2,
          currentFile: 'd',
          destinationRank: 4,
          destinationFile: 'd',
        } as unknown as Promise<ChessMove>);
      });
    });
    describe('isKingInCheck', () => {
      it.skip('should return false if the white king is not in check', () => {
        expect(game.isKingInCheck(player1.id)).toBe(false);
      });
      it.skip('should return false if the black king is not in check', () => {
        expect(game.isKingInCheck(player2.id)).toBe(false);
      });
    });
    describe('Given a Valid Pawn Move', () => {
      it('should update the chess board and the moves with the valid movement', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'a',
          destinationRank: 4,
          destinationFile: 'a',
          enPassant: undefined,
        };
        expect(game.state.board[move.currentRank - 1][0]?.piece.pieceType).toEqual('P');
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.moves.length).toEqual(1);
        expect(game.state.board[move.currentRank - 1][0]).toBeUndefined();
        expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceType).toEqual('P');
      });
      it('given a valid move for en passant', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'e',
          destinationRank: 4,
          destinationFile: 'e',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.moves.length).toEqual(1);
        expect(game.state.board[move.currentRank - 1][4]).toBeUndefined();
        expect(game.state.board[move.destinationRank - 1][4]?.piece.pieceType).toEqual('P');

        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'a',
          destinationRank: 6,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });
        expect(game.state.moves.length).toEqual(2);
        expect(game.state.board[move2.currentRank - 1][0]).toBeUndefined();
        expect(game.state.board[move2.destinationRank - 1][0]?.piece.pieceType).toEqual('P');

        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 4,
          currentFile: 'e',
          destinationRank: 5,
          destinationFile: 'e',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move3,
        });
        expect(game.state.moves.length).toEqual(3);
        expect(game.state.board[move3.currentRank - 1][4]).toBeUndefined();
        expect(game.state.board[move3.destinationRank - 1][4]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move3.destinationRank - 1][4]?.piece.pieceType).toEqual('P');

        const move4: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'd',
          destinationRank: 5,
          destinationFile: 'd',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move4,
        });
        expect(game.state.moves.length).toEqual(4);
        expect(game.state.board[move4.currentRank - 1][3]).toBeUndefined();
        expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceType).toEqual('P');

        const move5: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 5,
          currentFile: 'e',
          destinationRank: 6,
          destinationFile: 'd',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move5,
        });
        expect(game.state.moves.length).toEqual(5);
        expect(game.state.board[move5.currentRank - 1][4]).toBeUndefined();
        expect(game.state.board[move5.destinationRank - 2][3]).toBeUndefined();
        expect(game.state.board[move5.destinationRank - 1][3]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move5.destinationRank - 1][3]?.piece.pieceType).toEqual('P');
      });
    });
    describe('Given Invalid Pawn Move', () => {
      it('should return an error if the player moves a pi1ece that does not belong to them', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'a',
          destinationRank: 4,
          destinationFile: 'a',
          enPassant: undefined,
        };
        expect(game.state.board[move.currentRank - 1][0]?.piece.pieceType).toEqual('P');
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.moves.length).toEqual(1);
        expect(game.state.board[move.currentRank - 1][0]).toBeUndefined();
        expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceType).toEqual('P');

        const move2: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'b',
          destinationRank: 4,
          destinationFile: 'b',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: move2,
          }),
        ).toThrow('Player 2 can only move black pieces');
      });
      it('should return an error if the player moves a piece when it is not their turn', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'a',
          destinationRank: 4,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        const move2: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'b',
          destinationRank: 4,
          destinationFile: 'b',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move2,
          }),
        ).toThrow('Not Your Turn');
      });
      it('should return an error if the pawn changes rank and there is no capture, en passant', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'a',
          destinationRank: 3,
          destinationFile: 'b',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          }),
        ).toThrow('Invalid Move');
      });
      it('when a piece is in front of the pawn the pawn can not move', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 1,
          currentFile: 'b',
          destinationRank: 3,
          destinationFile: 'c',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.board[move.currentRank - 1][1]).toBeUndefined();
        expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceType).toEqual('N');

        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'N' },
          currentRank: 8,
          currentFile: 'g',
          destinationRank: 6,
          destinationFile: 'f',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });
        expect(game.state.board[move2.currentRank - 1][6]).toBeUndefined();
        expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceType).toEqual('N');

        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'c',
          destinationRank: 4,
          destinationFile: 'c',
          enPassant: undefined,
        };

        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move3,
          }),
        ).toThrow('Invalid Move');
      });
    });
    describe('Given A Valid Knight Move', () => {
      it('Should update the chess board and the moves with the valid movement', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 1,
          currentFile: 'b',
          destinationRank: 3,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.board[move.currentRank - 1][1]).toBeUndefined();
        expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceType).toEqual('N');
      });
      it('Given a series of knight moves should update the chess board with the moves', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 1,
          currentFile: 'b',
          destinationRank: 3,
          destinationFile: 'c',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.board[move.currentRank - 1][1]).toBeUndefined();
        expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceType).toEqual('N');

        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'N' },
          currentRank: 8,
          currentFile: 'g',
          destinationRank: 6,
          destinationFile: 'f',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });
        expect(game.state.board[move2.currentRank - 1][6]).toBeUndefined();
        expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceType).toEqual('N');

        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 3,
          currentFile: 'c',
          destinationRank: 5,
          destinationFile: 'd',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move3,
        });
        expect(game.state.board[move3.currentRank - 1][2]).toBeUndefined();
        expect(game.state.board[move3.destinationRank - 1][3]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move3.destinationRank - 1][3]?.piece.pieceType).toEqual('N');

        const move4: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'N' },
          currentRank: 6,
          currentFile: 'f',
          destinationRank: 5,
          destinationFile: 'd',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move4,
        });
        expect(game.state.board[move4.currentRank - 1][5]).toBeUndefined();
        expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceType).toEqual('N');
      });
    });
    describe('Give an Invalid Knight Move', () => {
      it('should return an error that the move is invalid when it tries to land on a spot the player owns', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 1,
          currentFile: 'b',
          destinationRank: 2,
          destinationFile: 'd',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          }),
        ).toThrow('Invalid Move');
      });
      it('should return an error that move is invalid given incorrect movement', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 1,
          currentFile: 'b',
          destinationRank: 3,
          destinationFile: 'c',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'N' },
          currentRank: 8,
          currentFile: 'b',
          destinationRank: 6,
          destinationFile: 'c',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });

        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 3,
          currentFile: 'c',
          destinationRank: 4,
          destinationFile: 'f',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move3,
          }),
        ).toThrow('Invalid Move');

        const move4: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 3,
          currentFile: 'c',
          destinationRank: 5,
          destinationFile: 'a',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move4,
          }),
        ).toThrow('Invalid Move');
        const move5: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'N' },
          currentRank: 3,
          currentFile: 'c',
          destinationRank: 6,
          destinationFile: 'd',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move5,
          }),
        ).toThrow('Invalid Move');
      });
    });
    describe('Given a Valid Bishop Move', () => {
      it('should update the chess board and the moves with the valid movement', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'b',
          destinationRank: 3,
          destinationFile: 'b',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });

        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'a',
          destinationRank: 6,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });

        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'B' },
          currentRank: 1,
          currentFile: 'c',
          destinationRank: 3,
          destinationFile: 'a',
          enPassant: undefined,
        };
        expect(game.state.board[move3.currentRank - 1][2]?.piece.pieceType).toEqual('B');
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move3,
        });
        expect(game.state.board[move3.currentRank - 1][2]).toBeUndefined();
        expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceType).toEqual('B');

        const move4: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 6,
          currentFile: 'a',
          destinationRank: 5,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move4,
        });
        expect(game.state.board[move4.currentRank - 1][0]).toBeUndefined();
        expect(game.state.board[move4.destinationRank - 1][0]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move4.destinationRank - 1][0]?.piece.pieceType).toEqual('P');

        const move5: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'B' },
          currentRank: 3,
          currentFile: 'a',
          destinationRank: 7,
          destinationFile: 'e',
          enPassant: undefined,
        };
        expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceType).toEqual('P');
        expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceColor).toEqual('B');
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move5,
        });
        expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceType).toEqual('B');
        expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceColor).toEqual('W');
      });
    });
    describe('Given an invalid bishop move', () => {
      it('should throw an invalid move if pieces are in the way of the destination', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'B' },
          currentRank: 1,
          currentFile: 'c',
          destinationRank: 3,
          destinationFile: 'a',
          enPassant: undefined,
        };
        // If own pieces in the way
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          }),
        ).toThrow('Invalid Move');

        const move1: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'b',
          destinationRank: 3,
          destinationFile: 'b',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move1,
        });

        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'a',
          destinationRank: 6,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });

        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'B' },
          currentRank: 1,
          currentFile: 'c',
          destinationRank: 3,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move3,
        });

        const move4: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 6,
          currentFile: 'a',
          destinationRank: 5,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move4,
        });

        const move5: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'B' },
          currentRank: 3,
          currentFile: 'a',
          destinationRank: 8,
          destinationFile: 'f',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: move5,
          }),
        ).toThrow('Invalid Move');
      });
    });
    describe('Given a Valid Queen Move', () => {
      it('should update the chess board and moves with the valid movement', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'c',
          destinationRank: 3,
          destinationFile: 'c',
          enPassant: undefined,
        };
        expect(game.state.moves.length).toEqual(0);
        expect(game.state.board[move.currentRank - 1][2]?.piece.pieceType).toEqual('P');
        expect(game.state.board[move.currentRank - 1][2]?.piece.pieceColor).toEqual('W');

        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        expect(game.state.moves.length).toEqual(1);
        expect(game.state.board[move.currentRank - 1][2]).toBeUndefined();

        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'h',
          destinationRank: 6,
          destinationFile: 'h',
          enPassant: undefined,
        };
        expect(game.state.board[move2.currentRank - 1][7]?.piece.pieceType).toEqual('P');
        expect(game.state.board[move2.currentRank - 1][7]?.piece.pieceColor).toEqual('B');

        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });
        expect(game.state.moves.length).toEqual(2);
        expect(game.state.board[move2.destinationRank - 1][7]?.piece.pieceType).toEqual('P');
        expect(game.state.board[move2.destinationRank - 1][7]?.piece.pieceColor).toEqual('B');

        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'Q' },
          currentRank: 1,
          currentFile: 'd',
          destinationRank: 4,
          destinationFile: 'a',
          enPassant: undefined,
        };
        expect(game.state.board[move3.currentRank - 1][3]?.piece.pieceType).toEqual('Q');
        expect(game.state.board[move3.currentRank - 1][3]?.piece.pieceColor).toEqual('W');

        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move3,
        });

        expect(game.state.moves.length).toEqual(3);
        expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceType).toEqual('Q');

        const move4: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 6,
          currentFile: 'h',
          destinationRank: 5,
          destinationFile: 'h',
          enPassant: undefined,
        };
        expect(game.state.board[move4.currentRank - 1][7]?.piece.pieceType).toEqual('P');
        expect(game.state.board[move4.currentRank - 1][7]?.piece.pieceColor).toEqual('B');

        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move4,
        });

        expect(game.state.moves.length).toEqual(4);
        expect(game.state.board[move4.destinationRank - 1][7]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move4.destinationRank - 1][7]?.piece.pieceType).toEqual('P');

        const move5: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'Q' },
          currentRank: 4,
          currentFile: 'a',
          destinationRank: 4,
          destinationFile: 'h',
          enPassant: undefined,
        };

        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move5,
        });

        expect(game.state.moves.length).toEqual(5);
        expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceColor).toEqual('W');
        expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceType).toEqual('Q');
        expect(game.state.board[move5.destinationRank][7]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move5.destinationRank][7]?.piece.pieceType).toEqual('P');

        const move6: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'a',
          destinationRank: 5,
          destinationFile: 'a',
          enPassant: undefined,
        };

        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move6,
        });

        const move7: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'Q' },
          currentRank: 4,
          currentFile: 'h',
          destinationRank: 5,
          destinationFile: 'h',
          enPassant: undefined,
        };

        expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceColor).toEqual('B');
        expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceType).toEqual('P');

        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move7,
        });

        expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceType).toEqual('Q');
        expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceColor).toEqual('W');
      });
    });
    describe('Given an Invalid Queen Move', () => {
      it('should return an error that the move is invalid', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'Q' },
          currentRank: 1,
          currentFile: 'd',
          destinationRank: 2,
          destinationFile: 'c',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          }),
        ).toThrow('Invalid Move');
      });
    });
    describe('Given a Valid Rook Moove', () => {
      it('should update the chess board and the moves with the move', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'P' },
          currentRank: 2,
          currentFile: 'a',
          destinationRank: 4,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move,
        });
        const move2: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'a',
          destinationRank: 5,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move2,
        });
        const move3: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'R' },
          currentRank: 1,
          currentFile: 'a',
          destinationRank: 3,
          destinationFile: 'a',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move3,
        });
        expect(game.state.moves.length).toEqual(3);
        expect(game.state.board[move3.destinationRank][0]?.piece.pieceType).toEqual('P');
        expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceType).toEqual('R');

        const move4: ChessMove = {
          gamePiece: { pieceColor: 'B', pieceType: 'P' },
          currentRank: 7,
          currentFile: 'b',
          destinationRank: 5,
          destinationFile: 'b',
          enPassant: undefined,
        };
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: move4,
        });
        const move5: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'R' },
          currentRank: 3,
          currentFile: 'a',
          destinationRank: 3,
          destinationFile: 'h',
          enPassant: undefined,
        };
        expect(game.state.board[move5.currentRank - 1][0]?.piece.pieceType).toEqual('R');
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: move5,
        });
        expect(game.state.board[move5.currentRank - 1][0]).toEqual(undefined);
        expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceType).toEqual('R');
        expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceColor).toEqual('W');
      });
    });
    describe('Given an Invalid Rook Move', () => {
      it('should return an error and not update the moves with the invalid move', () => {
        const move: ChessMove = {
          gamePiece: { pieceColor: 'W', pieceType: 'R' },
          currentRank: 1,
          currentFile: 'a',
          destinationRank: 3,
          destinationFile: 'a',
          enPassant: undefined,
        };
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          }),
        ).toThrow('Invalid Move');
        expect(game.state.moves.length).toEqual(0);
      });
    });
  });
});
