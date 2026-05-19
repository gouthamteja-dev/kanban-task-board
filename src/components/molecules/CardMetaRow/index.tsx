import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { PriorityBadge } from '../../atoms/PriorityBadge';
import { TagChip } from '../../atoms/TagChip';
import { type Card } from '../../../types';
import { formatDueDate, isDueSoon, isOverdue } from '../../../utils/helpers';

interface CardMetaRowProps {
  card: Card;
}

export function CardMetaRow({ card }: CardMetaRowProps) {
  const overdue = isOverdue(card.dueDate);
  const dueSoon = isDueSoon(card.dueDate);
  const dueDateColor = overdue ? 'error.main' : dueSoon ? 'warning.main' : 'text.secondary';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <PriorityBadge priority={card.priority} />
        {card.dueDate && (
          <Tooltip title={overdue ? 'Overdue' : dueSoon ? 'Due soon' : ''} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <CalendarTodayIcon sx={{ fontSize: 11, color: dueDateColor }} />
              <Typography
                variant="caption"
                sx={{ color: dueDateColor, fontWeight: overdue || dueSoon ? 600 : 400 }}
              >
                {formatDueDate(card.dueDate)}
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
      {card.tags.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {card.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
          {card.tags.length > 3 && (
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              +{card.tags.length - 3}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
