/* eslint-disable no-console */
import pkg from 'sqlite3';
import { GameData } from '../../../types/CoveyTownSocket';
// eslint-disable-next-line @typescript-eslint/naming-convention
const { Database } = pkg;

export type LeaderBoardRow = {
  username: string;
  wins: number;
  ties: number;
  losses: number;
};
const db = new Database('db.sqlite');
db.exec(
  'CREATE TABLE IF NOT EXISTS leaderboard ( username VARCHAR(300) PRIMARY KEY, wins INTEGER, ties INTEGER, losses INTEGER)',
);

db.exec(
  "INSERT OR REPLACE INTO leaderboard VALUES ('Rob', 4, 0, 1), ('Siva', 1, 2, 4), ('Raymond', 3, 0, 3), ('Chris', 3, 0, 3)",
);

db.exec(
  `CREATE TABLE IF NOT EXISTS gameHistories (
    gameId TEXT PRIMARY KEY,
    date TEXT,
    playerOne TEXT,
    playerTwo TEXT,
    result TEXT,
    moves TEXT,
    moveNames TEXT
  )`,
);

db.exec(
  `INSERT OR REPLACE INTO gameHistories (gameId, date, playerOne, playerTwo, result, moves, moveNames) VALUES
    ('game1', '2023-04-01', 'TestPerson','AnotherPerson', 'TestPerson Won', '["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
      "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR",
      "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR",
      "rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR",
      "rnbqkbnr/ppp2ppp/4p3/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR",
      "rnbqkbnr/ppp2ppp/4p3/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 1",
      "rnbqk1nr/ppp2ppp/4p3/3p4/1b1P1B2/4P3/PPP2PPP/RN1QKBNR",
      "rnbqk1nr/ppp2ppp/4p3/3p4/1b1P1B2/2P1P3/PP3PPP/RN1QKBNR",
      "rnbqk1nr/ppp2ppp/4p3/b2p4/3P1B2/2P1P3/PP3PPP/RN1QKBNR",
      "rnbqk1nr/ppp2ppp/4p3/b2p4/3P1B2/2PBP3/PP3PPP/RN1QK1NR",
      "r1bqk1nr/ppp2ppp/2n1p3/b2p4/3P1B2/2PBP3/PP3PPP/RN1QK1NR",
      "r1bqk1nr/ppp2ppp/2n1p3/b2p4/3P1B2/2PBPN2/PP3PPP/RN1QK2R"]',
      '["Inital","d4","d5","Bf4","e6","e3","Bb4+","c3","Ba5","Bd3","Nc6","Nf3"]')`,
);

db.exec(
  `INSERT OR REPLACE INTO gameHistories (gameId, date, playerOne, playerTwo, result, moves, moveNames) VALUES
    ('game3', '2023-04-04', 'ThirdPerson', 'TestPerson', 'ThirdPerson Won', '["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
    "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR",
    "rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR",
    "rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR"]','["Inital","e4","d5","exd5","Qxd5"]')`,
);

export const databaseUpdate = {
  getLeaderBoardRow: (username: string) =>
    db.get('SELECT * FROM leaderboard WHERE username = ?', username),
  addUser: (username: string, wins: number, ties: number, losses: number) =>
    db.run(
      'INSERT OR REPLACE INTO leaderboard (username, wins, ties, losses) VALUES (?, ?, ?, ?)',
      username,
      wins,
      ties,
      losses,
    ),
  updateLeaderBoardRow: (username: string, result: 'ties' | 'wins' | 'losses') => {
    if (result === 'ties') {
      db.run('UPDATE leaderboard SET ties = ties + 1 WHERE username = ?', username);
    } else if (result === 'wins') {
      db.run('UPDATE leaderboard SET wins = wins + 1 WHERE username = ?', username);
    } else {
      db.run('UPDATE leaderboard SET losses = losses + 1 WHERE username = ?', username);
    }
  },
  getAllGames: (): Promise<GameData[]> =>
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM gameHistories', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as GameData[]);
        }
      });
    }),
  getGameHistory: async (gameId: string): Promise<GameData | undefined> =>
    new Promise((resolve, reject) => {
      db.get('SELECT * FROM gameHistories WHERE gameId = ?', [gameId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row && typeof row === 'object' && 'gameId' in row) {
          resolve(row as GameData);
        } else {
          resolve(undefined);
        }
      });
    }),

  // Update the updateGameHistory method
  async updateGameHistory(gameId: string, newMove: string, newMoveName: string): Promise<void> {
    try {
      const gameData = await this.getGameHistory(gameId);
      if (!gameData) {
        throw new Error('Game not found in database');
      }

      const moves = gameData.moves || [];
      const moveNames = gameData.moveNames || [];
      moves.push(newMove);
      moveNames.push(newMoveName);
      const updatedMovesJSON = JSON.stringify(moves);
      const moveNamesJSON = JSON.stringify(moveNames);

      db.run(
        'UPDATE gameHistories SET moves = ? WHERE gameId = ?',
        [updatedMovesJSON, gameId],
        err => {
          if (err) {
            throw err;
          }
        },
      );
      db.run(
        'UPDATE gameHistories SET moveNames = ? WHERE gameId = ?',
        [moveNamesJSON, gameId],
        err => {
          if (err) {
            throw err;
          }
        },
      );
    } catch (error) {
      console.error('Error updating game history:', error);
      throw error;
    }
  },
};
