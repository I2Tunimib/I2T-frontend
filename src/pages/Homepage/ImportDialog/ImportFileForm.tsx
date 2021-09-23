import { useAppDispatch } from '@hooks/store';
import {
  Button, InputAdornment,
  MenuItem, TextField
} from '@material-ui/core';
import { CsvSeparator, FileFormat } from '@store/slices/table/interfaces/table';
import { importTable, uploadTable } from '@store/slices/tables/tables.thunk';
import { nanoid } from 'nanoid';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { ChallengeTableType, NormalTableType, SelectOption } from '../UploadDialog/interfaces/form';
import { ProcessedFile } from './ImportDialog';
import styles from './ImportFileForm.module.scss';

interface ImportFileFormProps {
  file: ProcessedFile;
}

interface FormState {
  name: string;
  type: NormalTableType;
  format: FileFormat;
  original: File;
  separator?: string;
}

const selectSeparatorOptions: SelectOption<CsvSeparator>[] = [
  { label: 'Tab', value: CsvSeparator.TAB },
  { label: ',', value: CsvSeparator.COMMA },
  { label: ';', value: CsvSeparator.SEMICOLON }
];

const selectNormalTableTypesOptions: SelectOption<NormalTableType>[] = [
  { label: 'Raw', value: NormalTableType.RAW },
  { label: 'Annotated', value: NormalTableType.ANNOTATED }
];

const ImportFileForm: FC<ImportFileFormProps> = ({
  file
}) => {
  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue
  } = useForm<FormState>({
    defaultValues: {
      ...file,
      type: NormalTableType.RAW
    },
    shouldUnregister: true
  });
  const history = useHistory();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setValue('original', file.original);
    setValue('format', file.format);
  }, [file]);

  const onSubmit = ({ original, ...meta }: FormState) => {
    const formData = new FormData();
    formData.append('file', original);
    formData.append('meta', JSON.stringify(meta));
    const requestId = nanoid();
    dispatch(importTable(formData))
      .unwrap()
      .then((res) => history.push(`/table/${res.id}`));
  };

  return (
    <form className={styles.Container} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.Row}>
        <TextField
          className={styles.BigTextField}
          label="File name"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {`.${file.format}`}
              </InputAdornment>
            )
          }}
          variant="outlined"
          {...register('name')} />

        {file.format === 'csv'
          ? (
            <Controller
              control={control}
              name="separator"
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
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <TextField
            fullWidth
            label="Type of table"
            size="small"
            variant="outlined"
            select
            {...field}
          >
            {selectNormalTableTypesOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        )}
      />
      <div className={styles.Buttons}>
        <Button>Cancel</Button>
        <Button type="submit" color="primary">Confirm</Button>
      </div>
    </form>
  );
};

export default ImportFileForm;
