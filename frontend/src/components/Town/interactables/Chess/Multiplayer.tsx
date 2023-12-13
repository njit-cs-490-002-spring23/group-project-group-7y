/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from 'react';
import { ChessCell } from '../../../../types/CoveyTownSocket';
import { Box, Button, Container, chakra, Stack } from '@chakra-ui/react';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';

/**
 * A component that will render a single cell in the Chess board, styled
 */
const StyledChessSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '33%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
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
    return function removedListeners() {
      gameAreaController.removeListener('turnChanged', turnChangedEventHandler);
      gameAreaController.removeListener('boardChanged', boardChangedEventHandler);
    };
  }, [gameAreaController]);
  const townController = useTownController();
  let opponent: string | undefined;
  if (gameAreaController.status === 'IN_PROGRESS') {
    if (gameAreaController.white?.id === townController.ourPlayer.id) {
      opponent = gameAreaController.black?.userName;
    } else {
      opponent = gameAreaController.white?.userName;
    }
  }
  if (gameAreaController.gamePiece == 'B') {
    setBoard(gameBoard.reverse());
  }
  // const diaplayToast = useToast();
  return (
    <>
      <Container color='#134f5cff'>
        <Box> You VS {opponent} </Box>
        <StyledChessBoard>
          {gameBoard.map((row, rowIndex) => {
            return (
              <Stack key={rowIndex}>
                {row.map((cell, colIndex) => {
                  return (
                    <StyledChessSquare
                      onClick={async () => {}}
                      isDisabled={!ourTurn}
                      key={colIndex}
                      aria-label={`Cell ${rowIndex},${colIndex}`}>
                      {cell}
                    </StyledChessSquare>
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
