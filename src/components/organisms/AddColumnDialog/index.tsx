import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useMutation } from '@apollo/client/react';
import { AppInput } from '../../atoms/AppInput';
import { BOARD_QUERY, CREATE_COLUMN_MUTATION } from '../../../graphql/documents';

interface AddColumnDialogProps {
  open: boolean;
  boardId: string;
  onClose: () => void;
}

function AddColumnForm({ boardId, onClose }: { boardId: string; onClose: () => void }) {
  const [createColumn] = useMutation(CREATE_COLUMN_MUTATION, {
    refetchQueries: [BOARD_QUERY],
  });
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) { setError('Column name is required'); return; }
    if (trimmed.length > 50) { setError('Max 50 characters'); return; }
    await createColumn({ variables: { input: { boardId, title: trimmed } } });
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

export function AddColumnDialog({ open, boardId, onClose }: AddColumnDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>New Column</DialogTitle>
      {open && <AddColumnForm key="new-column-form" boardId={boardId} onClose={onClose} />}
    </Dialog>
  );
}
