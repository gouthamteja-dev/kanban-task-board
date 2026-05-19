import TextField, { type TextFieldProps } from '@mui/material/TextField';

export function AppInput(props: TextFieldProps) {
  return (
    <TextField
      size="small"
      fullWidth
      variant="outlined"
      {...props}
    />
  );
}
