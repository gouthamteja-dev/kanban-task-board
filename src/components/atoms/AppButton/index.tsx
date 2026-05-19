import Button, { type ButtonProps } from '@mui/material/Button';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export function AppButton(props: ButtonProps) {
  return <Button variant="contained" disableElevation {...props} />;
}

interface AppIconButtonProps extends IconButtonProps {
  tooltip?: string;
}

export function AppIconButton({ tooltip, ...props }: AppIconButtonProps) {
  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton size="small" {...props} />
        </span>
      </Tooltip>
    );
  }
  return <IconButton size="small" {...props} />;
}
