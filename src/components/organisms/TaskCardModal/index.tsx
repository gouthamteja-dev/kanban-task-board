import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useApolloClient, useMutation } from '@apollo/client/react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { AppInput } from '../../atoms/AppInput';
import { TagChip } from '../../atoms/TagChip';
import { type Card, type Priority, type Tag } from '../../../types';
import { CREATE_CARD_MUTATION, CREATE_TAG_MUTATION, UPDATE_CARD_MUTATION } from '../../../graphql/documents';
import { toClientTag, toServerPriority, type GqlTag } from '../../../graphql/types';
import { PRIORITY_COLORS, randomTagColor } from '../../../utils/helpers';

interface TaskCardModalProps {
  open: boolean;
  boardId: string;
  columnId: string | null;
  editCard: Card | null;
  existingTags: Tag[];
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const PRIORITY_LABELS: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' };

function buildInitialForm(editCard: Card | null) {
  if (editCard) {
    return {
      title: editCard.title,
      description: editCard.description,
      priority: editCard.priority,
      dueDate: editCard.dueDate,
      tags: editCard.tags,
    };
  }
  return {
    title: '',
    description: '',
    priority: 'medium' as Priority,
    dueDate: null as string | null,
    tags: [] as Tag[],
  };
}

interface CardFormProps {
  boardId: string;
  columnId: string | null;
  editCard: Card | null;
  existingTags: Tag[];
  onClose: () => void;
}

function CardForm({ boardId, columnId, editCard, existingTags, onClose }: CardFormProps) {
  const apolloClient = useApolloClient();
  const [createCard] = useMutation(CREATE_CARD_MUTATION);
  const [updateCard] = useMutation(UPDATE_CARD_MUTATION);
  const [createTag] = useMutation(CREATE_TAG_MUTATION);
  const [form, setForm] = useState(() => buildInitialForm(editCard));
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length > 100) errs.title = 'Title must be ≤ 100 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const ensurePersistedTags = async () => {
    const existingByLabel = new Map(existingTags.map((tag) => [tag.label.toLowerCase(), tag]));
    const resolved: Tag[] = [];
    for (const tag of form.tags) {
      if (tag.id.startsWith('local:')) {
        const existing = existingByLabel.get(tag.label.toLowerCase());
        if (existing) {
          resolved.push(existing);
        } else {
          const result = await createTag({
            variables: { input: { boardId, label: tag.label, color: tag.color } },
          });
          const created = (result.data as { createTag?: GqlTag } | undefined)?.createTag;
          if (created) resolved.push(toClientTag(created));
        }
      } else {
        resolved.push(tag);
      }
    }
    return resolved;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const tags = await ensurePersistedTags();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: toServerPriority(form.priority),
      dueDate: form.dueDate,
      tagIds: tags.map((tag) => tag.id),
    };
    if (editCard) {
      await updateCard({ variables: { input: { id: editCard.id, ...payload } } });
    } else if (columnId) {
      await createCard({ variables: { input: { columnId, ...payload } } });
    }
    await apolloClient.refetchQueries({ include: 'active' });
    onClose();
  };

  const addTag = () => {
    const label = tagInput.trim();
    if (!label) return;
    if (form.tags.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      setTagInput('');
      return;
    }
    setForm((f) => ({
      ...f,
      tags: [...f.tags, { id: `local:${label.toLowerCase()}`, label, color: randomTagColor() }],
    }));
    setTagInput('');
  };

  const removeTag = (tagId: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t.id !== tagId) }));

  return (
    <>
      <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <AppInput
          label="Title *"
          value={form.title}
          onChange={(e) => {
            setForm((f) => ({ ...f, title: e.target.value }));
            if (errors.title) setErrors({});
          }}
          error={Boolean(errors.title)}
          helperText={errors.title ?? `${form.title.length}/100`}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          autoFocus
        />

        <AppInput
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          multiline
          minRows={3}
          maxRows={6}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={form.priority}
              label="Priority"
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              sx={{ borderRadius: 2 }}
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PRIORITY_COLORS[p] }} />
                    {PRIORITY_LABELS[p]}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="Due date"
            value={form.dueDate ? dayjs(form.dueDate) : null}
            onChange={(val: Dayjs | null) =>
              setForm((f) => ({ ...f, dueDate: val?.isValid() ? val.toISOString() : null }))
            }
            slotProps={{
              textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } },
              actionBar: { actions: ['clear', 'today'] },
            }}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <AppInput
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              sx={{ maxWidth: 220 }}
            />
            <Button size="small" variant="outlined" onClick={addTag} sx={{ borderRadius: 2, textTransform: 'none', whiteSpace: 'nowrap' }}>
              Add Tag
            </Button>
          </Box>
          {form.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
              {form.tags.map((tag) => (
                <TagChip key={tag.id} tag={tag} size="medium" onDelete={() => removeTag(tag.id)} />
              ))}
            </Box>
          )}
          {form.tags.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              No tags added
            </Typography>
          )}
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={handleSubmit} disableElevation sx={{ borderRadius: 2, minWidth: 90 }}>
          {editCard ? 'Save Changes' : 'Create Card'}
        </Button>
      </DialogActions>
    </>
  );
}

export function TaskCardModal({ open, boardId, columnId, editCard, existingTags, onClose }: TaskCardModalProps) {
  const formKey = editCard?.id ?? columnId ?? 'new';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editCard ? 'Edit Card' : 'New Card'}
        </DialogTitle>
        <Divider />
        {open && (
          <CardForm
            key={formKey}
            boardId={boardId}
            columnId={columnId}
            editCard={editCard}
            existingTags={existingTags}
            onClose={onClose}
          />
        )}
      </Dialog>
    </LocalizationProvider>
  );
}
