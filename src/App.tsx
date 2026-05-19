import { useMemo, useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { BoardPage } from './components/pages/BoardPage';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';
import { lightTheme, darkTheme } from './theme';
import { useBoardStore } from './store/boardStore';

function LoadingScreen() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    </ThemeProvider>
  );
}

function AppContent() {
  const darkMode = useBoardStore((s) => s.darkMode);
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BoardPage />
    </ThemeProvider>
  );
}

function App() {
  const [ready, setReady] = useState(() => useBoardStore.persist.hasHydrated());
  const hydratedRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (hydratedRef.current) return;
      hydratedRef.current = true;
      setReady(true);
    };

    if (useBoardStore.persist.hasHydrated()) {
      finish();
      return;
    }

    const unsub = useBoardStore.persist.onFinishHydration(finish);
    const timeout = window.setTimeout(finish, 1000);

    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
