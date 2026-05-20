import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { type Board, type Card, type Priority, type Tag, type FilterState } from '../types';
import { repairBoardState } from '../utils/storeRepair';
import {
  pushHistory,
  canUndo as historyCanUndo,
  canRedo as historyCanRedo,
  popUndo,
  popRedo,
  clearHistory,
} from './history';

// ─── Seed Data ────────────────────────────────────────────────────────────────

export function createSeedBoard(): Board {
  const todoId = nanoid();
  const inProgressId = nanoid();
  const doneId = nanoid();

  const card1Id = nanoid();
  const card2Id = nanoid();
  const card3Id = nanoid();
  const card4Id = nanoid();

  return {
    id: nanoid(),
    title: 'My Kanban Board',
    columnOrder: [todoId, inProgressId, doneId],
    columns: {
      [todoId]: { id: todoId, title: 'To Do', cardIds: [card1Id, card2Id] },
      [inProgressId]: { id: inProgressId, title: 'In Progress', cardIds: [card3Id] },
      [doneId]: { id: doneId, title: 'Done', cardIds: [card4Id] },
    },
    cards: {
      [card1Id]: {
        id: card1Id, columnId: todoId, title: 'Set up project repository',
        description: 'Initialize the Git repo, add .gitignore, and push initial commit.',
        priority: 'high', dueDate: null,
        tags: [{ id: nanoid(), label: 'Setup', color: '#6366F1' }],
        createdAt: new Date().toISOString(), order: 0,
      },
      [card2Id]: {
        id: card2Id, columnId: todoId, title: 'Design system tokens',
        description: 'Define color palette, typography scale, and spacing in the theme file.',
        priority: 'medium', dueDate: null,
        tags: [{ id: nanoid(), label: 'Design', color: '#A855F7' }],
        createdAt: new Date().toISOString(), order: 1,
      },
      [card3Id]: {
        id: card3Id, columnId: inProgressId, title: 'Build Kanban board UI',
        description: 'Implement drag-and-drop columns and task cards using @dnd-kit.',
        priority: 'high', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        tags: [{ id: nanoid(), label: 'Feature', color: '#22C55E' }],
        createdAt: new Date().toISOString(), order: 0,
      },
      [card4Id]: {
        id: card4Id, columnId: doneId, title: 'Define data models',
        description: 'TypeScript interfaces for Board, Column, Card, Tag, and Priority.',
        priority: 'low', dueDate: null,
        tags: [{ id: nanoid(), label: 'Backend', color: '#06B6D4' }],
        createdAt: new Date().toISOString(), order: 0,
      },
    },
  };
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

export interface BoardState {
  boards: Record<string, Board>;
  activeBoardId: string;
  darkMode: boolean;
  filters: FilterState;
  canUndo: boolean;
  canRedo: boolean;

  addBoard: (title: string) => void;
  renameBoard: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;
  setActiveBoard: (boardId: string) => void;

  addColumn: (title: string) => void;
  renameColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;

  addCard: (columnId: string, data: Omit<Card, 'id' | 'columnId' | 'createdAt' | 'order'>) => void;
  editCard: (cardId: string, data: Partial<Omit<Card, 'id' | 'columnId' | 'createdAt'>>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;
  reorderCard: (columnId: string, fromIndex: number, toIndex: number) => void;

  undo: () => void;
  redo: () => void;
  toggleDarkMode: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = { search: '', priorities: [], tagIds: [] };

type SetState = (
  partial:
    | Partial<BoardState>
    | ((state: BoardState) => Partial<BoardState>)
) => void;
type GetState = () => BoardState;

function historyFlags() {
  return { canUndo: historyCanUndo(), canRedo: historyCanRedo() };
}

function commitBoardChange(get: GetState, set: SetState, apply: (s: BoardState) => Partial<BoardState>) {
  const before = get();
  pushHistory(before.boards, before.activeBoardId);
  set((s) => ({ ...apply(s), ...historyFlags() }));
}

// ─── Store ────────────────────────────────────────────────────────────────────

const seedBoard = createSeedBoard();

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: { [seedBoard.id]: seedBoard },
      activeBoardId: seedBoard.id,
      darkMode: false,
      filters: defaultFilters,
      canUndo: false,
      canRedo: false,

      addBoard: (title) => {
        commitBoardChange(get, set, (s) => {
          const board = createSeedBoard();
          board.title = title;
          board.columns = {};
          board.columnOrder = [];
          board.cards = {};
          const newBoard = { ...board, id: nanoid(), title };
          return {
            boards: { ...s.boards, [newBoard.id]: newBoard },
            activeBoardId: newBoard.id,
          };
        });
      },

      renameBoard: (boardId, title) =>
        commitBoardChange(get, set, (s) => ({
          boards: {
            ...s.boards,
            [boardId]: { ...s.boards[boardId], title },
          },
        })),

      deleteBoard: (boardId) =>
        commitBoardChange(get, set, (s) => {
          const rest = { ...s.boards };
          delete rest[boardId];
          const ids = Object.keys(rest);
          if (ids.length > 0) {
            return { boards: rest, activeBoardId: ids[0] };
          }
          const nb = createSeedBoard();
          return { boards: { [nb.id]: nb }, activeBoardId: nb.id };
        }),

      setActiveBoard: (boardId) => set({ activeBoardId: boardId }),

      addColumn: (title) =>
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          const colId = nanoid();
          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: {
                ...board,
                columnOrder: [...board.columnOrder, colId],
                columns: {
                  ...board.columns,
                  [colId]: { id: colId, title, cardIds: [] },
                },
              },
            },
          };
        }),

      renameColumn: (columnId, title) =>
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: {
                ...board,
                columns: {
                  ...board.columns,
                  [columnId]: { ...board.columns[columnId], title },
                },
              },
            },
          };
        }),

      deleteColumn: (columnId) =>
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          const col = board.columns[columnId];
          const newCards = { ...board.cards };
          col.cardIds.forEach((cid) => delete newCards[cid]);
          const restColumns = { ...board.columns };
          delete restColumns[columnId];
          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: {
                ...board,
                columnOrder: board.columnOrder.filter((id) => id !== columnId),
                columns: restColumns,
                cards: newCards,
              },
            },
          };
        }),

      addCard: (columnId, data) =>
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          const col = board.columns[columnId];
          const cardId = nanoid();
          const card: Card = {
            ...data,
            id: cardId,
            columnId,
            createdAt: new Date().toISOString(),
            order: col.cardIds.length,
          };
          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: {
                ...board,
                columns: {
                  ...board.columns,
                  [columnId]: { ...col, cardIds: [...col.cardIds, cardId] },
                },
                cards: { ...board.cards, [cardId]: card },
              },
            },
          };
        }),

      editCard: (cardId, data) =>
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: {
                ...board,
                cards: {
                  ...board.cards,
                  [cardId]: { ...board.cards[cardId], ...data },
                },
              },
            },
          };
        }),

      deleteCard: (cardId) =>
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          const card = board.cards[cardId];
          const col = board.columns[card.columnId];
          const restCards = { ...board.cards };
          delete restCards[cardId];
          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: {
                ...board,
                columns: {
                  ...board.columns,
                  [card.columnId]: {
                    ...col,
                    cardIds: col.cardIds.filter((id) => id !== cardId),
                  },
                },
                cards: restCards,
              },
            },
          };
        }),

      moveCard: (cardId, toColumnId, toIndex) =>
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          const card = board.cards[cardId];
          if (!card) return {};

          const fromColumnId = card.columnId;
          const isSameColumn = fromColumnId === toColumnId;

          // Source list with the moving card removed
          const fromIds = board.columns[fromColumnId].cardIds.filter(
            (id) => id !== cardId
          );

          // Destination list — for same-column moves, base off fromIds (card already removed)
          const destIds = isSameColumn
            ? [...fromIds]
            : [...board.columns[toColumnId].cardIds];
          destIds.splice(toIndex, 0, cardId);

          const updatedColumns = {
            ...board.columns,
            [fromColumnId]: { ...board.columns[fromColumnId], cardIds: fromIds },
            [toColumnId]: { ...board.columns[toColumnId], cardIds: destIds },
          };

          // Re-stamp columnId + order for every card in affected columns
          const updatedCards = { ...board.cards };
          [fromColumnId, toColumnId].forEach((colId) => {
            updatedColumns[colId].cardIds.forEach((id, idx) => {
              updatedCards[id] = { ...updatedCards[id], columnId: colId, order: idx };
            });
          });

          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: { ...board, columns: updatedColumns, cards: updatedCards },
            },
          };
        }),

      reorderCard: (columnId, fromIndex, toIndex) => {
        commitBoardChange(get, set, (s) => {
          const board = s.boards[s.activeBoardId];
          const col = board.columns[columnId];
          const newIds = [...col.cardIds];
          const [moved] = newIds.splice(fromIndex, 1);
          newIds.splice(toIndex, 0, moved);
          const updatedCards = { ...board.cards };
          newIds.forEach((id, idx) => {
            updatedCards[id] = { ...updatedCards[id], order: idx };
          });
          return {
            boards: {
              ...s.boards,
              [s.activeBoardId]: {
                ...board,
                columns: { ...board.columns, [columnId]: { ...col, cardIds: newIds } },
                cards: updatedCards,
              },
            },
          };
        });
      },

      undo: () => {
        const current = get();
        const prev = popUndo({ boards: current.boards, activeBoardId: current.activeBoardId });
        if (!prev) return;
        set({
          boards: prev.boards,
          activeBoardId: prev.activeBoardId,
          ...historyFlags(),
        });
      },

      redo: () => {
        const current = get();
        const next = popRedo({ boards: current.boards, activeBoardId: current.activeBoardId });
        if (!next) return;
        set({
          boards: next.boards,
          activeBoardId: next.activeBoardId,
          ...historyFlags(),
        });
      },

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'kanban-store-v2',
      partialize: (s) => ({
        boards: s.boards,
        activeBoardId: s.activeBoardId,
        darkMode: s.darkMode,
      }),
      merge: (persisted, current) => {
        const merged = {
          ...current,
          ...(persisted as Partial<BoardState>),
          filters: current.filters,
          canUndo: false,
          canRedo: false,
        };
        const repaired = repairBoardState({
          boards: merged.boards,
          activeBoardId: merged.activeBoardId,
        });
        clearHistory();
        return { ...merged, ...repaired };
      },
      onRehydrateStorage: () => () => {
        clearHistory();
      },
    }
  )
);

