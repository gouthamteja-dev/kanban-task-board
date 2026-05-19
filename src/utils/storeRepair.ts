import { type Board } from '../types';
import { createSeedBoard } from '../store/boardStore';

/** Ensures boards and activeBoardId always point to valid data after localStorage load. */
export function repairBoardState(state: {
  boards: Record<string, Board>;
  activeBoardId: string;
}): { boards: Record<string, Board>; activeBoardId: string } {
  const boardIds = Object.keys(state.boards ?? {});

  if (boardIds.length === 0) {
    // localStorage was cleared or corrupted — bootstrap a fresh seed board
    const nb = createSeedBoard();
    return { boards: { [nb.id]: nb }, activeBoardId: nb.id };
  }

  if (state.boards[state.activeBoardId]) {
    return state;
  }

  return { ...state, activeBoardId: boardIds[0] };
}
