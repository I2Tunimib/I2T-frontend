import { ButtonLoading } from '@components/core';
import { useAppDispatch } from '@hooks/store';
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle, Typography
} from '@material-ui/core';
import DescriptionTwoToneIcon from '@material-ui/icons/DescriptionTwoTone';
import { detectDelimiter } from '@services/utils/detect-delimiter';
import { FileFormat } from '@store/slices/table/interfaces/table';
import { updateUI } from '@store/slices/tables/tables.slice';
import {
  FC, useState,
  useEffect
} from 'react';
import { useForm } from 'react-hook-form';
import { uploadTable } from '@store/slices/tables/tables.thunk';
import { nanoid } from 'nanoid';
import FormArray from './FormArray';
import {
  FormFile,
  FormState
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
  name: string;
  format: FileFormat;
}

const UploadDialog: FC<UploadDialogProps> = ({
  open,
  files,
  onNewUploadRequest
}) => {
  const {
    handleSubmit,
    control,
    register
  } = useForm<FormState>({
    shouldUnregister: true
  });
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const dispatch = useAppDispatch();

  const processFiles = async (rawFiles: File[]) => {
    return Promise.all(rawFiles.map(async (file) => {
      const splittedName = file.name.split('.');
      const format = splittedName[splittedName.length - 1] as FileFormat;
      const name = splittedName.slice(0, splittedName.length - 1).join('');
      const separator = format === 'csv' ? await detectDelimiter(file) : '';
      return {
        original: file,
        name,
        format,
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

  // const getFileToDispatch = ({ files: formFiles }: FormState) => {
  //   const filesToDispatch = formFiles.map((formFile) => ({
  //     name: formFile.fileName,
  //     original: formFile.original,
  //     type: (formFile.type as unknown) as TableType,
  //     meta: {
  //       format: formFile.fileExtension,
  //       separator: formFile.separator
  //     }
  //   }));

  //   return {
  //     table: filesToDispatch.length > 1 ? filesToDispatch : filesToDispatch[0]
  //   };
  // };

  const uploadFiles = (formFiles: FormFile[]) => {
    formFiles.forEach(({ original, ...meta }, index) => {
      const formData = new FormData();
      formData.append('file', original);
      formData.append('meta', JSON.stringify(meta));
      const requestId = nanoid();
      const request = dispatch(uploadTable({
        formData,
        requestId,
        name: meta.name
      }));
      onNewUploadRequest(request, requestId);
    });
  };

  const onSubmit = (data: FormState) => {
    const { files: selectedFiles } = data;

    // upload tables
    uploadFiles(selectedFiles);
    dispatch(updateUI({
      uploadDialogOpen: false
    }));
    dispatch(updateUI({
      uploadProgressDialogOpen: true
    }));

    // if (challengeTable) {
    //   if (selectedFiles.length > 1) {
    //     if (action === ActionType.LOAD) {
    //       // load challenge table in table viewer
    //       dispatch(loadUpTable(getFileToDispatch(data)));
    //       dispatch(updateUI({
    //         uploadDialogOpen: false
    //       }));
    //       history.push(`/table/${selectedFiles[0].fileName}?draft=true`);
    //     } else {
    //       // upload challenge table
    //     }
    //   }
    // } else {
    //   if (action === ActionType.LOAD) {
    //     if (selectedFiles.length === 1) {
    //       // load table locally
    //       dispatch(loadUpTable(getFileToDispatch(data)));
    //       dispatch(updateUI({
    //         uploadDialogOpen: false
    //       }));
    //       history.push(`/table/${selectedFiles[0].fileName}?draft=true`);
    //     } else {
    //       // error
    //     }
    //   } else {

    //   }
    // }
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
            Upload raw or annotated tables to the server.
          </DialogContentText>
          <FormArray {...{
            files: processedFiles,
            control,
            register
          }} />
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
