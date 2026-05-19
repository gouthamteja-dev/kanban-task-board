import { Component, type ErrorInfo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Kanban app error:', error, info);
  }

  handleReset = () => {
    localStorage.removeItem('kanban-store');
    localStorage.removeItem('kanban-store-v2');
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6">Oops! Something unexpected happened</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            We've encountered an error. Try refreshing the page.
          </Typography>
          
          <Button variant="contained" onClick={this.handleReset}>
            Clear saved data and reload
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
