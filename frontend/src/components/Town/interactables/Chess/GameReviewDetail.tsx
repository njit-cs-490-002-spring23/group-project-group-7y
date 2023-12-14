import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Divider, chakra, Text } from '@chakra-ui/react';
import {
  ChessCell,
  ChessFilePosition,
  ChessPiece,
  ChessRankPosition,
  GameData,
} from '../../../../types/CoveyTownSocket';

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
    bg: 'transparent',
    display: 'flex',
    width: '350px',
    height: '350px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

export type GameReviewDetailProps = {
  game: GameData;
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

const pieceTypeFromFENChar: { [key: string]: ChessPiece['pieceType'] } = {
  K: 'K',
  Q: 'Q',
  R: 'R',
  B: 'B',
  N: 'N',
  P: 'P',
  k: 'K',
  q: 'Q',
  r: 'R',
  b: 'B',
  n: 'N',
  p: 'P',
};

const parseFEN = (fen: string) => {
  const [position, turn, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(' ');
  const rows = position.split('/');
  const board: ChessCell[][] = rows.map(row => {
    const rowPieces: ChessCell[] = [];
    for (const char of row) {
      if (isNaN(parseInt(char))) {
        const pieceColor = char === char.toUpperCase() ? 'W' : 'B';
        const pieceType = pieceTypeFromFENChar[char];
        rowPieces.push({ piece: { pieceType, pieceColor, moved: false } });
      } else {
        rowPieces.push(...Array(parseInt(char)).fill(undefined));
      }
    }
    return rowPieces;
  });

  return {
    board,
    turn,
    castling,
    enPassant,
    halfMoveClock: parseInt(halfMoveClock),
    fullMoveNumber: parseInt(fullMoveNumber),
  };
};

const applyFENToBoard = (fen: string) => {
  const { board, turn, castling, enPassant, halfMoveClock, fullMoveNumber } = parseFEN(fen);

  return { board, turn, castling, enPassant, halfMoveClock, fullMoveNumber };
};

export default function GameReviewDetail(props: GameReviewDetailProps): JSX.Element {
  const { game, mainMenu, backToReviewList } = props;
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // Parse the moves once and store in a state
  const [parsedMoves, setParsedMoves] = useState<string[]>([]);

  useEffect(() => {
    // Check if game.moves is a valid JSON string
    if (game.moves && typeof game.moves === 'string') {
      try {
        const movesArray = JSON.parse(game.moves);
        setParsedMoves(movesArray);
      } catch (error) {
        console.error('Error parsing game moves:', error);
      }
    }
  }, [game.moves]);

  const [gameState, setGameState] = useState({
    board: initializeBoard(),
    turn: 'w',
    castling: 'KQkq',
    enPassant: '-',
    halfMoveClock: 0,
    fullMoveNumber: 1,
  });

  useEffect(() => {
    if (parsedMoves[currentMoveIndex]) {
      const newState = applyFENToBoard(parsedMoves[currentMoveIndex]);
      setGameState(newState);
    }
  }, [currentMoveIndex, parsedMoves]);

  const nextMove = () => {
    if (currentMoveIndex < parsedMoves.length - 1) {
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
      <Box w='100%' bg='orange' p={4} borderBottom='1px solid black'>
        <Text fontSize='2xl' fontWeight='bold' textAlign='center' mb={2}>
          Review Game
        </Text>
        <Text fontSize='md'>Date: {game.date}</Text>
        <Text fontSize='md'>Player1: {game.playerOne}</Text>
        <Text fontSize='md'>Player2: {game.playerTwo}</Text>
      </Box>
      <Box bg='white' p={4} mb={4}>
        <StyledChessBoard justifyContent='center'>
          {gameState.board.map((row, rowIndex) => (
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

      <Box display='flex' mt={4} justifyContent='space-between' paddingBottom={'10px'}>
        <Button onClick={prevMove}>Previous Move</Button>
        <Button onClick={nextMove}>Next Move</Button>
      </Box>

      <Box bg='white' p={4}>
        <p>Move History:</p>
        <ul>
          {currentMoveIndex === 0 ? (
            <li>Previous: None</li>
          ) : (
            <li>Previous: {parsedMoves[currentMoveIndex - 1]}</li>
          )}
          <li style={{ fontWeight: 'bold' }}>Current: {parsedMoves[currentMoveIndex]}</li>
          {currentMoveIndex < parsedMoves.length - 1 && (
            <li>Next: {parsedMoves[currentMoveIndex + 1]}</li>
          )}
        </ul>
      </Box>

      <Divider my={4} />

      <Box display='flex' justifyContent='space-between'>
        <Button onClick={backToReviewList}>Back to List</Button>
        <Button onClick={mainMenu}>Home Screen</Button>
      </Box>
    </Box>
  );
}
