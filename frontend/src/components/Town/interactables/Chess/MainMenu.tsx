import React from 'react';
import { Box, Button } from '@chakra-ui/react';
/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table.
 * Columns: Wins, Losses, Ties, Player (Name)
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 */

export default function MainMenu(): JSX.Element {
  // Crea
  return (
    <Box
      width='100%'
      maxWidth='100%'
      overflowX='auto'
      background={`url('/assets/397848.jpg') no-repeat center/cover`}
      p={4}
      color='black'
      minHeight='400px'>
      <Box as='header' textAlign='center' mb={4} bg='orange'>
        <h2>Main Menu</h2>
      </Box>
      <Button style={{ marginLeft: 'auto' }} bg='green' color='white' variant='outline'>
        Leaderboard
      </Button>
      <Button style={{ marginLeft: 'auto' }} bg='green' color='white' variant='outline'>
        Game Review
      </Button>
    </Box>
  );
}
