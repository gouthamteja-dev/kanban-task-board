import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { SearchBar } from '../../molecules/SearchBar';
import { FilterBar } from '../../molecules/FilterBar';
import { useShallow } from 'zustand/react/shallow';
import { useBoardStore } from '../../../store/boardStore';

export function BoardHeader() {
  const { darkMode, toggleDarkMode, activeBoard, canUndo, canRedo, undo, redo } =
    useBoardStore(
      useShallow((s) => ({
        darkMode:       s.darkMode,
        toggleDarkMode: s.toggleDarkMode,
        activeBoard:    s.boards[s.activeBoardId],
        canUndo:        s.canUndo,
        canRedo:        s.canRedo,
        undo:           s.undo,
        redo:           s.redo,
      }))
    );

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
          {activeBoard?.title ?? 'Kanban Board'}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title={`Undo (Ctrl+Z)${!canUndo ? ' — nothing to undo' : ''}`} arrow>
          <span>
            <IconButton size="small" onClick={undo} disabled={!canUndo}>
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={`Redo (Ctrl+Y)${!canRedo ? ' — nothing to redo' : ''}`} arrow>
          <span>
            <IconButton size="small" onClick={redo} disabled={!canRedo}>
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <SearchBar />
        <FilterBar />

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
