import { memo, useEffect, useMemo, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
import { type Card as CardType, type Column, type FilterState } from '../../../types';
import { COLUMN_CARDS_QUERY, DELETE_COLUMN_MUTATION, UPDATE_COLUMN_MUTATION } from '../../../graphql/documents';
import { toClientCard, type CardConnection, type GqlCard } from '../../../graphql/types';

interface KanbanColumnProps {
  column: Column;
  filters: FilterState;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
  onCardsLoaded: (columnId: string, cards: CardType[]) => void;
}

export const KanbanColumn = memo(function KanbanColumn({ column, filters, onAddCard, onEditCard, onCardsLoaded }: KanbanColumnProps) {
  const apolloClient = useApolloClient();
  const [updateColumn] = useMutation(UPDATE_COLUMN_MUTATION);
  const [deleteColumn] = useMutation(DELETE_COLUMN_MUTATION, {
    update(cache) {
      cache.evict({ id: cache.identify({ __typename: 'Column', id: column.id }) });
      cache.gc();
    },
  });
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filterVariables = useMemo(() => ({
    priorities: filters.priorities.map((p) => p.toUpperCase()),
    tagIds: filters.tagIds,
    search: filters.search.trim() || null,
  }), [filters.priorities, filters.search, filters.tagIds]);

  const { data, loading, fetchMore } = useQuery<{ columnCards: CardConnection }>(COLUMN_CARDS_QUERY, {
    variables: { columnId: column.id, first: 20, filter: filterVariables },
    notifyOnNetworkStatusChange: true,
  });

  const cards = useMemo(
    () => (data?.columnCards.nodes ?? []).map((card: GqlCard) => toClientCard(card)),
    [data]
  );

  useEffect(() => {
    onCardsLoaded(column.id, cards);
  }, [cards, column.id, onCardsLoaded]);

  const cardIds = cards.map((card) => card.id);
  const cardCount = data?.columnCards.totalCount ?? cards.length;
  const isFiltered = Boolean(filters.search.trim() || filters.priorities.length || filters.tagIds.length);

  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', columnId: column.id } });

  const startEdit = () => { setEditTitle(column.title); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const commitEdit = async () => {
    const t = editTitle.trim();
    if (t && t !== column.title) await updateColumn({ variables: { input: { id: column.id, title: t } } });
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
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.length === 0 ? (
              <EmptyState
                title={loading ? 'Loading cards...' : isFiltered ? 'No cards match the filter' : 'No cards yet'}
                subtitle={loading || isFiltered ? '' : 'Click + to add your first card'}
              />
            ) : (
              cards.map((card) => (
                <TaskCard key={card.id} card={card} onEdit={onEditCard} />
              ))
            )}
          </SortableContext>
          {data?.columnCards.pageInfo.hasNextPage && (
            <Button
              size="small"
              variant="text"
              onClick={() => fetchMore({ variables: { after: data.columnCards.pageInfo.endCursor } })}
            >
              Load more
            </Button>
          )}
        </Box>

        <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Tooltip title="Add card (N)" arrow>
            <Box
              onClick={() => onAddCard(column.id)}
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
        onConfirm={async () => {
          await deleteColumn({ variables: { id: column.id } });
          await apolloClient.refetchQueries({ include: 'active' });
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
});
