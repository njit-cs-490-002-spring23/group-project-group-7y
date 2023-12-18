import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, Button, Text } from '@chakra-ui/react';
import GameReviewDetail from './GameReviewDetail';

import { GameData } from '../../../../types/CoveyTownSocket';
import { fetchAllGames } from '../../../../services/gameService';

export type GameReviewProps = {
  mainMenu: () => void;
};

export default function GameReview(props: GameReviewProps): JSX.Element {
  const [gameHistories, setGameHistories] = useState<GameData[]>([]);
  const [currentView, setCurrentView] = useState('gameList');
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);

  useEffect(() => {
    // Fetch game data whenever the component is rendered
    const fetchGames = async () => {
      try {
        const fetchedGames = await fetchAllGames();
        setGameHistories(fetchedGames);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };

    fetchGames();
  }, []);
  const selectGame = (gameId: string) => {
    const foundGame = gameHistories.find(game => game.gameId === gameId);
    setSelectedGame(foundGame || null);
    setCurrentView('gameReviewDetail');
  };

  const backToReviewList = () => {
    setCurrentView('gameList');
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
      {currentView === 'gameList' && (
        <>
          <Box as='header' textAlign='center' mb={4} bg='orange'>
            <h2>Game Review</h2>
          </Box>
          <List spacing={3}>
            {gameHistories.map(game => (
              <ListItem
                key={game.gameId}
                p={1}
                bg='green'
                color='black'
                mb={1}
                _hover={{ bg: 'green.600' }}
                cursor='pointer'>
                <Button
                  bg='green'
                  w='100%'
                  justifyContent='flex-start'
                  fontSize='sm'
                  onClick={() => selectGame(game.gameId)}>
                  <Box w='100%' display='flex' flexDirection='column'>
                    <Text>Date: {game.date}</Text>
                    <Text>
                      Player1: {game.playerOne} | Player2: {game.playerTwo}
                    </Text>
                    <Text>Result: {game.result}</Text>
                  </Box>
                </Button>
              </ListItem>
            ))}
          </List>

          <Button bg='green' color='white' onClick={props.mainMenu} mt={4}>
            Home Screen
          </Button>
        </>
      )}

      {currentView === 'gameReviewDetail' && selectedGame && (
        <GameReviewDetail
          game={selectedGame}
          nextMove={() => {}}
          prevMove={() => {}}
          mainMenu={props.mainMenu}
          backToReviewList={backToReviewList}
        />
      )}
    </Box>
  );
}
