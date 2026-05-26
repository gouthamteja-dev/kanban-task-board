import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useUiStore } from '../../../store/uiStore';
import { type Priority, type Tag } from '../../../types';
import { PRIORITY_COLORS } from '../../../utils/helpers';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const PRIORITY_LABELS: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' };

const sectionLabelSx = {
  px: 1.5,
  pt: 1,
  pb: 0.5,
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'text.secondary',
  letterSpacing: 0.5,
  textTransform: 'uppercase' as const,
};

interface FilterBarProps {
  tags: Tag[];
}

export function FilterBar({ tags }: FilterBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const filters = useUiStore((s) => s.filters);
  const setFilters = useUiStore((s) => s.setFilters);
  const resetFilters = useUiStore((s) => s.resetFilters);

  const activeCount = filters.priorities.length + filters.tagIds.length;

  const togglePriority = (p: Priority) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter((x) => x !== p)
      : [...filters.priorities, p];
    setFilters({ priorities: next });
  };

  const toggleTag = (tagId: string) => {
    const next = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter((x) => x !== tagId)
      : [...filters.tagIds, tagId];
    setFilters({ tagIds: next });
  };

  return (
    <>
      <Badge badgeContent={activeCount} color="primary" overlap="circular">
        <Button
          size="small"
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
        >
          Filter
        </Button>
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2, p: 0.5 } } }}
      >
        <Box sx={sectionLabelSx}>Priority</Box>
        {PRIORITIES.map((p) => (
          <MenuItem key={p} dense onClick={() => togglePriority(p)} sx={{ borderRadius: 1 }}>
            <Checkbox size="small" checked={filters.priorities.includes(p)} sx={{ p: 0.5, mr: 0.5, color: PRIORITY_COLORS[p] }} />
            <ListItemText
              primary={PRIORITY_LABELS[p]}
              slotProps={{ primary: { sx: { fontSize: '0.85rem', color: PRIORITY_COLORS[p], fontWeight: 600 } } }}
            />
          </MenuItem>
        ))}
        {tags.length > 0 && (
          <>
            <Box sx={{ ...sectionLabelSx, pt: 1.5 }}>Tags</Box>
            {tags.map((tag) => (
              <MenuItem key={tag.id} dense onClick={() => toggleTag(tag.id)} sx={{ borderRadius: 1 }}>
                <Checkbox size="small" checked={filters.tagIds.includes(tag.id)} sx={{ p: 0.5, mr: 0.5, color: tag.color }} />
                <ListItemText
                  primary={tag.label}
                  slotProps={{ primary: { sx: { fontSize: '0.85rem' } } }}
                />
              </MenuItem>
            ))}
          </>
        )}
        {activeCount > 0 && (
          <Box sx={{ px: 1, pt: 1, pb: 0.5 }}>
            <Button
              size="small"
              fullWidth
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: '0.8rem' }}
              onClick={() => { resetFilters(); setAnchorEl(null); }}
            >
              Clear filters
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
}
