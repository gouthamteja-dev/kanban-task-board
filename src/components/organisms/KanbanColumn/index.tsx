import { memo, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { TaskCard } from '../TaskCard';
import { EmptyState } from '../../atoms/EmptyState';
import { ConfirmDialog } from '../../molecules/ConfirmDialog';
import { AppIconButton } from '../../atoms/AppButton';
import { type Card as CardType } from '../../../types';
import { useBoardStore, selectFilteredCardIds } from '../../../store/boardStore';

interface KanbanColumnProps {
  columnId: string;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
}

export const KanbanColumn = memo(function KanbanColumn({ columnId, onAddCard, onEditCard }: KanbanColumnProps) {
  const column = useBoardStore((s) => s.boards[s.activeBoardId]?.columns[columnId]);
  const cards = useBoardStore((s) => s.boards[s.activeBoardId]?.cards ?? {});
  const selector = useMemo(()=> selectFilteredCardIds(columnId), [columnId])
  const filteredIds = useBoardStore(useShallow(selector));
  
  const renameColumn = useBoardStore((s) => s.renameColumn);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: columnId, data: { type: 'column', columnId } });

  if (!column) return null;

  const cardCount = column.cardIds.length;
  const filteredCards = filteredIds.map((id) => cards[id]).filter(Boolean);
  const isFiltered = filteredIds.length !== cardCount;

  const startEdit = () => { setEditTitle(column.title); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const commitEdit = () => {
    const t = editTitle.trim();
    if (t && t !== column.title) renameColumn(columnId, t);
    setEditing(false);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          width: 300,
          minWidth: 300,
          maxWidth: 300,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid',
          borderColor: isOver ? 'primary.main' : 'divider',
          bgcolor: 'background.default',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: isOver ? (theme) => `0 0 0 2px ${theme.palette.primary.light}` : 'none',
        }}
      >
        <Box
          sx={{
            px: 2,
            pt: 1.75,
            pb: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {editing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
              <TextField
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                size="small"
                autoFocus
                slotProps={{ htmlInput: { maxLength: 50 } }}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.875rem', fontWeight: 600 } }}
              />
              <AppIconButton tooltip="Save" color="success" onClick={commitEdit}><CheckIcon sx={{ fontSize: 14 }} /></AppIconButton>
              <AppIconButton tooltip="Cancel" onClick={cancelEdit}><CloseIcon sx={{ fontSize: 14 }} /></AppIconButton>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" noWrap sx={{ flex: 1, lineHeight: 1.3, fontWeight: 700 }}>
                {column.title}
              </Typography>
              <Chip
                label={cardCount}
                size="small"
                sx={{ height: 18, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'action.selected', '& .MuiChip-label': { px: '5px' } }}
              />
              <AppIconButton tooltip="Rename column" onClick={startEdit}>
                <EditIcon sx={{ fontSize: 13 }} />
              </AppIconButton>
              <AppIconButton tooltip="Delete column" color="error" onClick={() => setConfirmDelete(true)}>
                <DeleteIcon sx={{ fontSize: 13 }} />
              </AppIconButton>
            </>
          )}
        </Box>

        <Box
          ref={setNodeRef}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            p: 1.5,
            minHeight: 60,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 220px)',
          }}
        >
          <SortableContext items={filteredIds} strategy={verticalListSortingStrategy}>
            {filteredCards.length === 0 ? (
              <EmptyState
                title={isFiltered ? 'No cards match the filter' : 'No cards yet'}
                subtitle={isFiltered ? '' : 'Click + to add your first card'}
              />
            ) : (
              filteredCards.map((card) => (
                <TaskCard key={card.id} card={card} onEdit={onEditCard} />
              ))
            )}
          </SortableContext>
        </Box>

        <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Tooltip title="Add card (N)" arrow>
            <Box
              onClick={() => onAddCard(columnId)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.75,
                borderRadius: 2,
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', color: 'primary.main' },
                transition: 'all 0.15s',
              }}
            >
              <AddIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Add card</Typography>
            </Box>
          </Tooltip>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete column?"
        description={
          cardCount > 0
            ? `"${column.title}" contains ${cardCount} card${cardCount > 1 ? 's' : ''}. All cards will be permanently deleted.`
            : `Are you sure you want to delete "${column.title}"?`
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => { deleteColumn(columnId); setConfirmDelete(false); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
});
