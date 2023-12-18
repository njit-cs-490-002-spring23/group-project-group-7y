import React from 'react';
import { GameResult } from '../../../../types/CoveyTownSocket';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

export type LeaderBoardProp = {
  results: GameResult[];
  mainMenu: () => void;
};
/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table.
 * Columns: Wins, Losses, Ties, Player (Name)
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 */

export default function Leaderboard(props: {
  results: GameResult[];
  mainMenu: () => void;
}): JSX.Element {
  const results = props.results;
  const mainMenu = () => props.mainMenu();
  // Create a map to store aggregated results for each player
  const playerStats: {
    [playerName: string]: { wins: number; losses: number; ties: number; rank?: number };
  } = {};

  // TODO: This may need to change to accompany different format
  results.forEach(result => {
    const scoresArray = Object.values(result.scores);
    const totalScore = scoresArray.reduce((acc, curr) => acc + curr, 0);

    for (const [playerName, score] of Object.entries(result.scores)) {
      if (!playerStats[playerName]) {
        playerStats[playerName] = { wins: 0, losses: 0, ties: 0 };
      }

      if (totalScore === 1) {
        if (score === 1) {
          playerStats[playerName].wins += 1;
        } else {
          playerStats[playerName].losses += 1;
        }
      } else {
        playerStats[playerName].ties += 1;
      }
    }
  });

  let sortedPlayers = Object.entries(playerStats)
    .map(([playerName, stats]) => ({ playerName, ...stats }))
    .sort((a, b) => b.wins - a.wins);

  let currentRank = 1;
  let playersProcessed = 0;
  let prevWins = sortedPlayers[0]?.wins || 0;

  sortedPlayers = sortedPlayers.map(player => {
    if (player.wins < prevWins) {
      currentRank += playersProcessed;
      playersProcessed = 1;
    } else {
      playersProcessed++;
    }
    prevWins = player.wins;
    return { ...player, rank: currentRank };
  });

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
        <h2>Leaderboard</h2>
      </Box>
      <Table role='grid' bg='red'>
        <Thead>
          <Tr role='row'>
            <Th color='white' borderRight='1px solid black'>
              Rank
            </Th>
            <Th color='white' borderRight='1px solid black'>
              Username
            </Th>
            <Th color='white' borderRight='1px solid black'>
              Wins
            </Th>
            <Th color='white' borderRight='1px solid black'>
              Ties
            </Th>
            <Th color='white'>Losses</Th> {/* No right border for the last header cell */}
          </Tr>
        </Thead>
        <Tbody>
          {sortedPlayers.map(player => (
            <Tr role='row' key={player.playerName} bg='green'>
              <Td color='black' role='gridcell'>
                {player.rank}
              </Td>
              <Td color='black' role='gridcell'>
                {player.playerName}
              </Td>
              <Td color='black' role='gridcell'>
                {player.wins}
              </Td>
              <Td color='black' role='gridcell'>
                {player.ties}
              </Td>
              <Td color='black' role='gridcell'>
                {player.losses}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box textAlign='left' mt={4}>
        <Button bg='green' color='white' onClick={() => mainMenu()} variant='outline'>
          Home Screen
        </Button>
      </Box>
    </Box>
  );
}
