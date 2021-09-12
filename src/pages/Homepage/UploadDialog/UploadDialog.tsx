import { ButtonLoading } from '@components/core';
import { useAppDispatch } from '@hooks/store';
import {
  Button, Checkbox, Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle, Divider, FormControlLabel,
  MenuItem, TextField, Tooltip, Typography, withStyles
} from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import DescriptionTwoToneIcon from '@material-ui/icons/DescriptionTwoTone';
import { detectDelimiter } from '@services/utils/detect-delimiter';
import { FileFormat, TableType } from '@store/slices/table/interfaces/table';
import { loadUpTable } from '@store/slices/table/table.thunk';
import { updateUI } from '@store/slices/tables/tables.slice';
import {
  FC, useState,
  useEffect
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { uploadTable } from '@store/slices/tables/tables.thunk';
import { nanoid } from 'nanoid';
import FormArray from './FormArray';
import {
  ActionType,
  FormFile,
  FormState, SelectOption
} from './interfaces/form';
import styles from './UploadDialog.module.scss';

interface UploadDialogProps {
  open: boolean;
  files: File[];
  onNewUploadRequest: (request: any, id: string) => void;
}

/**
 * Processed file.
 */
export interface ProcessedFile {
  original: File;
  fileName: string;
  fileExtension: FileFormat;
}

const selectActionTypeOptions: SelectOption<ActionType>[] = [
  { label: 'Upload to server', value: ActionType.UPLOAD },
  { label: 'Load in table viewer', value: ActionType.LOAD }
];

const FormTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  }
}))(Tooltip);

const UploadDialog: FC<UploadDialogProps> = ({
  open,
  files,
  onNewUploadRequest
}) => {
  const {
    handleSubmit,
    control,
    register,
    setValue,
    getValues,
    watch
  } = useForm<FormState>({
    defaultValues: {
      challengeTable: false
    },
    shouldUnregister: true
  });
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const watchChallengeTable = watch('challengeTable', false);

  const processFiles = async (rawFiles: File[]) => {
    return Promise.all(rawFiles.map(async (file) => {
      const splittedName = file.name.split('.');
      const fileExtension = splittedName[splittedName.length - 1] as FileFormat;
      const fileName = splittedName.slice(0, splittedName.length - 1).join('');
      const separator = fileExtension === 'csv' ? await detectDelimiter(file) : '';
      return {
        original: file,
        fileName,
        fileExtension,
        separator
      };
    }));
  };

  useEffect(() => {
    (async () => {
      setProcessedFiles(await processFiles(files));
    })();
  }, [files]);

  const handleClose = () => {
    dispatch(updateUI({
      uploadDialogOpen: false
    }));
  };

  const getFileToDispatch = ({ files: formFiles, challengeTable }: FormState) => {
    const filesToDispatch = formFiles.map((formFile) => ({
      name: formFile.fileName,
      original: formFile.original,
      type: (formFile.type as unknown) as TableType,
      meta: {
        format: formFile.fileExtension,
        separator: formFile.separator
      }
    }));

    return {
      table: filesToDispatch.length > 1 ? filesToDispatch : filesToDispatch[0],
      challenge: challengeTable
    };
  };

  const uploadFiles = (formFiles: FormFile[]) => {
    formFiles.forEach(({ original, ...meta }, index) => {
      const formData = new FormData();
      formData.append('file', original);
      formData.append('meta', JSON.stringify(meta));
      const requestId = nanoid();
      const request = dispatch(uploadTable({
        formData,
        requestId,
        fileName: meta.fileName
      }));
      onNewUploadRequest(request, requestId);
    });
  };

  const onSubmit = (data: FormState) => {
    const { action, challengeTable, files: selectedFiles } = data;

    if (challengeTable) {
      if (selectedFiles.length > 1) {
        if (action === ActionType.LOAD) {
          // load challenge table in table viewer
          dispatch(loadUpTable(getFileToDispatch(data)));
          dispatch(updateUI({
            uploadDialogOpen: false
          }));
          history.push(`/table/${selectedFiles[0].fileName}?draft=true`);
        } else {
          // upload challenge table
        }
      }
    } else {
      if (action === ActionType.LOAD) {
        if (selectedFiles.length === 1) {
          // load table locally
          dispatch(loadUpTable(getFileToDispatch(data)));
          dispatch(updateUI({
            uploadDialogOpen: false
          }));
          history.push(`/table/${selectedFiles[0].fileName}?draft=true`);
        } else {
          // error
        }
      } else {
        // upload tables
        uploadFiles(data.files);
        dispatch(updateUI({
          uploadDialogOpen: false
        }));
        dispatch(updateUI({
          uploadProgressDialogOpen: true
        }));
      }
    }
  };

  return (
    <Dialog
      open={open}
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
            <Controller
              control={control}
              name="action"
              defaultValue={files.length > 1 ? ActionType.UPLOAD : ActionType.LOAD}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label="Action"
                  variant="outlined"
                  size="small"
                  select
                  {...field}
                >
                  {selectActionTypeOptions.map((option) => (
                    <MenuItem
                      disabled={
                        option.value === ActionType.LOAD
                        && processedFiles.length > 1
                        && !watchChallengeTable}
                      key={option.label}
                      value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <div className={styles.FormRowSmallGap}>
              <FormControlLabel
                disabled={processedFiles.length < 2}
                control={(
                  <Checkbox
                    color="primary"
                    {...register('challengeTable')}
                  />
                )}
                label="Challenge table"
              />
              <FormTooltip placement="right" title="A challenge table requires at least two files.">
                <InfoOutlinedIcon className={styles.Icon} />
              </FormTooltip>
            </div>
            <Divider />
            <FormArray {...{
              files: processedFiles,
              control,
              register,
              watch,
              setValue,
              getValues
            }} />
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
