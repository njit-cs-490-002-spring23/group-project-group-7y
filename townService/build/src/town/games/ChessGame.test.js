import ChessGame from './ChessGame';
import { createPlayerForTesting } from '../../TestUtils';
describe('ChessGame', () => {
    let game;
    beforeEach(() => {
        game = new ChessGame();
    });
    describe('board', () => {
        it('should initialize with the correct starting positions', () => {
            const { board } = game.state;
            expect(board[0][0]).toEqual({ piece: { pieceType: 'R', pieceColor: 'B', moved: false } });
            expect(board[0][7]).toEqual({ piece: { pieceType: 'R', pieceColor: 'B', moved: false } });
            expect(board[7][0]).toEqual({ piece: { pieceType: 'R', pieceColor: 'W', moved: false } });
            expect(board[7][7]).toEqual({ piece: { pieceType: 'R', pieceColor: 'W', moved: false } });
            expect(board[1][1]).toEqual({ piece: { pieceType: 'P', pieceColor: 'B', moved: false } });
            expect(board[6][6]).toEqual({ piece: { pieceType: 'P', pieceColor: 'W', moved: false } });
        });
    });
    describe('_getKingPosition', () => {
        it('should return the correct position of the king', () => {
            const whiteKingPosition = game._getKingPosition('B');
            const blackKingPosition = game._getKingPosition('W');
            expect(whiteKingPosition).toEqual({ rank: 1, file: 'e' });
            expect(blackKingPosition).toEqual({ rank: 8, file: 'e' });
        });
    });
    describe('_getPieces', () => {
        it('should return all pieces for a given color', () => {
            const whitePieces = game._getPieces('W');
            const blackPieces = game._getPieces('B');
            expect(whitePieces.length).toBeGreaterThan(0);
            expect(blackPieces.length).toBeGreaterThan(0);
        });
    });
    describe('during game in progress', () => {
        let player1;
        let player2;
        beforeEach(() => {
            player1 = createPlayerForTesting();
            player2 = createPlayerForTesting();
            game.join(player1);
            game.join(player2);
        });
        describe('isCheckmate', () => {
            it.skip('should return false if the king is not in checkmate (e.g., starting position)', () => {
                game = new ChessGame();
                expect(game.isCheckmate()).toBe(false);
            });
            it.skip("should return true when the king is in checkmate (Fool's Mate)", () => {
                const whitePlayerId = 'player1Id';
                const blackPlayerId = 'player2Id';
                game.applyMove({
                    playerID: whitePlayerId,
                    move: {
                        gamePiece: { pieceType: 'P', pieceColor: 'W', moved: true },
                        currentRank: 2,
                        currentFile: 'f',
                        destinationRank: 3,
                        destinationFile: 'f',
                    },
                    gameID: '123',
                });
                game.applyMove({
                    playerID: blackPlayerId,
                    move: {
                        gamePiece: { pieceType: 'P', pieceColor: 'B', moved: true },
                        currentRank: 7,
                        currentFile: 'e',
                        destinationRank: 5,
                        destinationFile: 'e',
                    },
                    gameID: '123',
                });
                game.applyMove({
                    playerID: whitePlayerId,
                    move: {
                        gamePiece: { pieceType: 'P', pieceColor: 'W', moved: true },
                        currentRank: 2,
                        currentFile: 'g',
                        destinationRank: 4,
                        destinationFile: 'g',
                    },
                    gameID: '123',
                });
                game.applyMove({
                    playerID: blackPlayerId,
                    move: {
                        gamePiece: { pieceType: 'Q', pieceColor: 'B', moved: true },
                        currentRank: 8,
                        currentFile: 'h',
                        destinationRank: 4,
                        destinationFile: 'h',
                    },
                    gameID: '123',
                });
                expect(game.isCheckmate()).toBe(true);
            });
        });
        describe('bestMove', () => {
            it('should produce the correct fen for the starting board', () => {
                expect(game.fenNotation()).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            });
            it('should respond with the next best move for the start board', async () => {
                const move = await game.nextBestMove();
                expect(move).toEqual({
                    gamePiece: 'P',
                    currentRank: 2,
                    currentFile: 'd',
                    destinationRank: 4,
                    destinationFile: 'd',
                });
            });
        });
        describe('isKingInCheck', () => {
            it.skip('should return false if the white king is not in check', () => {
                expect(game.isKingInCheck(player1.id)).toBe(false);
            });
            it.skip('should return false if the black king is not in check', () => {
                expect(game.isKingInCheck(player2.id)).toBe(false);
            });
        });
        describe('Given a possible moves check', () => {
            it('should give the right moves for a pawn', () => {
                const moves = game.possibleMoves(2, 'a');
                expect(moves).toEqual([
                    {
                        gamePiece: { pieceColor: 'W', pieceType: 'P', moved: false },
                        currentRank: 2,
                        currentFile: 'a',
                        destinationRank: 3,
                        destinationFile: 'a',
                    },
                    {
                        gamePiece: { pieceColor: 'W', pieceType: 'P', moved: false },
                        currentRank: 2,
                        currentFile: 'a',
                        destinationRank: 4,
                        destinationFile: 'a',
                    },
                ]);
            });
            it('should give the zero moves for a starting king', () => {
                const moves = game.possibleMoves(1, 'e');
                expect(moves.length).toEqual(0);
            });
            it('should give the zero moves for a starting queen', () => {
                const moves = game.possibleMoves(1, 'd');
                expect(moves.length).toEqual(0);
            });
            it('should give the zero moves for a starting rook', () => {
                const moves = game.possibleMoves(1, 'a');
                expect(moves.length).toEqual(0);
            });
            it('should give the zero moves for a starting bishop', () => {
                const moves = game.possibleMoves(1, 'c');
                expect(moves.length).toEqual(0);
            });
            it('should give the two moves for a starting knight', () => {
                const moves = game.possibleMoves(1, 'b');
                expect(moves.length).toEqual(2);
                expect(moves).toEqual([
                    {
                        gamePiece: { pieceColor: 'W', pieceType: 'N', moved: false },
                        currentRank: 1,
                        currentFile: 'b',
                        destinationRank: 3,
                        destinationFile: 'a',
                    },
                    {
                        gamePiece: { pieceColor: 'W', pieceType: 'N', moved: false },
                        currentRank: 1,
                        currentFile: 'b',
                        destinationRank: 3,
                        destinationFile: 'c',
                    },
                ]);
            });
        });
        describe('Given a Valid Pawn Move', () => {
            it('should update the chess board and the moves with the valid movement', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'a',
                    destinationRank: 4,
                    destinationFile: 'a',
                };
                expect(game.state.board[move.currentRank - 1][0]?.piece.pieceType).toEqual('P');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                expect(game.state.moves.length).toEqual(1);
                expect(game.state.board[move.currentRank - 1][0]).toBeUndefined();
                expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceType).toEqual('P');
            });
            it('given a valid move for en passant', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'e',
                    destinationRank: 4,
                    destinationFile: 'e',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                expect(game.state.moves.length).toEqual(1);
                expect(game.state.board[move.currentRank - 1][4]).toBeUndefined();
                expect(game.state.board[move.destinationRank - 1][4]?.piece.pieceType).toEqual('P');
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'a',
                    destinationRank: 6,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                expect(game.state.moves.length).toEqual(2);
                expect(game.state.board[move2.currentRank - 1][0]).toBeUndefined();
                expect(game.state.board[move2.destinationRank - 1][0]?.piece.pieceType).toEqual('P');
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 4,
                    currentFile: 'e',
                    destinationRank: 5,
                    destinationFile: 'e',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                });
                expect(game.state.moves.length).toEqual(3);
                expect(game.state.board[move3.currentRank - 1][4]).toBeUndefined();
                expect(game.state.board[move3.destinationRank - 1][4]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move3.destinationRank - 1][4]?.piece.pieceType).toEqual('P');
                const move4 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'd',
                    destinationRank: 5,
                    destinationFile: 'd',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move4,
                });
                expect(game.state.moves.length).toEqual(4);
                expect(game.state.board[move4.currentRank - 1][3]).toBeUndefined();
                expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceType).toEqual('P');
                const move5 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 5,
                    currentFile: 'e',
                    destinationRank: 6,
                    destinationFile: 'd',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move5,
                });
                expect(game.state.moves.length).toEqual(5);
                expect(game.state.board[move5.currentRank - 1][4]).toBeUndefined();
                expect(game.state.board[move5.destinationRank - 2][3]).toBeUndefined();
                expect(game.state.board[move5.destinationRank - 1][3]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move5.destinationRank - 1][3]?.piece.pieceType).toEqual('P');
            });
        });
        describe('Given Invalid Pawn Move', () => {
            it('should return an error if the player moves a piece that does not belong to them', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'a',
                    destinationRank: 4,
                    destinationFile: 'a',
                };
                expect(game.state.board[move.currentRank - 1][0]?.piece.pieceType).toEqual('P');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                expect(game.state.moves.length).toEqual(1);
                expect(game.state.board[move.currentRank - 1][0]).toBeUndefined();
                expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceType).toEqual('P');
                const move2 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'b',
                    destinationRank: 4,
                    destinationFile: 'b',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                })).toThrow('Player 2 can only move black pieces');
            });
            it('should return an error if the player moves a piece when it is not their turn', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'a',
                    destinationRank: 4,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                const move2 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'b',
                    destinationRank: 4,
                    destinationFile: 'b',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move2,
                })).toThrow('Not Your Turn');
            });
            it('should return an error if the pawn changes rank and there is no capture, en passant', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'a',
                    destinationRank: 3,
                    destinationFile: 'b',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                })).toThrow('Invalid Move');
            });
            it('when a piece is in front of the pawn the pawn can not move', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 1,
                    currentFile: 'b',
                    destinationRank: 3,
                    destinationFile: 'c',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                expect(game.state.board[move.currentRank - 1][1]).toBeUndefined();
                expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceType).toEqual('N');
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'N', moved: true },
                    currentRank: 8,
                    currentFile: 'g',
                    destinationRank: 6,
                    destinationFile: 'f',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                expect(game.state.board[move2.currentRank - 1][6]).toBeUndefined();
                expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceType).toEqual('N');
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'c',
                    destinationRank: 4,
                    destinationFile: 'c',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                })).toThrow('Invalid Move');
            });
        });
        describe('Given A Valid Knight Move', () => {
            it('Should update the chess board and the moves with the valid movement', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 1,
                    currentFile: 'b',
                    destinationRank: 3,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                expect(game.state.board[move.currentRank - 1][1]).toBeUndefined();
                expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move.destinationRank - 1][0]?.piece.pieceType).toEqual('N');
            });
            it('Given a series of knight moves should update the chess board with the moves', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 1,
                    currentFile: 'b',
                    destinationRank: 3,
                    destinationFile: 'c',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                expect(game.state.board[move.currentRank - 1][1]).toBeUndefined();
                expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move.destinationRank - 1][2]?.piece.pieceType).toEqual('N');
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'N', moved: true },
                    currentRank: 8,
                    currentFile: 'g',
                    destinationRank: 6,
                    destinationFile: 'f',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                expect(game.state.board[move2.currentRank - 1][6]).toBeUndefined();
                expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move2.destinationRank - 1][5]?.piece.pieceType).toEqual('N');
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 3,
                    currentFile: 'c',
                    destinationRank: 5,
                    destinationFile: 'd',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                });
                expect(game.state.board[move3.currentRank - 1][2]).toBeUndefined();
                expect(game.state.board[move3.destinationRank - 1][3]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move3.destinationRank - 1][3]?.piece.pieceType).toEqual('N');
                const move4 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'N', moved: true },
                    currentRank: 6,
                    currentFile: 'f',
                    destinationRank: 5,
                    destinationFile: 'd',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move4,
                });
                expect(game.state.board[move4.currentRank - 1][5]).toBeUndefined();
                expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move4.destinationRank - 1][3]?.piece.pieceType).toEqual('N');
            });
        });
        describe('Give an Invalid Knight Move', () => {
            it('should return an error that the move is invalid when it tries to land on a spot the player owns', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 1,
                    currentFile: 'b',
                    destinationRank: 2,
                    destinationFile: 'd',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                })).toThrow('Invalid Move');
            });
            it('should return an error that move is invalid given incorrect movement', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 1,
                    currentFile: 'b',
                    destinationRank: 3,
                    destinationFile: 'c',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'N', moved: true },
                    currentRank: 8,
                    currentFile: 'b',
                    destinationRank: 6,
                    destinationFile: 'c',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 3,
                    currentFile: 'c',
                    destinationRank: 4,
                    destinationFile: 'f',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                })).toThrow('Invalid Move');
                const move4 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 3,
                    currentFile: 'c',
                    destinationRank: 5,
                    destinationFile: 'a',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move4,
                })).toThrow('Invalid Move');
                const move5 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'N', moved: true },
                    currentRank: 3,
                    currentFile: 'c',
                    destinationRank: 6,
                    destinationFile: 'd',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move5,
                })).toThrow('Invalid Move');
            });
        });
        describe('Given a Valid Bishop Move', () => {
            it('should update the chess board and the moves with the valid movement', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'b',
                    destinationRank: 3,
                    destinationFile: 'b',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'a',
                    destinationRank: 6,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'B', moved: true },
                    currentRank: 1,
                    currentFile: 'c',
                    destinationRank: 3,
                    destinationFile: 'a',
                };
                expect(game.state.board[move3.currentRank - 2][2]?.piece.pieceType).toEqual('B');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                });
                expect(game.state.board[move3.currentRank - 1][2]).toBeUndefined();
                expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceType).toEqual('B');
                const move4 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 6,
                    currentFile: 'a',
                    destinationRank: 5,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move4,
                });
                expect(game.state.board[move4.currentRank - 1][0]).toBeUndefined();
                expect(game.state.board[move4.destinationRank - 1][0]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move4.destinationRank - 1][0]?.piece.pieceType).toEqual('P');
                const move5 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'B', moved: true },
                    currentRank: 3,
                    currentFile: 'a',
                    destinationRank: 7,
                    destinationFile: 'e',
                };
                expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceType).toEqual('P');
                expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceColor).toEqual('B');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move5,
                });
                expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceType).toEqual('B');
                expect(game.state.board[move5.destinationRank - 1][4]?.piece.pieceColor).toEqual('W');
            });
        });
        describe('Given an invalid bishop move', () => {
            it('should throw an invalid move if pieces are in the way of the destination', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'B', moved: true },
                    currentRank: 1,
                    currentFile: 'c',
                    destinationRank: 3,
                    destinationFile: 'a',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                })).toThrow('Invalid Move');
                const move1 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'b',
                    destinationRank: 3,
                    destinationFile: 'b',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move1,
                });
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'a',
                    destinationRank: 6,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'B', moved: true },
                    currentRank: 1,
                    currentFile: 'c',
                    destinationRank: 3,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                });
                const move4 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 6,
                    currentFile: 'a',
                    destinationRank: 5,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move4,
                });
                const move5 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'B', moved: true },
                    currentRank: 3,
                    currentFile: 'a',
                    destinationRank: 8,
                    destinationFile: 'f',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move5,
                })).toThrow('Invalid Move');
            });
        });
        describe('Given a Valid Queen Move', () => {
            it('should update the chess board and moves with the valid movement', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'c',
                    destinationRank: 3,
                    destinationFile: 'c',
                };
                expect(game.state.moves.length).toEqual(0);
                expect(game.state.board[move.currentRank - 1][2]?.piece.pieceType).toEqual('P');
                expect(game.state.board[move.currentRank - 1][2]?.piece.pieceColor).toEqual('W');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                expect(game.state.moves.length).toEqual(1);
                expect(game.state.board[move.currentRank - 1][2]).toBeUndefined();
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'h',
                    destinationRank: 6,
                    destinationFile: 'h',
                };
                expect(game.state.board[move2.currentRank - 1][7]?.piece.pieceType).toEqual('P');
                expect(game.state.board[move2.currentRank - 1][7]?.piece.pieceColor).toEqual('B');
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                expect(game.state.moves.length).toEqual(2);
                expect(game.state.board[move2.destinationRank - 1][7]?.piece.pieceType).toEqual('P');
                expect(game.state.board[move2.destinationRank - 1][7]?.piece.pieceColor).toEqual('B');
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'Q', moved: true },
                    currentRank: 1,
                    currentFile: 'd',
                    destinationRank: 4,
                    destinationFile: 'a',
                };
                expect(game.state.board[move3.currentRank - 1][3]?.piece.pieceType).toEqual('Q');
                expect(game.state.board[move3.currentRank - 1][3]?.piece.pieceColor).toEqual('W');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                });
                expect(game.state.moves.length).toEqual(3);
                expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceType).toEqual('Q');
                const move4 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 6,
                    currentFile: 'h',
                    destinationRank: 5,
                    destinationFile: 'h',
                };
                expect(game.state.board[move4.currentRank - 1][7]?.piece.pieceType).toEqual('P');
                expect(game.state.board[move4.currentRank - 1][7]?.piece.pieceColor).toEqual('B');
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move4,
                });
                expect(game.state.moves.length).toEqual(4);
                expect(game.state.board[move4.destinationRank - 1][7]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move4.destinationRank - 1][7]?.piece.pieceType).toEqual('P');
                const move5 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'Q', moved: true },
                    currentRank: 4,
                    currentFile: 'a',
                    destinationRank: 4,
                    destinationFile: 'h',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move5,
                });
                expect(game.state.moves.length).toEqual(5);
                expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceColor).toEqual('W');
                expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceType).toEqual('Q');
                expect(game.state.board[move5.destinationRank][7]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move5.destinationRank][7]?.piece.pieceType).toEqual('P');
                const move6 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'a',
                    destinationRank: 5,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move6,
                });
                const move7 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'Q', moved: true },
                    currentRank: 4,
                    currentFile: 'h',
                    destinationRank: 5,
                    destinationFile: 'h',
                };
                expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceColor).toEqual('B');
                expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceType).toEqual('P');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move7,
                });
                expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceType).toEqual('Q');
                expect(game.state.board[move7.destinationRank - 1][7]?.piece.pieceColor).toEqual('W');
            });
        });
        describe('Given an Invalid Queen Move', () => {
            it('should return an error that the move is invalid', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'Q', moved: true },
                    currentRank: 1,
                    currentFile: 'd',
                    destinationRank: 2,
                    destinationFile: 'c',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                })).toThrow('Invalid Move');
            });
        });
        describe('Given a Valid Rook Moove', () => {
            it('should update the chess board and the moves with the move', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'P', moved: true },
                    currentRank: 2,
                    currentFile: 'a',
                    destinationRank: 4,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                });
                const move2 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'a',
                    destinationRank: 5,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move2,
                });
                const move3 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'R', moved: true },
                    currentRank: 1,
                    currentFile: 'a',
                    destinationRank: 3,
                    destinationFile: 'a',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move3,
                });
                expect(game.state.moves.length).toEqual(3);
                expect(game.state.board[move3.destinationRank][0]?.piece.pieceType).toEqual('P');
                expect(game.state.board[move3.destinationRank - 1][0]?.piece.pieceType).toEqual('R');
                const move4 = {
                    gamePiece: { pieceColor: 'B', pieceType: 'P', moved: true },
                    currentRank: 7,
                    currentFile: 'b',
                    destinationRank: 5,
                    destinationFile: 'b',
                };
                game.applyMove({
                    gameID: game.id,
                    playerID: player2.id,
                    move: move4,
                });
                const move5 = {
                    gamePiece: { pieceColor: 'W', pieceType: 'R', moved: true },
                    currentRank: 3,
                    currentFile: 'a',
                    destinationRank: 3,
                    destinationFile: 'h',
                };
                expect(game.state.board[move5.currentRank - 1][0]?.piece.pieceType).toEqual('R');
                game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: move5,
                });
                expect(game.state.board[move5.currentRank - 1][0]).toEqual(undefined);
                expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceType).toEqual('R');
                expect(game.state.board[move5.destinationRank - 1][7]?.piece.pieceColor).toEqual('W');
            });
        });
        describe('Given an Invalid Rook Move', () => {
            it('should return an error and not update the moves with the invalid move', () => {
                const move = {
                    gamePiece: { pieceColor: 'W', pieceType: 'R', moved: true },
                    currentRank: 1,
                    currentFile: 'a',
                    destinationRank: 3,
                    destinationFile: 'a',
                };
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move,
                })).toThrow('Invalid Move');
                expect(game.state.moves.length).toEqual(0);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlc3NHYW1lLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdG93bi9nYW1lcy9DaGVzc0dhbWUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJekQsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7SUFDekIsSUFBSSxJQUFlLENBQUM7SUFFcEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLElBQUksR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDckIsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtZQUMvRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM3QixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxT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