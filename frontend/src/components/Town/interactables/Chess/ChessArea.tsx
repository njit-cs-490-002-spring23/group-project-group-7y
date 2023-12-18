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
  useToast,
  Container,
  chakra,
} from '@chakra-ui/react';
import Leaderboard, { LeaderBoardProp } from './Leaderboard';
import Multiplayer from './Multiplayer';
import useTownController from '../../../../hooks/useTownController';
import { GameData, GameResult, InteractableID } from '../../../../types/CoveyTownSocket';
import { generateDummyChessResults } from './DummyResults';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';
import ChessAreaController from '../../../../classes/interactable/ChessAreaController';
import GameReview from './GameReview';
import { fetchAllGames } from '../../../../services/gameService';
import { cpuUsage } from 'process';

export type ChessGameProp = {
  gameAreaController: ChessAreaController;
  mainMenuPage: () => void;
};

/**
 * A component that will render a single cell in the Chess board, styled
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const HomeScreenButton = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    height: '30px',
    color: 'green',
    width: '175px',
    fontSize: '20px',
    margin: '5px',
  },
});
/**
 * Creates and returns the Multiplayer button
 * If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 *  @param gameAreaController the controller for the TicTacToe game
 * @returns the JSX.Element with possibly a button
 */
function JoinButton(props: {
  gameAreaController: ChessAreaController;
  multiplayerPage: () => void;
  mainMenuPage: () => void;
}): JSX.Element {
  const gameAreaController = props.gameAreaController;
  const mainMenu = props.mainMenuPage();
  const multiplayer = props.multiplayerPage();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Join Multiplayer');
  let button: JSX.Element;
  const displayToast = useToast();
  if (!gameAreaController.isPlayer && gameAreaController.status !== 'IN_PROGRESS') {
    button = (
      <HomeScreenButton
        bg='green'
        color='white'
        variant='outline'
        isLoading={isLoading}
        disabled={isDisabled}
        onClick={async (_event: { currentTarget: { remove: () => void } }) => {
          setIsDisabled(true);
          setIsLoading(true);
          setButtonText('Loading');
          await gameAreaController
            .joinGame()
            .then(() => props.multiplayerPage())
            .catch(e => {
              console.log(e);
              displayToast({
                title: 'Join Failed',
                description: `Error: ${(e as Error).message}`,
                status: 'error',
              });
            });
          setIsDisabled(false);
          setIsLoading(false);
          setButtonText('Join Multiplayer');
        }}>
        {buttonText}
      </HomeScreenButton>
    );
  } else button = <> </>;
  return button;
}

function ChessArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<ChessAreaController>(interactableID);
  const displayToast = useToast();
  const [chessResults, setChessResults] = useState<GameResult[]>(generateDummyChessResults());
  const [currentPage, setcurrentPage] = useState('mainMenu');
  const [gameHistories, setGameHistories] = useState<GameData[]>([]);
  const townController = useTownController();

  const mainMenuPage = () => {
    setcurrentPage('mainMenu');
  };
  const leaderboardPage = () => {
    setcurrentPage('leaderboard');
  };
  const multiplayerPage = () => {
    if (currentPage != 'multiplayer') {
      setcurrentPage('multiplayer');
    }
  };
  const gameReviewPage = () => {
    setcurrentPage('gamereview');
  };

  //diaplay proper page
  if (currentPage === 'leaderboard') {
    return (
      <>
        <Leaderboard results={chessResults} mainMenu={mainMenuPage} />
      </>
    );
  } else if (currentPage === 'multiplayer') {
    return (
      <>
        <Multiplayer gameAreaController={gameAreaController} mainMenu={mainMenuPage} />
      </>
    );
  } else if (currentPage === 'gamereview') {
    return (
      <>
        <GameReview mainMenu={mainMenuPage} />
      </>
    );
  } else {
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
        <Container width='50%' style={{ marginLeft: '45%', marginTop: '25%' }}>
          {gameAreaController.status !== 'IN_PROGRESS' ? (
            <HomeScreenButton
              bg='green'
              color='white'
              variant='outline'
              onClick={async () => {
                try {
                  await gameAreaController.joinGame().catch(e => {
                    displayToast({
                      title: 'Join Failed',
                      description: `Error: ${(e as Error).message}`,
                      status: 'error',
                    });
                  });
                } catch (e) {
                  displayToast({
                    title: 'Join Failed',
                    description: `Error: ${(e as Error).message}`,
                    status: 'error',
                  });
                }
                if (
                  gameAreaController.white &&
                  gameAreaController.white.id === townController.ourPlayer.id
                ) {
                  multiplayerPage();
                } else if (
                  gameAreaController.black &&
                  gameAreaController.black.id === townController.ourPlayer.id
                ) {
                  multiplayerPage();
                }
              }}>
              {'Join Multiplayer'}
            </HomeScreenButton>
          ) : (
            <> </>
          )}
          <HomeScreenButton
            bg='green'
            color='white'
            onClick={() => leaderboardPage()}
            variant='outline'>
            Leaderboard
          </HomeScreenButton>
          <HomeScreenButton
            bg='green'
            color='white'
            onClick={() => gameReviewPage()}
            variant='outline'>
            Game Review
          </HomeScreenButton>
        </Container>
      </Box>
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
          <ChessArea interactableID={gameArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
