import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { selectCurrentDataset, selectIsUploadTableDialogOpen, selectUploadDatasetStatus } from '@store/slices/datasets/datasets.selectors';
import { updateUI } from '@store/slices/datasets/datasets.slice';
//import { LoadingButton } from '@mui/lab';
import {
  ChangeEvent, useState,
  FocusEvent, useRef
} from 'react';
import { uploadTable } from '@store/slices/datasets/datasets.thunk';
import { useParams } from 'react-router-dom';

type ErrorState = Record<string, string>;

const supportedFormats = ['csv', 'json'];

const UploadTable = () => {
  const [tableName, setTableName] = useState<string>('');
  const [tableFile, setTableFile] = useState<File>();
  const [error, setError] = useState<ErrorState>({});
  const ref = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsUploadTableDialogOpen);
  const currentDataset = useAppSelector(selectCurrentDataset);
  const { loading, error: uploadError } = useAppSelector(selectUploadDatasetStatus);

  const handleClose = () => {
    dispatch(updateUI({ uploadTableDialogOpen: false }));
  };

  const handleConfirm = () => {
    if (!tableName) {
      setError((old) => ({ ...old, name: 'A name must be set' }));
    }
    if (!tableFile) {
      setError((old) => ({ ...old, file: 'A file must be selected' }));
    }
    if (tableName && tableFile) {
      const formData = new FormData();
      formData.append('file', tableFile);
      formData.append('name', tableName);

      dispatch(uploadTable({ formData, datasetId: currentDataset.id }))
        .unwrap()
        .then(() => {
          handleClose();
        });
    }
  };

  const handleNameChange = (event: FocusEvent<HTMLInputElement>) => {
    setTableName(event.target.value);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length === 1) {
      const file = files[0];
      const splittedName = file.name.split('.');

      if (supportedFormats.includes(splittedName[splittedName.length - 1])) {
        if (tableName === '') {
          setTableName(splittedName[0]);
        }
        setTableFile(files[0]);
      }
    }
    if (ref && ref.current) {
      ref.current.value = '';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
    >
      <DialogTitle>Add table</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <p>
            Select a table to upload.
            Please refer to the
            <b> (?) </b>
            for more information about the supported table formats.
          </p>
        </DialogContentText>
        <Stack padding="10px 0" gap="10px">
          <TextField
            error={!!error.name}
            helperText={error.name}
            value={tableName}
            onChange={handleNameChange}
            label="Table name"
            variant="outlined" />
          <Stack direction="row" alignItems="center" gap="10px">
            <Button
              sx={{
                alignSelf: 'flex-start',
                textTransform: 'none'
              }}
              size="medium"
              component="label"
              color="primary"
              variant="contained">
              Select file (.csv or .json)
              <input
                ref={ref}
                type="file"
                onChange={handleFileChange}
                multiple
                hidden
              />
            </Button>
            {tableFile && <Typography>{tableFile.name}</Typography>}
          </Stack>
          {uploadError && <Typography color="error">{uploadError.message}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button loading={loading && !uploadError} disabled={!tableFile || tableName === ''} color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadTable;
