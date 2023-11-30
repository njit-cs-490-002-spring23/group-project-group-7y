// TODO: Remove when we have database
function generateDummyChessResults() {
  return [
    {
      scores: { Alice: 1, Bob: 0, Charlie: 0 }, // Alice wins
      moves: [],
      gameID: 'game1',
    },
    {
      scores: { Alice: 0, Bob: 0, Charlie: 1 }, // Charlie
      moves: [],
      gameID: 'game1',
    },
    {
      scores: { Alice: 0, Bob: 1, Charlie: 0 }, // Bob wins
      moves: [],
      gameID: 'game2',
    },
    {
      scores: { Alice: 0, Bob: 0, Charlie: 1 }, // Charlie wins
      moves: [],
      gameID: 'game3',
    },
    {
      scores: { Alice: 0, Bob: 0, Charlie: 0 }, // Tie
      moves: [],
      gameID: 'game4',
    },
    {
      scores: { Alice: 0, Bob: 1, Charlie: 0 }, // Bob
      moves: [],
      gameID: 'game4',
    },
    {
      scores: { Alice: 0, Bob: 0, Charlie: 1 }, // Charlie
      moves: [],
      gameID: 'game4',
    },
  ];
}
export { generateDummyChessResults };
