import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader } from '@chakra-ui/react';
import Leaderboard from './Leaderboard';
import useTownController from '../../../../hooks/useTownController';
import { GameResult } from '../../../../types/CoveyTownSocket';
import { generateDummyChessResults } from './DummyResults';

function ChessArea(): JSX.Element {
  const [chessResults, setChessResults] = useState<GameResult[]>(generateDummyChessResults());
  const townController = useTownController();

  useEffect(() => {
    // Fetch chess game results (for now, using dummy data)
    const results = generateDummyChessResults();
    setChessResults(results);
  }, []);

  // Modal to display the leaderboard
  return (
    <Modal isOpen={true} onClose={() => townController?.disconnect()} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Chess Game Leaderboard</ModalHeader>
        <ModalCloseButton />
        <Leaderboard results={chessResults} />
      </ModalContent>
    </Modal>
  );
}

export default ChessArea;
