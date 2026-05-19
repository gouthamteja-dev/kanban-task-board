import { createTheme, type Theme } from '@mui/material/styles';

const sharedTokens = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 500 },
    body2: { fontSize: '0.8125rem' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
};

export const lightTheme: Theme = createTheme({
  ...sharedTokens,
  palette: {
    mode: 'light',
    primary: { main: '#5B6EE8' },
    secondary: { main: '#FF6B6B' },
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1D2E',
      secondary: '#6B7280',
    },
  },
});

export const darkTheme: Theme = createTheme({
  ...sharedTokens,
  palette: {
    mode: 'dark',
    primary: { main: '#7C8FFF' },
    secondary: { main: '#FF6B6B' },
    background: {
      default: '#0F1117',
      paper: '#1A1D2E',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#9CA3AF',
    },
  },
});
