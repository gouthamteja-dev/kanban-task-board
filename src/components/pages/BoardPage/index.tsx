import { useState, useCallback, useMemo } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { BoardLayout } from '../../templates/BoardLayout';
import { BoardHeader } from '../../organisms/BoardHeader';
import { KanbanColumn } from '../../organisms/KanbanColumn';
import { TaskCard } from '../../organisms/TaskCard';
import { TaskCardModal } from '../../organisms/TaskCardModal';
import { AddColumnDialog } from '../../organisms/AddColumnDialog';
import { EmptyState } from '../../atoms/EmptyState';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { useUiStore } from '../../../store/uiStore';
import { type Card } from '../../../types';
import {
  BOARD_QUERY,
  CREATE_BOARD_MUTATION,
  MOVE_CARD_MUTATION,
  REORDER_CARDS_MUTATION,
} from '../../../graphql/documents';
import { toClientBoard, toClientTag, toServerPriority, type GqlBoard } from '../../../graphql/types';

export function BoardPage() {
  const apolloClient = useApolloClient();
  const filters = useUiStore((s) => s.filters);
  const { data, loading, error } = useQuery<{ boards: GqlBoard[] }>(BOARD_QUERY);
  const [createBoard] = useMutation(CREATE_BOARD_MUTATION, { refetchQueries: [BOARD_QUERY] });
  const [moveCard] = useMutation(MOVE_CARD_MUTATION);
  const [reorderCards] = useMutation(REORDER_CARDS_MUTATION);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [loadedCards, setLoadedCards] = useState<Record<string, Card>>({});
  const [cardModalState, setCardModalState] = useState<{ open: boolean; columnId: string | null; editCard: Card | null }>({
    open: false, columnId: null, editCard: null,
  });
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  const gqlBoard = data?.boards[0] ?? null;
  const board = useMemo(() => (gqlBoard ? toClientBoard(gqlBoard) : null), [gqlBoard]);
  const tags = useMemo(() => gqlBoard?.tags.map(toClientTag) ?? [], [gqlBoard]);

  const openNewCard = useCallback((columnId: string) => {
    setCardModalState({ open: true, columnId, editCard: null });
  }, []);

  const openNewCardShortcut = useCallback(() => {
    if (!board) return;
    const firstColId = board.columnOrder[0];
    if (firstColId) openNewCard(firstColId);
  }, [board, openNewCard]);

  const openEditCard = useCallback((card: Card) => {
    setCardModalState({ open: true, columnId: card.columnId, editCard: card });
  }, []);

  const closeCardModal = useCallback(() => {
    setCardModalState({ open: false, columnId: null, editCard: null });
  }, []);

  useKeyboardShortcuts({ onNewCard: openNewCardShortcut });

  // ── DnD sensors ────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeCard = activeCardId ? loadedCards[activeCardId] : null;

  const handleCardsLoaded = useCallback((columnId: string, cards: Card[]) => {
    setLoadedCards((current) => {
      const next = { ...current };
      Object.values(next).forEach((card) => {
        if (card.columnId === columnId) delete next[card.id];
      });
      cards.forEach((card) => {
        next[card.id] = card;
      });
      return next;
    });
  }, []);

  const loadedCardIdsForColumn = useCallback((columnId: string) =>
    Object.values(loadedCards)
      .filter((card) => card.columnId === columnId)
      .sort((a, b) => a.order - b.order)
      .map((card) => card.id), [loadedCards]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      setActiveCardId(active.id as string);
    }
  };

  const optimisticCard = (card: Card, columnId: string, order: number) => ({
    __typename: 'Card',
    id: card.id,
    boardId: board?.id ?? '',
    columnId,
    title: card.title,
    description: card.description,
    priority: toServerPriority(card.priority),
    dueDate: card.dueDate,
    order,
    createdAt: card.createdAt,
    isOverdue: Boolean(card.dueDate && new Date(card.dueDate) < new Date()),
    tags: card.tags.map((tag) => ({ __typename: 'Tag', ...tag, boardId: board?.id ?? '' })),
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeCard = loadedCards[activeId];
    if (!activeCard) return;

    const overIsCard = Boolean(loadedCards[overId]);
    const overIsColumn = Boolean(board.columns[overId]);

    if (overIsCard) {
      const overCard = loadedCards[overId];
      const toColumnId = overCard.columnId;
      const toIds = loadedCardIdsForColumn(toColumnId);
      const toIndex = toIds.indexOf(overId);

      if (activeCard.columnId === toColumnId) {
        const fromIndex = toIds.indexOf(activeId);
        if (fromIndex !== toIndex) {
          const nextIds = [...toIds];
          const [moved] = nextIds.splice(fromIndex, 1);
          nextIds.splice(toIndex, 0, moved);
          setLoadedCards((current) => {
            const next = { ...current };
            nextIds.forEach((id, order) => {
              if (next[id]) next[id] = { ...next[id], order };
            });
            return next;
          });
          await reorderCards({
            variables: { input: { columnId: toColumnId, cardIds: nextIds } },
            optimisticResponse: {
              reorderCards: { __typename: 'Column', id: toColumnId, boardId: board.id, title: board.columns[toColumnId].title, order: 0 },
            },
          });
        }
      } else {
        setLoadedCards((current) => ({
          ...current,
          [activeId]: { ...activeCard, columnId: toColumnId, order: toIndex },
        }));
        await moveCard({
          variables: { input: { cardId: activeId, toColumnId, toIndex } },
          optimisticResponse: { moveCard: optimisticCard(activeCard, toColumnId, toIndex) },
        });
        await apolloClient.refetchQueries({ include: 'active' });
      }
    } else if (overIsColumn) {
      const toColumnId = overId;
      if (activeCard.columnId === toColumnId) return;
      const toIndex = loadedCardIdsForColumn(toColumnId).length;
      setLoadedCards((current) => ({
        ...current,
        [activeId]: { ...activeCard, columnId: toColumnId, order: toIndex },
      }));
      await moveCard({
        variables: { input: { cardId: activeId, toColumnId, toIndex } },
        optimisticResponse: { moveCard: optimisticCard(activeCard, toColumnId, toIndex) },
      });
      await apolloClient.refetchQueries({ include: 'active' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography color="text.secondary">Loading board…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography color="error">Unable to load board: {error.message}</Typography>
      </Box>
    );
  }

  if (!board) {
    return (
      <BoardLayout header={<BoardHeader title="Kanban Board" tags={[]} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', pt: 8 }}>
          <EmptyState
            title="No boards yet"
            subtitle="Create a board to get started"
            action={
              <Button variant="contained" onClick={() => createBoard({ variables: { input: { title: 'My Kanban Board' } } })}>
                Create Board
              </Button>
            }
          />
        </Box>
      </BoardLayout>
    );
  }

  return (
    <BoardLayout header={<BoardHeader title={board.title} tags={tags} />}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveCardId(null)}
      >
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', height: '100%' }}>
          {board.columnOrder.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', pt: 8 }}>
              <EmptyState
                title="No columns yet"
                subtitle="Create your first column to get started"
                action={
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddColumnOpen(true)} disableElevation sx={{ borderRadius: 2, mt: 1 }}>
                    Add Column
                  </Button>
                }
              />
            </Box>
          ) : (
            <>
              {board.columnOrder.map((colId) => (
                <KanbanColumn
                  key={colId}
                  column={board.columns[colId]}
                  filters={filters}
                  onAddCard={openNewCard}
                  onEditCard={openEditCard}
                  onCardsLoaded={handleCardsLoaded}
                />
              ))}
              {/* Add new column CTA */}
              <Tooltip title="Add column" arrow>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddColumnOpen(true)}
                  sx={{
                    minWidth: 180,
                    height: 44,
                    borderRadius: 2.5,
                    borderStyle: 'dashed',
                    textTransform: 'none',
                    fontWeight: 600,
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    mt: 0,
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                  }}
                >
                  Add Column
                </Button>
              </Tooltip>
            </>
          )}
        </Box>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeCard ? <TaskCard card={activeCard} onEdit={openEditCard} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskCardModal
        open={cardModalState.open}
        boardId={board.id}
        columnId={cardModalState.columnId}
        editCard={cardModalState.editCard}
        existingTags={tags}
        onClose={closeCardModal}
      />

      <AddColumnDialog open={addColumnOpen} boardId={board.id} onClose={() => setAddColumnOpen(false)} />
    </BoardLayout>
  );
}
