/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader } from '@chakra-ui/react';
import Leaderboard from './Leaderboard';
import useTownController from '../../../../hooks/useTownController';
import { GameResult, InteractableID } from '../../../../types/CoveyTownSocket';
import { generateDummyChessResults } from './DummyResults';
import { useInteractable } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';

function ChessArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const [chessResults, setChessResults] = useState<GameResult[]>(generateDummyChessResults());
  const townController = useTownController();

  useEffect(() => {
    // Fetch chess game results (for now, using dummy data)
    const results = generateDummyChessResults();
    setChessResults(results);
  }, []);

  // Modal to display the leaderboard
  return (
    <>
      <Leaderboard results={chessResults} />
    </>
  );
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
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <ChessArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
