import Chip from '@mui/material/Chip';
import { type Priority } from '../../../types';
import { PRIORITY_COLORS } from '../../../utils/helpers';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'medium';
}

const labels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function PriorityBadge({ priority, size = 'small' }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority];
  return (
    <Chip
      label={labels[priority]}
      size={size}
      sx={{
        bgcolor: `${color}22`,
        color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 20,
        '& .MuiChip-label': { px: '6px' },
      }}
    />
  );
}
