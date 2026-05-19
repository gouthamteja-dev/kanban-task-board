import { useBoardStore } from '../store/boardStore';

/**
 * Returns board actions only — no state subscription.
 * Actions are stable references in Zustand; getState() avoids
 * creating a new selector object on every render, which was causing
 * the "Maximum update depth exceeded" infinite loop.
 */
export function useBoardActions() {
  return useBoardStore.getState();
}
