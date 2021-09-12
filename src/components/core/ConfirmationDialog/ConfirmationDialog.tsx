import {
  Button, ButtonProps, Dialog,
  DialogActions, DialogContent,
  DialogContentText, DialogProps,
  DialogTitle
} from '@material-ui/core';
import { FC } from 'react';

export interface ConfirmationDialogProps extends DialogProps {
  content: string;
  actions: ActionButton[];
  title?: string;
}

export interface ActionButton {
  label: string;
  callback: () => void;
  buttonProps?: ButtonProps;
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  content,
  actions,
  title,
  ...props
}) => {
  return (
    <Dialog {...props}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <DialogContentText>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {actions.map(({ label, callback, buttonProps }) => (
          <Button key={label} onClick={callback} {...buttonProps}>
            {label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
