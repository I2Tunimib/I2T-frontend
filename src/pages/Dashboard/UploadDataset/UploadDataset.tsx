import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { selectIsUploadDialogOpen, selectUploadDatasetStatus } from '@store/slices/datasets/datasets.selectors';
import { updateUI } from '@store/slices/datasets/datasets.slice';
import { LoadingButton } from '@mui/lab';
import {
  ChangeEvent, useState,
  FocusEvent, useRef
} from 'react';
import { uploadDataset } from '@store/slices/datasets/datasets.thunk';

type ErrorState = Record<string, string>;

const supportedFormats = ['zip', 'rar'];

const UploadDataset = () => {
  const [datasetName, setDatasetName] = useState<string>('');
  const [datasetFile, setDatasetFile] = useState<File>();
  const [error, setError] = useState<ErrorState>({});
  const ref = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsUploadDialogOpen);
  const { loading, error: uploadError } = useAppSelector(selectUploadDatasetStatus);

  const handleClose = () => {
    dispatch(updateUI({ uploadDialogOpen: false }));
  };

  const handleConfirm = () => {
    if (!datasetName) {
      setError((old) => ({ ...old, name: 'A name must be set' }));
    }
    if (!datasetFile) {
      setError((old) => ({ ...old, file: 'A file must be selected' }));
    }
    if (datasetName && datasetFile) {
      const formData = new FormData();
      formData.append('file', datasetFile);
      formData.append('name', datasetName);
      dispatch(uploadDataset({ formData }))
        .unwrap()
        .then(() => {
          handleClose();
        });
    }
  };

  const handleNameChange = (event: FocusEvent<HTMLInputElement>) => {
    setDatasetName(event.target.value);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length === 1) {
      const file = files[0];
      const splittedName = file.name.split('.');

      if (supportedFormats.includes(splittedName[splittedName.length - 1])) {
        setDatasetFile(files[0]);
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
      <DialogTitle>Add dataset</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <p>Select a dataset to upload (.zip or .rar).</p>
          <p>Each dataset should contain one or more tables.</p>
        </DialogContentText>
        <Stack padding="10px 0" gap="10px">
          <TextField
            error={!!error.name}
            helperText={error.name}
            value={datasetName}
            onChange={handleNameChange}
            label="Dataset name"
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
              Select file (.zip or .rar)
              <input
                ref={ref}
                type="file"
                onChange={handleFileChange}
                multiple
                hidden
              />
            </Button>
            {datasetFile && <Typography>{datasetFile.name}</Typography>}
          </Stack>
          {uploadError && <Typography color="error">{uploadError.message}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={loading && !uploadError} disabled={!datasetFile || datasetName === ''} color="primary" onClick={handleConfirm}>
          Confirm
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDataset;
