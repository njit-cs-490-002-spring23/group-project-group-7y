import InteractableArea from '../InteractableArea';
export default class GameArea extends InteractableArea {
    _game;
    _history = [];
    get game() {
        return this._game;
    }
    get history() {
        return this._history;
    }
    toModel() {
        return {
            id: this.id,
            game: this._game?.toModel(),
            history: this._history,
            occupantsByID: this.occupantsByID,
            type: this.getType(),
        };
    }
    get isActive() {
        return true;
    }
    remove(player) {
        if (this._game) {
            this._game.leave(player);
        }
        super.remove(player);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdG93bi9nYW1lcy9HYW1lQXJlYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFDO0FBT25ELE1BQU0sQ0FBQyxPQUFPLE9BQWdCLFFBRTVCLFNBQVEsZ0JBQWdCO0lBQ2QsS0FBSyxDQUFZO0lBRWpCLFFBQVEsR0FBaUIsRUFBRSxDQUFDO0lBRXRDLElBQVcsSUFBSTtRQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUU7WUFDM0IsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3RCLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNqQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUVELElBQVcsUUFBUTtRQUNqQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFJTSxNQUFNLENBQUMsTUFBYztRQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxQjtRQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkIsQ0FBQztDQUNGIn0=