export const selectActiveBoard = (s: BoardState): Board | undefined => {
  const board = s.boards[s.activeBoardId];
  if (board) return board;
  const firstId = Object.keys(s.boards)[0];
  return firstId ? s.boards[firstId] : undefined;
};

export const selectAllTags = (s: BoardState): Tag[] => {
  const board = s.boards[s.activeBoardId];
  if (!board) return [];
  const seen = new Map<string, Tag>();
  Object.values(board.cards).forEach((card) => {
    card.tags.forEach((t) => seen.set(t.id, t));
  });
  return Array.from(seen.values());
};

export const selectFilteredCardIds = (columnId: string) => (s: BoardState): string[] => {
  const board = s.boards[s.activeBoardId];
  if (!board) return [];
  const col = board.columns[columnId];
  if (!col) return [];
  const { search, priorities, tagIds } = s.filters;
  const query = search.trim().toLowerCase();

  return col.cardIds.filter((id) => {
    const card = board.cards[id];
    if (!card) return false;
    if (query) {
      if (!card.title.toLowerCase().includes(query) && !card.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (priorities.length > 0 && !priorities.includes(card.priority as Priority)) return false;
    if (tagIds.length > 0 && !card.tags.some((t) => tagIds.includes(t.id))) return false;
    return true;
  });
};
