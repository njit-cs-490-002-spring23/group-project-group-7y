/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { BoardLocation, ChessCell } from '../../../../types/CoveyTownSocket';
import { Box, Button, Container, chakra, ButtonGroup, useToast } from '@chakra-ui/react';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';
import { fetchLeaderboard } from '../../../../services/gameService';
import { LeaderboardRow } from './Leaderboard';

// eslint-disable-next-line @typescript-eslint/naming-convention
const StyledChessRow = chakra(Box, {
  baseStyle: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '12.5%',
  },
});

/**
 * A component that will render a single cell in the Chess board, styled
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const StyledChessSquare = chakra(Box, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '12.5%',
    height: '100%',
  },
});

/**
 * A component that will render the Chess board, styled
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const StyledChessBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '350px',
    height: '350px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that a multiplayer game board along with the game options (home page, resign, draw).
 */

export default function Multiplayer(props: {
  gameAreaController: ChessAreaController;
  mainMenu: () => void;
}): JSX.Element {
  const gameAreaController = props.gameAreaController;
  // use a state to keep track of number of modification to controller so components are re-rendered when listners pick up a emit
  const [controllerModifiedCounter, setControllerModifiedCounter] = useState(0);
  // set up component state and listerners so board and cells re-render when updated
  const [gameBoard, setBoard] = useState(gameAreaController.board);
  const [ourTurn, setOurTurn] = useState(gameAreaController.isOurTurn);
  const [drawOffered, setDrawOffered] = useState(false);
  const [, setDrawOfferSent] = useState(false);
  const [titleMessage, setTitleMessage] = useState<string>('Waiting For Second Player ...');
  const [possibleMovesCell, setPossibleMovesCell] = useState<{
    sourceRowIndex: number | undefined;
    sourceColIndex: number | undefined;
  }>({
    sourceRowIndex: undefined,
    sourceColIndex: undefined,
  });
  const [possibleMoves, setPossibeMoves] = useState<BoardLocation[]>([]);
  const [leaderboard, setLeaderBoard] = useState<LeaderboardRow[]>([]);
  const realTimeLeaderBoard = () => {
    fetchLeaderboard().then((updateLeaderboard: React.SetStateAction<LeaderboardRow[]>) => {
      setLeaderBoard(updateLeaderboard);
    });
  };
  const townController = useTownController();
  const displayToast = useToast();
  const updateTitle = () => {
    let opponent: string;
    if (gameAreaController.white && gameAreaController.black) {
      if (townController.ourPlayer.id === gameAreaController.white.id) {
        opponent = gameAreaController.black.userName;
      } else {
        opponent = gameAreaController.white.userName;
      }
      if (leaderboard) {
        const ourRank = leaderboard.find(row => {
          return townController.ourPlayer.userName === row.username;
        });
        const opponentRank = leaderboard.find(row => {
          return opponent === row.username;
        });
        if (ourRank && opponentRank) {
          setTitleMessage(`You (${ourRank?.rank}) v. ${opponent} (${opponentRank?.rank})`);
        } else if (ourRank && !opponentRank) {
          setTitleMessage(`You (${ourRank?.rank}) v. ${opponent}`);
        } else if (!ourRank && opponentRank) {
          setTitleMessage(`You v. ${opponent} (${opponentRank?.rank})`);
        } else {
          setTitleMessage(`You v. ${opponent}`);
        }
      } else setTitleMessage(`You v. ${opponent}`);
    }
  };
  const updateDrawButtons = () => {
    if (gameAreaController.drawOfferer()) {
      if (gameAreaController.drawOfferer() != townController.ourPlayer.id) {
        setDrawOffered(true);
      } else if (gameAreaController.drawOfferer() === townController.ourPlayer.id) {
        setDrawOfferSent(true);
      } else if (gameAreaController.drawOfferer() === undefined) {
        setDrawOfferSent(false);
      } else if (gameAreaController.drawOfferer() !== townController.ourPlayer.id) {
        setDrawOfferSent(false);
      }
    }
  };
  useEffect(() => {
    fetchLeaderboard().then((updateLeaderboard: React.SetStateAction<LeaderboardRow[]>) => {
      setLeaderBoard(updateLeaderboard);
    });
    function turnChangedEventHandler(turn: boolean) {
      realTimeLeaderBoard();
      setOurTurn(turn);
    }
    function boardChangedEventHandler(board: ChessCell[][]) {
      setBoard(board);
    }
    function drawOfferedEventHandler() {
      setControllerModifiedCounter(controllerModifiedCounter + 1);
      updateDrawButtons();
    }
    const gameEndEventHandler = () => {
      let gameOverMessage: string;
      const winner = gameAreaController.winner;
      if (winner) {
        if (winner.id == townController.ourPlayer.id) gameOverMessage = 'You won!';
        else gameOverMessage = 'You lost :(';
      } else gameOverMessage = 'Game Drawed';
      displayToast({
        title: 'Game Over',
        description: gameOverMessage,
      });
      setControllerModifiedCounter(controllerModifiedCounter + 1);
      props.mainMenu();
    };
    const gameUpdatedEventHandler = () => {
      setControllerModifiedCounter(controllerModifiedCounter + 1);
      updateTitle();
      updateDrawButtons();
    };
    const fullGameEventHandler = () => {
      updateTitle();
    };
    gameAreaController.addListener('gameEnd', gameEndEventHandler);
    gameAreaController.addListener('gameUpdated', gameUpdatedEventHandler);
    gameAreaController.addListener('turnChanged', turnChangedEventHandler);
    gameAreaController.addListener('boardChanged', boardChangedEventHandler);
    gameAreaController.addListener('drawOffered', drawOfferedEventHandler);
    gameAreaController.addListener('fullGame', fullGameEventHandler);
    gameAreaController.addListener('drawOffered', drawOfferedEventHandler);
    return function removedListeners() {
      gameAreaController.removeListener('turnChanged', turnChangedEventHandler);
      gameAreaController.removeListener('boardChanged', boardChangedEventHandler);
      gameAreaController.removeListener('drawOffered', drawOfferedEventHandler);
      gameAreaController.removeListener('gameEnd', gameEndEventHandler);
      gameAreaController.removeListener('gameUpdated', gameUpdatedEventHandler);
      gameAreaController.removeListener('fullGame', fullGameEventHandler);
      gameAreaController.removeListener('drawOffered', drawOfferedEventHandler);
    };
  }, [
    controllerModifiedCounter,
    displayToast,
    gameAreaController,
    props,
    titleMessage,
    townController.ourPlayer.id,
    updateDrawButtons,
    updateTitle,
  ]);

  return (
    <>
      <Container color='#134f5cff' background={`url('/assets/397848.jpg') no-repeat center/cover`}>
        <Box marginTop='5%' as='header' textAlign='center' mb={4} color='red'>
          <strong>
            <h1>{titleMessage}</h1>{' '}
          </strong>
        </Box>{' '}
        <Box marginTop='5%' as='header' textAlign='center' mb={4} color='red'>
          {gameAreaController.isOurTurn && gameAreaController.status === 'IN_PROGRESS' ? (
            <h1> Your Turn! </h1>
          ) : gameAreaController.status === 'IN_PROGRESS' ? (
            <h1> Opponent Turn! </h1>
          ) : (
            <></>
          )}
        </Box>
        <StyledChessBoard justifyContent='center'>
          {gameBoard.map((row, rowIndex) => (
            <StyledChessRow key={rowIndex} id={`${rowIndex}`}>
              {row.map((cell, colIndex) => {
                const color = cell?.piece.pieceColor;
                const type = cell?.piece.pieceType;
                const squareColor = (rowIndex + colIndex) % 2 === 0 ? '#e8edcf' : '#7c995b';
                return (
                  <StyledChessSquare
                    id={`${rowIndex},${colIndex}`}
                    display='flex'
                    background={`url('/assets/chessPieces/${color}_${type}.png') center/contain no-repeat`}
                    onClick={async () => {
                      if (ourTurn) {
                        if (
                          possibleMovesCell.sourceColIndex !== undefined &&
                          possibleMovesCell.sourceRowIndex !== undefined &&
                          possibleMoves.find(
                            move => move.rowIndex === rowIndex && move.colIndex === colIndex,
                          )
                        ) {
                          try {
                            await gameAreaController.makeMove(
                              possibleMovesCell.sourceRowIndex,
                              possibleMovesCell.sourceColIndex,
                              rowIndex,
                              colIndex,
                            );
                          } catch (e) {
                            displayToast({
                              title: 'Move Error',
                              description: `Error: ${(e as Error).message}`,
                              status: 'error',
                            });
                          }
                          setPossibleMovesCell({
                            sourceRowIndex: undefined,
                            sourceColIndex: undefined,
                          });
                          setPossibeMoves([]);
                        } else if (
                          possibleMovesCell.sourceColIndex &&
                          possibleMovesCell.sourceRowIndex &&
                          possibleMovesCell.sourceColIndex === colIndex &&
                          possibleMovesCell.sourceRowIndex === rowIndex
                        ) {
                          setPossibleMovesCell({
                            sourceRowIndex: undefined,
                            sourceColIndex: undefined,
                          });
                          setPossibeMoves([]);
                        } else if (
                          ((possibleMovesCell.sourceColIndex === undefined &&
                            possibleMovesCell.sourceRowIndex === undefined) ||
                            !possibleMoves.find(
                              move => move.rowIndex === rowIndex && move.colIndex === colIndex,
                            )) &&
                          cell !== undefined &&
                          cell.piece.pieceColor === gameAreaController.gamePiece
                        ) {
                          await gameAreaController
                            .possibleMoves(rowIndex, colIndex)
                            .then(moves => {
                              setPossibeMoves(moves);
                            })
                            .then(() =>
                              setPossibleMovesCell({
                                sourceRowIndex: rowIndex,
                                sourceColIndex: colIndex,
                              }),
                            )
                            .catch(e => {
                              setPossibleMovesCell({
                                sourceRowIndex: undefined,
                                sourceColIndex: undefined,
                              });
                              displayToast({
                                title: 'Possible Moves Failed',
                                description: `Error: ${(e as Error).message}`,
                                status: 'error',
                              });
                            });
                        }
                      }
                    }}
                    isDisabled={!ourTurn}
                    key={colIndex}
                    bgColor={squareColor}
                    opacity='1'
                    aria-label={`Cell ${rowIndex},${colIndex}`}>
                    {possibleMoves.find(
                      move => move.rowIndex === rowIndex && move.colIndex === colIndex,
                    ) ? (
                      <Box
                        boxSize='10px'
                        display='flex'
                        background={`url('/assets/chessPieces/moveDot.png') center/cover`}>
                        {' '}
                      </Box>
                    ) : (
                      <></>
                    )}
                  </StyledChessSquare>
                );
              })}
            </StyledChessRow>
          ))}
        </StyledChessBoard>
        <ButtonGroup display='flex' mt={4} justifyContent='space-between' paddingBottom={'10px'}>
          <Button
            bg='green'
            color='white'
            onClick={() => {
              gameAreaController.leaveGame();
              if (!gameAreaController.black) {
                props.mainMenu();
              }
            }}
            variant='outline'>
            Home Screen
          </Button>
          <Button
            bg='green'
            color='red'
            onClick={() => {
              gameAreaController.leaveGame();
              if (!gameAreaController.black) {
                props.mainMenu();
              }
            }}
            variant='outline'>
            Resign
          </Button>
          <Button
            bg='blue'
            color='white'
            disabled={gameAreaController.drawOfferer() !== undefined}
            onClick={async () => {
              await gameAreaController.drawCommand('offer');
              setDrawOfferSent(true);
            }}
            variant='outline'>
            Offer Draw
          </Button>
          <Button
            bg='blue'
            color='white'
            disabled={!drawOffered}
            onClick={async () => {
              await gameAreaController.drawCommand('accept');
            }}
            variant='outline'>
            Accept Draw
          </Button>
          <Button
            bg='blue'
            color='white'
            disabled={!drawOffered}
            onClick={async () => {
              await gameAreaController.drawCommand('reject');
              setDrawOfferSent(false);
              setDrawOffered(false);
            }}
            variant='outline'>
            Reject Draw
          </Button>
        </ButtonGroup>
      </Container>
    </>
  );
}
