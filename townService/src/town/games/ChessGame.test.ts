import ChessGame from './ChessGame';

describe('ChessGame', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  describe('board', () => {
    it('should initialize with the correct starting positions', () => {
      const { board } = game;
      // Perform assertions on the initial board setup
      // For example, check if the pieces are in the right place
      expect(board[0][0]).toEqual({ piece: 'R', color: 'W' });
      expect(board[1][0]).toEqual({ piece: 'P', color: 'W' }); // Pawns are in the second row
      expect(board[6][0]).toEqual({ piece: 'P', color: 'B' }); // Pawns are in the seventh row
      expect(board[7][7]).toEqual({ piece: 'R', color: 'B' });
    });
  });
});
