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
      it.skip('should return false if the king is not in check', () => {
        expect(game.isCheckmate()).toBe(false);
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
  });
});
