/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from 'react';
import { ChessCell } from '../../../../types/CoveyTownSocket';
import { Box, Button, Container, chakra, Stack, Image } from '@chakra-ui/react';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';

/**
 * A component that will render a single cell in the Chess board, styled
 */
const StyledChessSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '40px',
    height: '40px',
  },
});
/**
 * A component that will render the Chess board, styled
 */
const StyledChessBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
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
  // set up component state and listerners so board and cells re-render when updated
  const [gameBoard, setBoard] = React.useState(gameAreaController.board);
  const [ourTurn, setOurTurn] = React.useState(gameAreaController.isOurTurn);
  useEffect(() => {
    function turnChangedEventHandler(turn: boolean) {
      setOurTurn(turn);
    }
    function boardChangedEventHandler(board: ChessCell[][]) {
      setBoard(board);
    }

    gameAreaController.addListener('turnChanged', turnChangedEventHandler);
    gameAreaController.addListener('boardChanged', boardChangedEventHandler);
    gameAreaController.addListener('drawOffered', boardChangedEventHandler);
    return function removedListeners() {
      gameAreaController.removeListener('turnChanged', turnChangedEventHandler);
      gameAreaController.removeListener('boardChanged', boardChangedEventHandler);
      gameAreaController.removeListener('drawOffered', boardChangedEventHandler);
    };
  }, [gameAreaController]);
  const townController = useTownController();
  let opponent: string;
  
  if (gameAreaController.status === 'IN_PROGRESS') {
    if (gameAreaController.white?.id === townController.ourPlayer.id) {
      opponent = gameAreaController.black?.userName;
    } else {
      opponent = gameAreaController.white?.userName;
    }
  }
  // const diaplayToast = useToast();
  return (
    <>
      <Container color='#134f5cff' background={`url('/assets/397848.jpg') no-repeat center/cover`}>
        <Box marginTop='5%' as='header' textAlign='center' mb={4} color='red'>
          <strong>
            <h1>You VS {opponent}</h1>
          </strong>
        </Box>
        <StyledChessBoard justifyContent='center'>
          {gameBoard.map((row, rowIndex) => {
            console.log(row);
            return (
              <Stack direction='row' margin='0' key={rowIndex}>
                {row.map((cell, colIndex) => {
                  const color = cell?.piece.pieceColor;
                  const type = cell?.piece.pieceType;
                  console.log(
                    `url('/assets/chessPieces/${color}_${type}.png') no-repeat center/cover`,
                  );

                  let squareColor: string;
                  if (rowIndex % 2 === 0) {
                    if (colIndex % 2 === 0) {
                      squareColor = 'white';
                    } else {
                      squareColor = 'green';
                    }
                  } else {
                    if (colIndex % 2 === 1) {
                      squareColor = 'white';
                    } else {
                      squareColor = 'green';
                    }
                  }
                  return (
                    <StyledChessSquare
                      background={`url('/assets/chessPieces/${color}_${type}.png') center/cover`}
                      onClick={async () => {}}
                      isDisabled={!ourTurn}
                      key={colIndex}
                      bgColor={squareColor}
                      opacity='0.9'
                      aria-label={`Cell ${rowIndex},${colIndex}`}></StyledChessSquare>
                  );
                })}
              </Stack>
            );
          })}
        </StyledChessBoard>
      </Container>
    </>
  );
}
