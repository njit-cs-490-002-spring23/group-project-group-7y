/* eslint-disable no-console */
import pkg from 'sqlite3';
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
