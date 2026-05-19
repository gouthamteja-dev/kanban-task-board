import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { AppInput } from '../../atoms/AppInput';
import { useBoardStore } from '../../../store/boardStore';

interface AddColumnDialogProps {
  open: boolean;
  onClose: () => void;
}

function AddColumnForm({ onClose }: { onClose: () => void }) {
  const addColumn = useBoardStore((s) => s.addColumn);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) { setError('Column name is required'); return; }
    if (trimmed.length > 50) { setError('Max 50 characters'); return; }
    addColumn(trimmed);
    onClose();
  };

  return (
    <>
      <DialogContent sx={{ pt: 2 }}>
        <AppInput
          label="Column name *"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          error={Boolean(error)}
          helperText={error}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          slotProps={{ htmlInput: { maxLength: 50 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" size="small" onClick={handleSubmit} disableElevation sx={{ borderRadius: 2 }}>Create</Button>
      </DialogActions>
    </>
  );
}

export function AddColumnDialog({ open, onClose }: AddColumnDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>New Column</DialogTitle>
      {open && <AddColumnForm key="new-column-form" onClose={onClose} />}
    </Dialog>
  );
}
