import React from 'react';
import { Box, List, ListItem, Button } from '@chakra-ui/react';

export type GameReviewProps = {
  games: Array<{
    date: string;
    opponent: string;
    result: string;
    id: string;
  }>;
  selectGame: (gameId: string) => void;
  mainMenu: () => void;
};

export default function GameReview(props: GameReviewProps): JSX.Element {
  const { games, selectGame, mainMenu } = props;

  const handleGameSelection = (gameId: string) => {
    selectGame(gameId);
  };
  return (
    <Box
      width='100%'
      maxWidth='100%'
      overflowY='auto'
      background={`url('/assets/397848.jpg') no-repeat center/cover`}
      p={4}
      color='black'
      minHeight='400px'>
      <Box as='header' textAlign='center' mb={4} bg='orange'>
        <h2>Game Review</h2>
      </Box>
      <List spacing={3}>
        {games.map(game => (
          <ListItem
            key={game.id}
            p={2}
            bg='green'
            color='black'
            mb={2}
            _hover={{ bg: 'green.600' }}
            cursor='pointer'>
            <Button
              bg='green'
              w='100%'
              justifyContent='flex-start'
              onClick={() => handleGameSelection(game.id)}>
              Date: {game.date} | Opponent: {game.opponent} | Result: {game.result}
            </Button>
          </ListItem>
        ))}
      </List>
      <Button bg='green' color='white' onClick={mainMenu} mt={4}>
        Home Screen
      </Button>
    </Box>
  );
}
