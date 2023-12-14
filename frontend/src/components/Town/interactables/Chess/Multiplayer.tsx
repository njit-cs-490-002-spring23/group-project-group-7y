/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from 'react';
import { ChessCell } from '../../../../types/CoveyTownSocket';
import { Box, Container, chakra } from '@chakra-ui/react';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import useTownController from '../../../../hooks/useTownController';

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
const StyledChessBoard = chakra(Container, {
  baseStyle: {
    bg: 'transparent',
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
  let opponent: string | undefined;

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
          {gameBoard.map((row, rowIndex) => (
            <StyledChessRow key={rowIndex} id={`${rowIndex}`}>
              {row.map((cell, colIndex) => {
                const color = cell?.piece.pieceColor;
                const type = cell?.piece.pieceType;
                const squareColor = (rowIndex + colIndex) % 2 === 0 ? '#e8edcf' : '#7c995b';
                return (
                  <StyledChessSquare
                    id={`${rowIndex},${colIndex}`}
                    background={`url('/assets/chessPieces/${color}_${type}.png') center/cover`}
                    onClick={async () => {}}
                    isDisabled={false}
                    key={colIndex}
                    bgColor={squareColor}
                    opacity='1'
                    aria-label={`Cell ${rowIndex},${colIndex}`}></StyledChessSquare>
                );
              })}
            </StyledChessRow>
          ))}
        </StyledChessBoard>
      </Container>
    </>
  );
}
