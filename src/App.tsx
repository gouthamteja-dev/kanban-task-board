import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BoardPage } from './components/pages/BoardPage';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';
import { lightTheme, darkTheme } from './theme';
import { useUiStore } from './store/uiStore';

function App() {
  const darkMode = useUiStore((s) => s.darkMode);
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BoardPage />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
