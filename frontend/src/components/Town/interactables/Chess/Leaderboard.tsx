/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { GameResult } from '../../../../types/CoveyTownSocket';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { fetchLeaderboard } from '../../../../services/gameService';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';

export type LeaderBoardProp = {
  results: GameResult[];
  mainMenu: () => void;
};
export type LeaderboardRow = {
  username: string;
  wins: number;
  losses: number;
  ties: number;
  rank?: number;
};
/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table.
 * Columns: Wins, Losses, Ties, Player (Name)
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 */

export default function Leaderboard(props: {
  gameAreaController: ChessAreaController;
  mainMenu: () => void;
}): JSX.Element {
  const gameAreaController = props.gameAreaController;
  const mainMenu = () => props.mainMenu();
  const [leaderboard, setLeaderBoard] = useState<LeaderboardRow[]>([]);
  const realTimeLeaderBoard = () => {
    fetchLeaderboard().then((updateLeaderboard: React.SetStateAction<LeaderboardRow[]>) => {
      setLeaderBoard(updateLeaderboard);
    });
  }
  useEffect(() => {
    const gameEndEventHandler = () => {
      realTimeLeaderBoard();
    };

    gameAreaController.addListener('gameEnd', gameEndEventHandler);
    gameAreaController.removeListener('gameUpdated', gameEndEventHandler);
    return function removedListeners() {
      gameAreaController.removeListener('gameEnd', gameEndEventHandler);
      gameAreaController.removeListener('gameUpdated', gameEndEventHandler);
    };
  }, [gameAreaController, props]);
  useEffect(() => {
    fetchLeaderboard().then((updateLeaderboard: React.SetStateAction<LeaderboardRow[]>) => {
      setLeaderBoard(updateLeaderboard);
    });
  }, []);
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
        <h2>Leader board</h2>
      </Box>
      <Box overflowY='scroll'>
      <Table width='200px' role='grid' bg='red' fontSize='sm'>
        <Thead>
          <Tr role='row'>
            <Th whiteSpace='nowrap' color='white' borderRight='1px solid black'>
              Rank
            </Th>
            <Th padding='1.1%'  color='white' borderRight='1px solid black'>
              Username
            </Th>
            <Th padding='1.1%' color='white' borderRight='1px solid black'>
              Wins
            </Th>
            <Th padding='1.1%' color='white' borderRight='1px solid black'>
              Ties
            </Th>
            <Th  color='white'>Losses</Th> {/* No right border for the last header cell */}
          </Tr>
        </Thead>
        <Tbody>
          {leaderboard.map(player => (
            <Tr role='row' key={player.username} bg='green'>
              <Td color='black' role='gridcell'>
                {player.rank}
              </Td>
              <Td color='black' role='gridcell'>
                {player.username}
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
      </Box>
      <Box textAlign='left' mt={4}>
        <Button bg='green' color='white' onClick={() => mainMenu()} variant='outline'>
          Home Screen
        </Button>
      </Box>
    </Box>
  );
}
