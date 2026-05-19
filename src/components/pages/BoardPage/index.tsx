import { useState, useCallback } from 'react';
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
import { useBoardStore, selectActiveBoard } from '../../../store/boardStore';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { type Card } from '../../../types';

export function BoardPage() {
  const board = useBoardStore(selectActiveBoard);
  const moveCard = useBoardStore((s) => s.moveCard);
  const reorderCard = useBoardStore((s) => s.reorderCard);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardModalState, setCardModalState] = useState<{ open: boolean; columnId: string | null; editCard: Card | null }>({
    open: false, columnId: null, editCard: null,
  });
  const [addColumnOpen, setAddColumnOpen] = useState(false);

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

  const activeCard = activeCardId ? board?.cards[activeCardId] : null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      setActiveCardId(active.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeCard = board.cards[activeId];
    if (!activeCard) return;

    const overIsCard = Boolean(board.cards[overId]);
    const overIsColumn = Boolean(board.columns[overId]);

    if (overIsCard) {
      const overCard = board.cards[overId];
      const toColumnId = overCard.columnId;
      const toCol = board.columns[toColumnId];
      const toIndex = toCol.cardIds.indexOf(overId);

      if (activeCard.columnId === toColumnId) {
        const fromIndex = toCol.cardIds.indexOf(activeId);
        if (fromIndex !== toIndex) reorderCard(toColumnId, fromIndex, toIndex);
      } else {
        moveCard(activeId, toColumnId, toIndex);
      }
    } else if (overIsColumn) {
      const toColumnId = overId;
      const toCol = board.columns[toColumnId];
      if (activeCard.columnId === toColumnId) return;
      moveCard(activeId, toColumnId, toCol.cardIds.length);
    }
  };

  if (!board) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography color="text.secondary">Loading board…</Typography>
      </Box>
    );
  }

  return (
    <BoardLayout header={<BoardHeader />}>
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
                  columnId={colId}
                  onAddCard={openNewCard}
                  onEditCard={openEditCard}
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
        columnId={cardModalState.columnId}
        editCard={cardModalState.editCard}
        onClose={closeCardModal}
      />

      <AddColumnDialog open={addColumnOpen} onClose={() => setAddColumnOpen(false)} />
    </BoardLayout>
  );
}
