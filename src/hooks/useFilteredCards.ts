import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBoardStore, selectFilteredCardIds } from '../store/boardStore';
import type { BoardState } from '../store/boardStore';

/**
 * Returns filtered card IDs for a given column.
 * useCallback stabilises the selector so Zustand does not treat it as a
 * new function on every render. useShallow shallow-compares the returned
 * array so the component only re-renders when the actual IDs change.
 */
export function useFilteredCards(columnId: string) {
  const selector = useCallback(
    (s: BoardState) => selectFilteredCardIds(columnId)(s),
    [columnId]
  );
  return useBoardStore(useShallow(selector));
}
