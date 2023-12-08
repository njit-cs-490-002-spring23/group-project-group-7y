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
import useTownController from '../../../../hooks/useTownController';
import { GameResult, InteractableID } from '../../../../types/CoveyTownSocket';
import { generateDummyChessResults } from './DummyResults';
import { useInteractable } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';

function ChessArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const [chessResults, setChessResults] = useState<GameResult[]>(generateDummyChessResults());
  const [currentPage, setcurrentPage] = useState('mainMenu');
  const townController = useTownController();

  const mainMenuPage = () => {
    setcurrentPage('mainMenu');
  };
  const leaderboardPage = () => {
    setcurrentPage('leaderboard');
  };
  useEffect(() => {
    // Fetch chess game results (for now, using dummy data)
    const results = generateDummyChessResults();
    setChessResults(results);
  }, []);

  // Modal to display the leaderboard
  if (currentPage === 'mainMenu') {
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
          onClick={() => leaderboardPage()}
          variant='outline'>
          Leaderbaord
        </Button>
      </Box>
    );
  } else {
    return (
      <>
        <Leaderboard results={chessResults} mainMenu={mainMenuPage} />
      </>
    );
  }
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
