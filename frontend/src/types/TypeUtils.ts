import {
  ConversationArea,
  Interactable,
  ViewingArea,
  GameArea,
  ChessGameState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}

export function isChessArea(interactable: Interactable): interactable is GameArea<ChessGameState> {
  return 'occupantsByID' in interactable && 'history' in interactable;
}
