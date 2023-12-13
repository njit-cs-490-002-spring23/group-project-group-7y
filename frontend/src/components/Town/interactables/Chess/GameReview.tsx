import React, { useState } from 'react';
import { Box, List, ListItem, Button } from '@chakra-ui/react';
import GameReviewDetail from './GameReviewDetail';

export type GameReviewProps = {
  games: Array<{
    date: string;
    opponent: string;
    result: string;
    id: string;
  }>;
  mainMenu: () => void;
};

type GameHistories = {
  [key: string]: {
    date: string;
    opponent: string;
    result: string;
    moves: string[];
  };
};

const fakeGameHistories: GameHistories = {
  game1: {
    date: '2023-04-01',
    opponent: 'Person',
    result: 'Win',
    moves: [
      'e2,e4',
      'e7,e5',
      'g1,f3',
      'b8,c6',
      'f1,b5',
      'a7,a6',
      'b5,a4',
      'g8,f6',
      'e1,g1',
      'f8,c5',
      'f3,e5',
      'c6,e5',
      'd2,d4',
      'e5,c4',
      'd4,c5',
      'c4,e5',
    ],
  },
  game2: {
    date: '2023-04-01',
    opponent: 'Person2',
    result: 'Loss',
    moves: [
      'd2,d4',
      'd7,d5',
      'c2,c4',
      'c7,c6',
      'b1,c3',
      'e7,e6',
      'g1,f3',
      'f8,d6',
      'e2,e3',
      'g8,f6',
      'f1,d3',
      'e8,g8',
    ],
  },
  game3: {
    date: '2023-04-01',
    opponent: 'Person3',
    result: 'Tie',
    moves: [
      'e2,e4',
      'e7,e5',
      'g1,f3',
      'b8,c6',
      'f1,c4',
      'g8,f6',
      'd2,d3',
      'f8,c5',
      'c2,c3',
      'd7,d6',
      'b2,b4',
      'c5,b6',
    ],
  },
};

type GameDetail = {
  date: string;
  opponent: string;
  result: string;
  moves: string[];
};
export default function GameReview(props: GameReviewProps): JSX.Element {
  const [currentView, setCurrentView] = useState('gameList');
  const [selectedGame, setSelectedGame] = useState<GameDetail | null>(null);

  const selectGame = (gameId: string) => {
    const selectedHistory = fakeGameHistories[gameId];
    setSelectedGame(selectedHistory);
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
            {props.games.map(game => (
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
                  onClick={() => selectGame(game.id)}>
                  Date: {game.date} | Opponent: {game.opponent} | Result: {game.result}
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
};
