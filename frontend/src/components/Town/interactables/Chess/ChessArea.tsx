/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Tr,
} from '@chakra-ui/react';
import Leaderboard, { LeaderBoardProp } from './Leaderboard';
import GameReview from './GameReview';
import GameReviewDetail from './GameReviewDetal';
import useTownController from '../../../../hooks/useTownController';
import { GameResult, InteractableID } from '../../../../types/CoveyTownSocket';
import { generateDummyChessResults } from './DummyResults';
import { useInteractable } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';
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
    moves: ['e4 e5', 'Nf3 Nc6', 'Bb5 a6'],
  },
  game2: {
    date: '2023-04-02',
    opponent: 'Person1',
    result: 'Loss',
    moves: ['d4 d5', 'c4 c6', 'Nc3 dxc4'],
  },
  game3: {
    date: '2023-04-03',
    opponent: 'Person2',
    result: 'Tie',
    moves: ['e4 c5', 'Nf3 e6', 'd4 cxd4'],
  },
};

type GameDetail = {
  date: string;
  opponent: string;
  result: string;
  moves: string[];
};

const FAKE_GAMES = [
  {
    date: '2023-04-01',
    opponent: 'PlayerOne',
    result: 'Win',
    id: 'game1',
  },
  {
    date: '2023-04-02',
    opponent: 'PlayerTwo',
    result: 'Loss',
    id: 'game2',
  },
  {
    date: '2023-04-03',
    opponent: 'PlayerThree',
    result: 'Tie',
    id: 'game3',
  },
];

function ChessArea(): JSX.Element {
  const [chessResults, setChessResults] = useState<GameResult[]>(generateDummyChessResults());
  const [currentPage, setCurrentPage] = useState('mainMenu');
  const townController = useTownController();
  const [selectedGame, setSelectedGame] = useState<GameDetail | null>(null);

  useEffect(() => {
    // Fetch chess game results (for now, using dummy data)
    const results = generateDummyChessResults();
    setChessResults(results);
  }, []);
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  const handleSelectGame = (gameId: string) => {
    const selectedHistory = fakeGameHistories[gameId];
    setSelectedGame(selectedHistory);
    navigateTo('gameReviewDetail');
  };
  let content;
  switch (currentPage) {
    case 'mainMenu':
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

          <Button
            style={{ marginLeft: '50%', marginTop: '10%' }}
            bg='green'
            color='white'
            onClick={() => navigateTo('leaderboard')}
            variant='outline'>
            LeaderBoard
          </Button>

          <Button
            style={{ marginLeft: '50%', marginTop: '10%' }}
            bg='green'
            color='white'
            onClick={() => navigateTo('gamereview')}
            variant='outline'>
            Game Review
          </Button>
        </Box>
      );
    case 'leaderboard':
      content = <Leaderboard results={chessResults} mainMenu={() => navigateTo('mainMenu')} />;
      break;
    case 'gamereview':
      content = (
        <GameReview
          games={FAKE_GAMES}
          selectGame={handleSelectGame}
          mainMenu={() => navigateTo('mainMenu')}
        />
      );
      break;
    case 'gameReviewDetail':
      content = selectedGame ? (
        <GameReviewDetail
          game={selectedGame}
          nextMove={() => {}}
          prevMove={() => {}}
          mainMenu={() => navigateTo('mainMenu')}
          backToReviewList={() => navigateTo('gamereview')}
        />
      ) : (
        <p>No game selected</p>
      );
      break;
  }
  return <>{content}</>;
}

/**
 * A wrapper component for the ChessArea component.
 * Determines if the player is currently in a chess area on the map, and if so,
 * renders the ChessArea component in a modal.
 *
 */
export default function ChessAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      //TODO: uncomment and attach controller later
      /*const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
      */
    }
  }, [townController, gameArea]);

  if (gameArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <ChessArea interactableID={gameArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
