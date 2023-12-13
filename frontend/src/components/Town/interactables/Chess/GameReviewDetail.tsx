import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Divider, chakra } from '@chakra-ui/react';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import {
  ChessCell,
  ChessFilePosition,
  ChessPiece,
  ChessRankPosition,
} from '../../../../types/CoveyTownSocket';

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

export type GameReviewDetailProps = {
  game: {
    date: string;
    opponent: string;
    result: string;
    moves: string[]; // Array of moves in standard notation
  };
  nextMove: () => void;
  prevMove: () => void;
  mainMenu: () => void;
  backToReviewList: () => void;
};
const initializeBoard = () => {
  const board: ChessCell[][] = Array(8)
    .fill(undefined)
    .map(() => Array(8).fill(undefined));
  const fileToIndex = (file: ChessFilePosition): number => file.charCodeAt(0) - 'a'.charCodeAt(0);
  const rankToIndex = (rank: ChessRankPosition): number => 8 - rank;
  // Initialize board with pieces in initial positions
  const initialPositions: { [key: string]: ChessPiece } = {
    a1: { pieceType: 'R', pieceColor: 'W', moved: false },
    b1: { pieceType: 'N', pieceColor: 'W', moved: false },
    c1: { pieceType: 'B', pieceColor: 'W', moved: false },
    d1: { pieceType: 'Q', pieceColor: 'W', moved: false },
    e1: { pieceType: 'K', pieceColor: 'W', moved: false },
    f1: { pieceType: 'B', pieceColor: 'W', moved: false },
    g1: { pieceType: 'N', pieceColor: 'W', moved: false },
    h1: { pieceType: 'R', pieceColor: 'W', moved: false },
    a2: { pieceType: 'P', pieceColor: 'W', moved: false },
    b2: { pieceType: 'P', pieceColor: 'W', moved: false },
    c2: { pieceType: 'P', pieceColor: 'W', moved: false },
    d2: { pieceType: 'P', pieceColor: 'W', moved: false },
    e2: { pieceType: 'P', pieceColor: 'W', moved: false },
    f2: { pieceType: 'P', pieceColor: 'W', moved: false },
    g2: { pieceType: 'P', pieceColor: 'W', moved: false },
    h2: { pieceType: 'P', pieceColor: 'W', moved: false },
    a7: { pieceType: 'P', pieceColor: 'B', moved: false },
    b7: { pieceType: 'P', pieceColor: 'B', moved: false },
    c7: { pieceType: 'P', pieceColor: 'B', moved: false },
    d7: { pieceType: 'P', pieceColor: 'B', moved: false },
    e7: { pieceType: 'P', pieceColor: 'B', moved: false },
    f7: { pieceType: 'P', pieceColor: 'B', moved: false },
    g7: { pieceType: 'P', pieceColor: 'B', moved: false },
    h7: { pieceType: 'P', pieceColor: 'B', moved: false },
    a8: { pieceType: 'R', pieceColor: 'B', moved: false },
    b8: { pieceType: 'N', pieceColor: 'B', moved: false },
    c8: { pieceType: 'B', pieceColor: 'B', moved: false },
    d8: { pieceType: 'Q', pieceColor: 'B', moved: false },
    e8: { pieceType: 'K', pieceColor: 'B', moved: false },
    f8: { pieceType: 'B', pieceColor: 'B', moved: false },
    g8: { pieceType: 'N', pieceColor: 'B', moved: false },
    h8: { pieceType: 'R', pieceColor: 'B', moved: false },
  };
  Object.entries(initialPositions).forEach(([key, piece]) => {
    const file = key[0] as ChessFilePosition;
    const rank = parseInt(key[1], 10) as ChessRankPosition;
    if (piece) {
      const cell: ChessCell = {
        piece,
      };
      board[rankToIndex(rank)][fileToIndex(file)] = cell;
    }
  });
  return board;
};
const applyMoveToBoard = (board: ChessCell[][], move: string) => {
  const fileToIndex = (file: string) => file.charCodeAt(0) - 'a'.charCodeAt(0);
  const rankToIndex = (rank: string) => 8 - parseInt(rank, 10);

  const [source, destination] = move.split(',');

  const sourceFileIndex = fileToIndex(source[0]);
  const sourceRankIndex = rankToIndex(source[1]);
  const destinationFileIndex = fileToIndex(destination[0]);
  const destinationRankIndex = rankToIndex(destination[1]);

  const movingPiece = board[sourceRankIndex][sourceFileIndex]?.piece;

  if (movingPiece) {
    // Move the piece to the new position
    board[destinationRankIndex][destinationFileIndex] = { piece: movingPiece };
    // Remove the piece from the start position
    board[sourceRankIndex][sourceFileIndex] = undefined;
  } else {
    console.error('No piece found at the source square', source);
  }

  return board;
};

export default function GameReviewDetail(props: GameReviewDetailProps): JSX.Element {
  const { game, mainMenu, backToReviewList } = props;
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [board, setBoard] = useState(initializeBoard());

  useEffect(() => {
    // Reset the board to the initial state
    const newBoard = initializeBoard();
    // Apply each move up to currentMoveIndex
    for (let i = 0; i <= currentMoveIndex; i++) {
      applyMoveToBoard(newBoard, game.moves[i]);
    }
    setBoard(newBoard);
  }, [currentMoveIndex, game.moves]);

  const nextMove = () => {
    if (currentMoveIndex < game.moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const prevMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  return (
    <Box
      width='100%'
      maxWidth='100%'
      overflowY='auto'
      background={`url('/assets/chessboard-pattern.jpg') no-repeat center/cover`}
      p={4}
      color='black'
      minHeight='600px'>
      <Box as='header' textAlign='center' mb={4} bg='orange'>
        <h2>Review Game</h2>
        <p>{`Date: ${game.date} | Opponent: ${game.opponent} | Result: ${game.result}`}</p>
      </Box>

      <Box bg='white' p={4} mb={4}>
        <StyledChessBoard justifyContent='center'>
          {board.map((row: any[], rowIndex: any) => (
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
        <p>Game Board</p>
      </Box>
      <Box bg='white' p={4}>
        <p>Move History:</p>
        <ul>
          {currentMoveIndex === 0 ? (
            <li>Previous: None</li>
          ) : (
            <li>Previous: {game.moves[currentMoveIndex - 1]}</li>
          )}
          <li style={{ fontWeight: 'bold' }}>Current: {game.moves[currentMoveIndex]}</li>
          {currentMoveIndex < game.moves.length - 1 && (
            <li>Next: {game.moves[currentMoveIndex + 1]}</li>
          )}
        </ul>
      </Box>

      <Box display='flex' mt={4} justifyContent='space-between'>
        <Button onClick={prevMove}>Previous Move</Button>
        <Button onClick={nextMove}>Next Move</Button>
      </Box>

      <Divider my={4} />

      <Box display='flex' justifyContent='space-between'>
        <Button onClick={backToReviewList}>Back to List</Button>
        <Button onClick={mainMenu}>Home Screen</Button>
      </Box>
    </Box>
  );
}
