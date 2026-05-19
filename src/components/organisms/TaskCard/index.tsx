import { memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CardMetaRow } from '../../molecules/CardMetaRow';
import { ConfirmDialog } from '../../molecules/ConfirmDialog';
import { AppIconButton } from '../../atoms/AppButton';
import { type Card as CardType } from '../../../types';
import { useBoardStore } from '../../../store/boardStore';

interface TaskCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  isDragOverlay?: boolean;
}

export const TaskCard = memo(function TaskCard({ card, onEdit, isDragOverlay = false }: TaskCardProps) {
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isDragOverlay,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  if (isDragOverlay) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          cursor: 'grabbing',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          border: '1px solid',
          borderColor: 'primary.main',
          rotate: '2deg',
        }}
      >
        <CardContent sx={{ p: '10px !important' }}>
          <Typography variant="subtitle2" gutterBottom>{card.title}</Typography>
          <CardMetaRow card={card} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.15s, border-color 0.15s',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            borderColor: 'primary.light',
            '& .card-actions': { opacity: 1 },
          },
          position: 'relative',
        }}
      >
        <CardContent sx={{ p: '10px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            {/* Drag handle */}
            <Tooltip title="Drag to reorder" arrow>
              <Box
                {...attributes}
                {...listeners}
                sx={{
                  cursor: 'grab',
                  color: 'text.disabled',
                  mt: '2px',
                  flexShrink: 0,
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <DragIndicatorIcon fontSize="small" />
              </Box>
            </Tooltip>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                  mb: 0.75,
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={() => onEdit(card)}
              >
                {card.title}
              </Typography>
              {card.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 0.75,
                    lineHeight: 1.5,
                  }}
                >
                  {card.description}
                </Typography>
              )}
              <CardMetaRow card={card} />
            </Box>

            {/* Action buttons */}
            <Box
              className="card-actions"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
                opacity: 0,
                transition: 'opacity 0.15s',
                flexShrink: 0,
              }}
            >
              <AppIconButton tooltip="Edit card" onClick={() => onEdit(card)}>
                <EditIcon sx={{ fontSize: 14 }} />
              </AppIconButton>
              <AppIconButton tooltip="Delete card" color="error" onClick={() => setConfirmOpen(true)}>
                <DeleteIcon sx={{ fontSize: 14 }} />
              </AppIconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete card?"
        description={`"${card.title}" will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { deleteCard(card.id); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
});
