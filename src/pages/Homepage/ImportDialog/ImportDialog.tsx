import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  Dialog, DialogContent, DialogContentText,
  DialogTitle, Typography
} from '@material-ui/core';
import { detectDelimiter } from '@services/utils/detect-delimiter';
import { CsvSeparator, FileFormat } from '@store/slices/table/interfaces/table';
import { selectIsImportDialogOpen } from '@store/slices/tables/tables.selectors';
import { updateUI } from '@store/slices/tables/tables.slice';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ImportChallengeForm from './ImportChallengeForm';
import styles from './ImportDialog.module.scss';
import ImportFileForm from './ImportFileForm';

interface ImportDialogProps {
  open: boolean;
  files: File[] | null;
  getPermittedFiles: (fileList: FileList | null) => File[];
}

export interface ProcessedFile {
  original: File;
  name: string;
  format: FileFormat;
  separator?: CsvSeparator;
}

const ImportDialog: FC<ImportDialogProps> = ({
  open,
  files,
  getPermittedFiles
}) => {
  const [isChallenge, setIsChallenge] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(updateUI({
      importDialogOpen: false
    }));
  };

  const processFiles = async (rawFiles: File[]) => {
    return Promise.all(rawFiles.map(async (file) => {
      const splittedName = file.name.split('.');
      const format = splittedName[splittedName.length - 1] as FileFormat;
      const name = splittedName.slice(0, splittedName.length - 1).join('');
      const separator = format === 'csv' ? await detectDelimiter(file) : undefined;
      return {
        original: file,
        name,
        format,
        separator
      };
    }));
  };

  useEffect(() => {
    if (files !== null) {
      (async () => {
        setProcessedFiles(await processFiles(files));
      })();
    }
  }, [files]);

  // const onSubmit = (data: FormState) => {
  //   console.log(data);
  // };

  return (
    <Dialog
      open={open}
      onClose={handleClose}>
      <DialogTitle disableTypography>
        <Typography variant="h6">Import table</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Import a raw or annotated table in the table viewer.
        </DialogContentText>
        <div className={styles.FormContainer}>
          <Button onClick={() => setIsChallenge((state) => !state)} size="small" color="primary" className={styles.ButtonAdd} variant="outlined">
            {isChallenge ? 'Remove annotations' : 'Add challenge table annotations'}
          </Button>
          {isChallenge
            ? (
              <ImportChallengeForm
                getPermittedFiles={getPermittedFiles}
                files={processedFiles}
              />
            )
            : [
              processedFiles.length > 0 ? <ImportFileForm file={processedFiles[0]} /> : null
            ]}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ImportDialog;
