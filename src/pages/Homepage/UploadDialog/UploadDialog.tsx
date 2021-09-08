import { ButtonLoading } from '@components/core';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle, InputAdornment, MenuItem, TextField, Typography
} from '@material-ui/core';
import DescriptionTwoToneIcon from '@material-ui/icons/DescriptionTwoTone';
import { CsvSeparator } from '@services/converters/csv-converter';
import { detectDelimiter } from '@services/utils/detect-delimiter';
import { updateCurrentTable } from '@store/slices/table/table.slice';
import { selectIsUploadDialogOpen } from '@store/slices/tables/tables.selectors';
import { updateUI } from '@store/slices/tables/tables.slice';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import styles from './UploadDialog.module.scss';

interface UploadDialogProps {
  file: {
    file: File;
    fileName: string;
    fileExtension: string;
    content: string;
  } | undefined;
}

const SELECT_SEP_OPTIONS = [
  { label: 'Tab', value: '\t', tag: CsvSeparator.TAB },
  { label: ',', value: ',', tag: CsvSeparator.COMMA },
  { label: ';', value: ';', tag: CsvSeparator.SEMICOLUMN }
];

const SELECT_TABLE_TYPE_OPTIONS = [
  { label: 'Raw table', value: 'raw' },
  { label: 'Annotated table', value: 'annotated' },
  { label: 'Challenge table', value: 'challenge' }
];

const SELECT_ACTION_TYPE_OPTIONS = [
  { label: 'Upload to server', value: 'upload' },
  { label: 'Load in table viewer', value: 'load' }
];

const UploadDialog: FC<UploadDialogProps> = ({
  file
}) => {
  const dispatch = useAppDispatch();
  const isUploadDialogOpen = useAppSelector(selectIsUploadDialogOpen);
  const history = useHistory();

  const {
    handleSubmit,
    control,
    register,
    setValue
  } = useForm();

  useEffect(() => {
    if (file && file.fileExtension === 'csv' && file.content) {
      const delimiter = detectDelimiter(file.content)[0];
      if (delimiter) {
        const optionSep = SELECT_SEP_OPTIONS.find((option) => option.value === delimiter);
        const separator = optionSep ? optionSep.label : 'Tabs';
        setValue('tableSeparator', separator);
      }
    }
  }, [file]);

  const handleClose = () => {
    dispatch(updateUI({
      uploadDialogOpen: false
    }));
  };

  const onSubmit = (data: any) => {
    const action = SELECT_ACTION_TYPE_OPTIONS
      .find((actionOption) => data.tableAction === actionOption.label);

    if (action) {
      if (action.value === 'upload') {
        // upload table on server
      } else {
        // load table locally
        if (file) {
          const type = SELECT_TABLE_TYPE_OPTIONS
            .find((typeOption) => data.tableType === typeOption.label);
          const separator = SELECT_SEP_OPTIONS
            .find((sepOption) => data.tableSeparator === sepOption.label);
          dispatch(updateCurrentTable({
            name: data.tableName,
            content: file.content,
            format: file.fileExtension,
            separator: separator ? separator.tag : CsvSeparator.COMMA,
            type: type ? type.value : ''
          }));
          dispatch(updateUI({
            uploadDialogOpen: false
          }));
          history.push(`/table/${data.tableName}?draft=true`);
        }
      }
    }
  };

  return (
    <Dialog
      open={isUploadDialogOpen}
      onClose={handleClose}
    >
      <DialogTitle disableTypography className={styles.DialogTitle}>
        <DescriptionTwoToneIcon />
        <Typography variant="h6">Upload tables</Typography>
      </DialogTitle>
      <form className={styles.Form} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogContentText>
            Upload or directly view your table.
          </DialogContentText>
          <div className={styles.Container}>
            <div className={styles.FormRow}>
              <TextField
                className={styles.TextField}
                id="outlined-basic"
                label="File name"
                defaultValue={file && file.fileName}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{file && `.${file.fileExtension}`}</InputAdornment>
                }}
                variant="outlined"
                {...register('tableName')} />
              {file && file.fileExtension === 'csv'
                ? (
                  <Controller
                    control={control}
                    name="tableSeparator"
                    defaultValue="Tabs"
                    render={({ field }) => (
                      <TextField
                        className={styles.TextField}
                        disabled={file && file.fileExtension !== 'csv'}
                        label="Separator"
                        variant="outlined"
                        select
                        helperText="Separator is detected automatically"
                        {...field}
                      >
                        {SELECT_SEP_OPTIONS.map((option) => (
                          <MenuItem key={option.label} value={option.label}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                ) : null
              }
            </div>
            <div className={styles.FormRow}>
              <TextField
                fullWidth
                defaultValue="Raw table"
                label="Type of table"
                variant="outlined"
                select
                {...register('tableType')}
              >
                {SELECT_TABLE_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>
                ))}
              </TextField>
            </div>
            <div className={styles.FormRow}>
              <TextField
                fullWidth
                label="Action"
                defaultValue="Load in table viewer"
                variant="outlined"
                select
                {...register('tableAction')}
              >
                {SELECT_ACTION_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>
                ))}
              </TextField>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <ButtonLoading type="submit" loading={false}>
            Confirm
          </ButtonLoading>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UploadDialog;
