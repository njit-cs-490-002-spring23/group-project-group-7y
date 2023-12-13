import pkg from 'sqlite3';
const { Database } = pkg;
const db = new Database('db.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS leaderboard ( username VARCHAR(300) PRIMARY KEY, wins INTEGER, ties INTEGER, losses INTEGER)');
db.exec("INSERT OR REPLACE INTO leaderboard VALUES ('Rob', 4, 0, 1), ('Siva', 1, 2, 4), ('Raymond', 3, 0, 3), ('Chris', 3, 0, 3)");
export const databaseUpdate = {
    getLeaderBoardRow: (username) => db.get('SELECT * FROM leaderboard WHERE username = ?', username),
    addUser: (username, wins, ties, losses) => db.run('INSERT OR REPLACE INTO leaderboard (username, wins, ties, losses) VALUES (?, ?, ?, ?)', username, wins, ties, losses),
    updateLeaderBoardRow: (username, result) => {
        if (result === 'ties') {
            db.run('UPDATE leaderboard SET ties = ties + 1 WHERE username = ?', username);
        }
        else if (result === 'wins') {
            db.run('UPDATE leaderboard SET wins = wins + 1 WHERE username = ?', username);
        }
        else {
            db.run('UPDATE leaderboard SET losses = losses + 1 WHERE username = ?', username);
        }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlc3NEYXRhYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90b3duL2dhbWVzL2RhdGFiYXNlL2NoZXNzRGF0YWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxHQUFHLE1BQU0sU0FBUyxDQUFDO0FBRTFCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFRekIsTUFBTSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckMsRUFBRSxDQUFDLElBQUksQ0FDTCx5SEFBeUgsQ0FDMUgsQ0FBQztBQUVGLEVBQUUsQ0FBQyxJQUFJLENBQ0wseUhBQXlILENBQzFILENBQUM7QUFDRixNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUc7SUFDNUIsaUJBQWlCLEVBQUUsQ0FBQyxRQUFnQixFQUFFLEVBQUUsQ0FDdEMsRUFBRSxDQUFDLEdBQUcsQ0FBQyw4Q0FBOEMsRUFBRSxRQUFRLENBQUM7SUFDbEUsT0FBTyxFQUFFLENBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxFQUFFLENBQ3hFLEVBQUUsQ0FBQyxHQUFHLENBQ0osdUZBQXVGLEVBQ3ZGLFFBQVEsRUFDUixJQUFJLEVBQ0osSUFBSSxFQUNKLE1BQU0sQ0FDUDtJQUNILG9CQUFvQixFQUFFLENBQUMsUUFBZ0IsRUFBRSxNQUFrQyxFQUFFLEVBQUU7UUFDN0UsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO1lBQ3JCLEVBQUUsQ0FBQyxHQUFHLENBQUMsMkRBQTJELEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDL0U7YUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7WUFDNUIsRUFBRSxDQUFDLEdBQUcsQ0FBQywyREFBMkQsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMvRTthQUFNO1lBQ0wsRUFBRSxDQUFDLEdBQUcsQ0FBQywrREFBK0QsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNuRjtJQUNILENBQUM7Q0FDRixDQUFDIn0=