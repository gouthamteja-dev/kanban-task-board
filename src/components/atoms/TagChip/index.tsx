import Chip from '@mui/material/Chip';
import { type Tag } from '../../../types';

interface TagChipProps {
  tag: Tag;
  onDelete?: () => void;
  size?: 'small' | 'medium';
}

export function TagChip({ tag, onDelete, size = 'small' }: TagChipProps) {
  return (
    <Chip
      label={tag.label}
      size={size}
      onDelete={onDelete}
      sx={{
        bgcolor: `${tag.color}22`,
        color: tag.color,
        fontWeight: 500,
        fontSize: '0.7rem',
        height: 20,
        '& .MuiChip-label': { px: '6px' },
        '& .MuiChip-deleteIcon': { color: tag.color, fontSize: '14px' },
      }}
    />
  );
}
