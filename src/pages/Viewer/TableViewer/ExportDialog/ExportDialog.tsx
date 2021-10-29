import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import { selectCurrentTable, selectExportDialogStatus } from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { convertToW3C, exportTable } from '@store/slices/table/table.thunk';
import fileDownload from 'js-file-download';
import { FC, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface ExportDialogProps { }

const ExportDialog: FC<ExportDialogProps> = () => {
  // const [keepMatching, setKeepMatching] = useState<boolean>(false);
  const [format, setFormat] = useState<string>('');
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectExportDialogStatus);
  const { datasetId, tableId } = useParams<{ datasetId: string, tableId: string }>();
  const { name: tableName } = useAppSelector(selectCurrentTable);
  const { API } = useAppSelector(selectAppConfig);

  const handleClose = () => {
    dispatch(updateUI({ openExportDialog: false }));
  };

  useEffect(() => {
    if (API.ENDPOINTS.EXPORT && API.ENDPOINTS.EXPORT.length > 0) {
      setFormat(API.ENDPOINTS.EXPORT[0].name || '');
    }
  }, [API]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setFormat(event.target.value);
  };

  const handleConfirm = () => {
    dispatch(exportTable({
      format,
      params: { tableId, datasetId }
    }))
      .unwrap()
      .then((data) => {
        fileDownload(JSON.stringify(data, null, 2), `${tableName}.json`);
      });
    dispatch(updateUI({ openExportDialog: false }));
  };
  // const handleConfirm = () => {
  //   dispatch(convertToW3C(keepMatching))
  //     .unwrap()
  //     .then((data) => {
  //       fileDownload(JSON.stringify(data, null, 2), `${name}.json`);
  //     });
  //   dispatch(updateUI({ openExportDialog: false }));
  // };

  // const handleChange = () => {
  //   setKeepMatching((state) => !state);
  // };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
    >
      <DialogTitle>Export table</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose an export format from those available:
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: '20px' }}>
          <InputLabel id="export-label">Export format</InputLabel>
          <Select
            labelId="export-label"
            id="export-select"
            value={format}
            label="Export format"
            onChange={handleChange}
          >
            {API.ENDPOINTS.EXPORT.map(({ name, path }) => (
              <MenuItem key={path} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <FormControlLabel
          control={<Checkbox checked={keepMatching} onChange={handleChange} />}
          label="Keep only matching metadata"
        /> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
