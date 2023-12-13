import React, { useState } from 'react';
import { Box, Button, Divider } from '@chakra-ui/react';

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

export default function GameReviewDetail(props: GameReviewDetailProps): JSX.Element {
  const { game, mainMenu, backToReviewList } = props;
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

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
        {/* Placeholder for Game Board */}
        <p>Game Board</p>
      </Box>

      <Box bg='white' p={4}>
        <p>Move History:</p>
        <ul>
          {game.moves.map((move, index) => (
            <li key={index} style={{ fontWeight: index === currentMoveIndex ? 'bold' : 'normal' }}>
              {move}
            </li>
          ))}
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
};
