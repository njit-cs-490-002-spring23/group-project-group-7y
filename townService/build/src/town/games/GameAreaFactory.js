import ChessGameArea from './ChessGameArea';
export default function GameAreaFactory(mapObject, broadcastEmitter) {
    const { name, width, height } = mapObject;
    if (!width || !height) {
        throw new Error(`Malformed viewing area ${name}`);
    }
    const rect = { x: mapObject.x, y: mapObject.y, width, height };
    const gameType = mapObject.type;
    if (gameType === 'GameArea') {
        return new ChessGameArea(name, rect, broadcastEmitter);
    }
    throw new Error(`Unknown game area type ${mapObject.class}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUFyZWFGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Rvd24vZ2FtZXMvR2FtZUFyZWFGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBUzVDLE1BQU0sQ0FBQyxPQUFPLFVBQVUsZUFBZSxDQUNyQyxTQUEwQixFQUMxQixnQkFBNkI7SUFFN0IsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDO0lBQzFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUNuRDtJQUNELE1BQU0sSUFBSSxHQUFnQixFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUM1RSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQ2hDLElBQUksUUFBUSxLQUFLLFVBQVUsRUFBRTtRQUMzQixPQUFPLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUN4RDtJQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQy9ELENBQUMifQ==