import ChessGame from './ChessGame';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';

describe('ChessGame', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  describe('board', () => {
    it('should initialize with the correct starting positions', () => {
      const { board } = game.state;
      expect(board[0][0]).toEqual({ piece: { pieceType: 'R', pieceColor: 'white' }, color: 'W' }); // White rook at A1
      expect(board[0][7]).toEqual({ piece: { pieceType: 'R', pieceColor: 'white' }, color: 'W' }); // White rook at H1
      expect(board[7][0]).toEqual({ piece: { pieceType: 'R', pieceColor: 'black' }, color: 'B' }); // Black rook at A8
      expect(board[7][7]).toEqual({ piece: { pieceType: 'R', pieceColor: 'black' }, color: 'B' }); // Black rook at H8
      expect(board[1][1]).toEqual({ piece: { pieceType: 'P', pieceColor: 'white' }, color: 'W' }); // White Pawn at B2
      expect(board[6][6]).toEqual({ piece: { pieceType: 'P', pieceColor: 'black' }, color: 'B' }); // Black Pawn at G7
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
  /*
  TO DO: uncomment after join implemented
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

    describe('isKingInCheck', () => {
      it.skip('should return false if the white king is not in check', () => {
        expect(game.isKingInCheck(player1.id)).toBe(false);
      });
      it.skip('should return false if the black king is not in check', () => {
        expect(game.isKingInCheck(player2.id)).toBe(false);
      });
    });
  });
  */
});
