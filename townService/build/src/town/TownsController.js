var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import assert from 'assert';
import { Body, Controller, Delete, Example, Get, Header, Patch, Path, Post, Response, Route, Tags, } from 'tsoa';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyTownsStore from '../lib/TownsStore';
let TownsController = class TownsController extends Controller {
    _townsStore = CoveyTownsStore.getInstance();
    async listTowns() {
        return this._townsStore.getTowns();
    }
    async createTown(request) {
        const { townID, townUpdatePassword } = await this._townsStore.createTown(request.friendlyName, request.isPubliclyListed, request.mapFile);
        return {
            townID,
            townUpdatePassword,
        };
    }
    async updateTown(townID, townUpdatePassword, requestBody) {
        const success = this._townsStore.updateTown(townID, townUpdatePassword, requestBody.friendlyName, requestBody.isPubliclyListed);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async deleteTown(townID, townUpdatePassword) {
        const success = this._townsStore.deleteTown(townID, townUpdatePassword);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async createConversationArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addConversationArea(requestBody);
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async createViewingArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError('Invalid values specified');
        }
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addViewingArea(requestBody);
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async joinTown(socket) {
        const { userName, townID } = socket.handshake.auth;
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            socket.disconnect(true);
            return;
        }
        socket.join(town.townID);
        const newPlayer = await town.addPlayer(userName, socket);
        assert(newPlayer.videoToken);
        socket.emit('initialize', {
            userID: newPlayer.id,
            sessionToken: newPlayer.sessionToken,
            providerVideoToken: newPlayer.videoToken,
            currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
            friendlyName: town.friendlyName,
            isPubliclyListed: town.isPubliclyListed,
            interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
        });
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "listTowns", null);
__decorate([
    Example({ townID: 'stringID', townUpdatePassword: 'secretPassword' }),
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createTown", null);
__decorate([
    Patch('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "updateTown", null);
__decorate([
    Delete('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "deleteTown", null);
__decorate([
    Post('{townID}/conversationArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createConversationArea", null);
__decorate([
    Post('{townID}/viewingArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createViewingArea", null);
TownsController = __decorate([
    Route('towns'),
    Tags('towns')
], TownsController);
export { TownsController };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVG93bnNDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLEVBQ0wsSUFBSSxFQUNKLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLEdBQUcsRUFDSCxNQUFNLEVBQ04sS0FBSyxFQUNMLElBQUksRUFDSixJQUFJLEVBQ0osUUFBUSxFQUNSLEtBQUssRUFDTCxJQUFJLEdBQ0wsTUFBTSxNQUFNLENBQUM7QUFHZCxPQUFPLHNCQUFzQixNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sZUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBZWhELElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWdCLFNBQVEsVUFBVTtJQUNyQyxXQUFXLEdBQW9CLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQVE5RCxLQUFLLENBQUMsU0FBUztRQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQVdNLEtBQUssQ0FBQyxVQUFVLENBQVMsT0FBeUI7UUFDdkQsTUFBTSxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQ3RFLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFDeEIsT0FBTyxDQUFDLE9BQU8sQ0FDaEIsQ0FBQztRQUNGLE9BQU87WUFDTCxNQUFNO1lBQ04sa0JBQWtCO1NBQ25CLENBQUM7SUFDSixDQUFDO0lBV00sS0FBSyxDQUFDLFVBQVUsQ0FDYixNQUFjLEVBQ1Usa0JBQTBCLEVBQ2xELFdBQStCO1FBRXZDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUN6QyxNQUFNLEVB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