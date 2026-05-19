import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        py: 4,
        px: 2,
        opacity: 0.6,
      }}
    >
      {icon && <Box sx={{ fontSize: 40, lineHeight: 1 }}>{icon}</Box>}
      <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {subtitle}
        </Typography>
      )}
      {action}
    </Box>
  );
}
