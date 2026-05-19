import { type ReactNode } from 'react';
import Box from '@mui/material/Box';

interface BoardLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

export function BoardLayout({ header, children }: BoardLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {header}
      <Box
        sx={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          px: 3,
          py: 2.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
