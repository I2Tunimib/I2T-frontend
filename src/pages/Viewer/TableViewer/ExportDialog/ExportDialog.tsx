import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel
} from '@material-ui/core';
import { selectCurrentTable, selectExportDialogStatus } from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { convertToW3C } from '@store/slices/table/table.thunk';
import fileDownload from 'js-file-download';
import { FC, useState } from 'react';

interface ExportDialogProps {}

const ExportDialog: FC<ExportDialogProps> = () => {
  const [keepMatching, setKeepMatching] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectExportDialogStatus);
  const { name } = useAppSelector(selectCurrentTable);

  const handleClose = () => {
    dispatch(updateUI({ openExportDialog: false }));
  };

  const handleConfirm = () => {
    dispatch(convertToW3C(keepMatching))
      .unwrap()
      .then((data) => {
        fileDownload(JSON.stringify(data, null, 2), `${name}.json`);
      });
    dispatch(updateUI({ openExportDialog: false }));
  };

  const handleChange = () => {
    setKeepMatching((state) => !state);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
    >
      <DialogTitle>Export table</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Export the annotated table in the W3C standard format.
        </DialogContentText>
        <FormControlLabel
          control={<Checkbox checked={keepMatching} onChange={handleChange} />}
          label="Keep only matching metadata"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
