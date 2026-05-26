import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { SearchBar } from '../../molecules/SearchBar';
import { FilterBar } from '../../molecules/FilterBar';
import { useUiStore } from '../../../store/uiStore';
import { type Tag } from '../../../types';

interface BoardHeaderProps {
  title: string;
  tags: Tag[];
}

export function BoardHeader({ title, tags }: BoardHeaderProps) {
  const darkMode = useUiStore((s) => s.darkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
        <ViewKanbanIcon sx={{ color: 'primary.main', fontSize: 26 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mr: 1, display: { xs: 'none', sm: 'block' } }}>
          {title}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Box sx={{ flex: 1 }} />

        <SearchBar />
        <FilterBar tags={tags} />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
          <IconButton size="small" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
