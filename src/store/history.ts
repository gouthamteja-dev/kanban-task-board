import { type Board } from '../types';

export interface HistorySnapshot {
  boards: Record<string, Board>;
  activeBoardId: string;
}

const MAX_HISTORY = 10;
const undoStack: HistorySnapshot[] = [];
const redoStack: HistorySnapshot[] = [];

export function snapshotBoard(
  boards: Record<string, Board>,
  activeBoardId: string
): HistorySnapshot {
  return {
    boards: structuredClone(boards),
    activeBoardId,
  };
}

export function pushHistory(boards: Record<string, Board>, activeBoardId: string) {
  undoStack.push(snapshotBoard(boards, activeBoardId));
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
}

export function clearHistory() {
  undoStack.length = 0;
  redoStack.length = 0;
}

export function canUndo() {
  return undoStack.length > 0;
}

export function canRedo() {
  return redoStack.length > 0;
}

export function popUndo(
  current: HistorySnapshot
): HistorySnapshot | null {
  if (undoStack.length === 0) return null;
  redoStack.push(snapshotBoard(current.boards, current.activeBoardId));
  return undoStack.pop() ?? null;
}

export function popRedo(
  current: HistorySnapshot
): HistorySnapshot | null {
  if (redoStack.length === 0) return null;
  undoStack.push(snapshotBoard(current.boards, current.activeBoardId));
  return redoStack.pop() ?? null;
}

// Clear history stacks on Vite HMR so stale snapshots from the previous
// module instance do not leak into the undo/redo queue during development.
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    clearHistory();
  });
}
