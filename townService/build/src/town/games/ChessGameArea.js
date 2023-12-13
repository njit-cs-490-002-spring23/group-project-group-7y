import InvalidParametersError, { GAME_ID_MISSMATCH_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, INVALID_COMMAND_MESSAGE, } from '../../lib/InvalidParametersError';
import GameArea from './GameArea';
import ChessGame from './ChessGame';
export default class ChessGameArea extends GameArea {
    _type = 'ChessArea';
    getType() {
        return this._type;
    }
    handleCommand(command, player) {
        if (command.type === 'JoinGame') {
            return this.handleJoinCommand(player);
        }
        if (command.type === 'GameMove') {
            return this.handleGameMoveCommand(command, player);
        }
        if (command.type === 'LeaveGame') {
            return this.handleLeaveGameCommand(command, player);
        }
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
    }
    _updateHistoryIfGameOver() {
        if (this.game && this.game.state.status === 'OVER') {
            const gamePlayer = this._occupants.filter(eachPlayer => eachPlayer.id === this.game?.state.white || eachPlayer.id === this.game?.state.black);
            const gameResult = {
                gameID: this.game.id,
                scores: {},
                moves: [],
            };
            gamePlayer.forEach(player => {
                let score = 0;
                if (player.id === this.game?.state.winner) {
                    score = 1;
                }
                gameResult.scores[player.userName] = score;
            });
            this._history.push(gameResult);
        }
    }
    handleJoinCommand(player) {
        if (this._game) {
            this._game.join(player);
        }
        else {
            this._game = new ChessGame();
            this._game.join(player);
        }
        this._emitAreaChanged();
        return { gameID: this._game.id };
    }
    handleGameMoveCommand(command, player) {
        if (this._game && command.type === 'GameMove') {
            if (command.gameID !== this._game.id) {
                throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
            }
            this._game.applyMove({
                gameID: this._game.id,
                playerID: player.id,
                move: command.move,
            });
            this._updateHistoryIfGameOver();
            this._emitAreaChanged();
            return undefined;
        }
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    handleLeaveGameCommand(command, player) {
        if (this._game && command.type === 'LeaveGame') {
            if (command.gameID !== this._game.id) {
                throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
            }
            this._game.leave(player);
            this._updateHistoryIfGameOver();
            this._emitAreaChanged();
            return undefined;
        }
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlc3NHYW1lQXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90b3duL2dhbWVzL0NoZXNzR2FtZUFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxzQkFBc0IsRUFBRSxFQUM3Qix5QkFBeUIsRUFDekIsNEJBQTRCLEVBQzVCLHVCQUF1QixHQUN4QixNQUFNLGtDQUFrQyxDQUFDO0FBUTFDLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFPcEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFjLFNBQVEsUUFBbUI7SUFDcEQsS0FBSyxHQUFxQixXQUFXLENBQUM7SUFFcEMsT0FBTztRQUNmLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBd0JNLGFBQWEsQ0FDbEIsT0FBb0IsRUFDcEIsTUFBYztRQUVkLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUErQyxDQUFDO1NBQ3JGO1FBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUMvQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FDL0IsT0FBTyxFQUNQLE1BQU0sQ0FDdUMsQ0FBQztTQUNqRDtRQUNELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDaEMsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQ2hDLE9BQU8sRUFDUCxNQUFNLENBQ3VDLENBQUM7U0FDakQ7UUFDRCxNQUFNLElBQUksc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBTU8sd0JBQXdCO1FBQzlCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO1lBQ2xELE1B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