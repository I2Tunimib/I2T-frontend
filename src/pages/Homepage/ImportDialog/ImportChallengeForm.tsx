import {
  Button, InputAdornment,
  MenuItem, TextField, Typography
} from '@material-ui/core';
import { CsvSeparator, FileFormat } from '@store/slices/table/interfaces/table';
import {
  ChangeEvent, FC,
  useEffect, useState
} from 'react';
import {
  Control, Controller,
  useForm, UseFormRegister
} from 'react-hook-form';
import { enumKeys } from '@services/utils/objects-utils';
import { detectDelimiter } from '@services/utils/detect-delimiter';
import { useAppDispatch } from '@hooks/store';
import { importTable } from '@store/slices/tables/tables.thunk';
import { useHistory } from 'react-router-dom';
import { ChallengeTableType, SelectOption } from '../UploadDialog/interfaces/form';
import { ProcessedFile } from './ImportDialog';
import styles from './ImportChallengeForm.module.scss';

interface ImportChallengeFormProps {
  files: ProcessedFile[];
  getPermittedFiles: (fileList: FileList | null) => File[];
}

interface FileInputFormProps {
  name: keyof FormState;
  file?: ProcessedFile;
  control: Control<FormState, object>;
  register: UseFormRegister<FormState>;
  handleFileChange: (file: ProcessedFile, type: ChallengeTableType) => void;
  getPermittedFiles: (fileList: FileList | null) => File[];
}

interface FormState {
  data: FormFile;
  cea: FormFile;
  cpa: FormFile;
  cta: FormFile;
}

interface FormFile {
  name: string;
  format: FileFormat;
  separator?: CsvSeparator;
  original: File;
}

const selectSeparatorOptions: SelectOption<CsvSeparator>[] = [
  { label: 'Tab', value: CsvSeparator.TAB },
  { label: ',', value: CsvSeparator.COMMA },
  { label: ';', value: CsvSeparator.SEMICOLON }
];

const FileInputForm: FC<FileInputFormProps> = ({
  name,
  file,
  handleFileChange,
  getPermittedFiles,
  control,
  register
}) => {
  const processFile = async (rawFile: File) => {
    const splittedName = rawFile.name.split('.');
    const format = splittedName[splittedName.length - 1] as FileFormat;
    const fileName = splittedName.slice(0, splittedName.length - 1).join('');
    const separator = format === 'csv' ? await detectDelimiter(rawFile) : undefined;
    return {
      original: rawFile,
      name: fileName,
      format,
      separator
    };
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const permittedFiles = getPermittedFiles(files);
    if (permittedFiles.length === 1) {
      const procFile = await processFile(permittedFiles[0]);
      handleFileChange(procFile, name as ChallengeTableType);
    }
  };

  return (
    <>
      <Typography variant="subtitle2">{name.toUpperCase()}</Typography>
      {file ? (
        <div className={styles.FormRow}>
          <TextField
            className={styles.BigTextField}
            label="File name"
            size="small"
            defaultValue={file.name}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {`.${file.format}`}
                </InputAdornment>
              )
            }}
            variant="outlined"
            {...register(`${name}.name`)} />

          {file.format === 'csv'
            ? (
              <Controller
                control={control}
                name={`${name}.separator`}
                defaultValue={file.separator}
                render={({ field }) => (
                  <TextField
                    className={styles.FillRemaining}
                    size="small"
                    label="Separator"
                    variant="outlined"
                    select
                    {...field}
                  >
                    {selectSeparatorOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )
            : null}
        </div>
      ) : <Typography color="textSecondary" variant="body2">No file selected</Typography>}
      <Button
        className={styles.ButtonSelect}
        size="small"
        component="label"
        color="primary"
        variant="outlined">
        Select file
        <input
          type="file"
          onChange={onFileChange}
          hidden
        />
      </Button>
    </>
  );
};

interface ProcessedFileState {
  name: ChallengeTableType;
  file?: ProcessedFile;
}

const ImportChallengeForm: FC<ImportChallengeFormProps> = ({
  files,
  getPermittedFiles
}) => {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileState[]>([]);
  const {
    handleSubmit, control,
    register, setValue
  } = useForm<FormState>({
    shouldUnregister: true
  });
  const history = useHistory();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (files.length > 0) {
      const dataFile = {
        name: ChallengeTableType.DATA,
        file: files[0] as ProcessedFile
      };
      setValue('data', files[0]);
      const annotationFiles = enumKeys(ChallengeTableType).filter((key) => key !== 'DATA').map((key) => ({
        name: ChallengeTableType[key]
      }));
      setProcessedFiles([dataFile, ...annotationFiles]);
    }
  }, [files]);

  const handleFileChange = (file: ProcessedFile, type: ChallengeTableType) => {
    setProcessedFiles((state) => {
      return state.map((procFile) => {
        if (procFile.name === type) {
          return {
            ...procFile,
            file: {
              ...file
            }
          };
        }
        return { ...procFile };
      });
    });
    setValue(type as keyof FormState, file);
  };

  const onSubmit = (form: FormState) => {
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      const k = key as keyof FormState;
      const { original, ...rest } = form[k];
      formData.append(key, original);
      formData.append(`${key}Meta`, JSON.stringify({ ...rest }));
    });
    const meta = {
      name: form.data.name,
      type: 'challenge'
    };
    formData.append('meta', JSON.stringify(meta));
    dispatch(importTable(formData))
      .unwrap()
      .then((res) => history.push(`/table/${res.id}`));
  };

  return (
    <form className={styles.Container} onSubmit={handleSubmit(onSubmit)}>
      {processedFiles.map(({ name, file }) => (
        <FileInputForm
          key={name}
          name={name}
          getPermittedFiles={getPermittedFiles}
          handleFileChange={handleFileChange}
          {...{ file, control, register }}
        />
      ))}
      <div className={styles.Buttons}>
        <Button>Cancel</Button>
        <Button type="submit" color="primary">Confirm</Button>
      </div>
    </form>
  );
};

export default ImportChallengeForm;
