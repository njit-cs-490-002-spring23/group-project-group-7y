import ChessGame from './ChessGame';

describe('ChessGame', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  describe('board', () => {
    it('should initialize with the correct starting positions', () => {
      const { board } = game;
      expect(board[0][0]).toEqual({ piece: 'R', color: 'W' }); // White rook at A1
      expect(board[0][7]).toEqual({ piece: 'R', color: 'W' }); // White rook at H1
      expect(board[7][0]).toEqual({ piece: 'R', color: 'B' }); // Black rook at A1
      expect(board[7][7]).toEqual({ piece: 'R', color: 'B' }); // Black rook at H1
      expect(board[1][1]).toEqual({ piece: 'P', color: 'W' }); // White Pawn at B2
      expect(board[6][6]).toEqual({ piece: 'P', color: 'B' }); // Black Pawn at G7
    });
  });

  describe('_getKingPosition', () => {
    it('should return the correct position of the king', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - testing access to a private method
      const whiteKingPosition = game._getKingPosition('W');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const blackKingPosition = game._getKingPosition('B');
      expect(whiteKingPosition).toEqual({ rank: 1, file: 'e' });
      expect(blackKingPosition).toEqual({ rank: 8, file: 'e' });
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

  describe('isCheckmate', () => {
    it.skip('should return false if the king is not in check', () => {
      expect(
        game.isCheckmate({ moves: [], status: 'IN_PROGRESS', white: 'player1', black: 'player2' }),
      ).toBe(false);
    });
  });
});
