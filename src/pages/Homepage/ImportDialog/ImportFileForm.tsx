import { useAppDispatch } from '@hooks/store';
import {
  Button, InputAdornment,
  MenuItem, TextField
} from '@material-ui/core';
import { CsvSeparator } from '@services/converters/csv-converter';
import { importTable } from '@store/slices/table/table.thunk';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ChallengeTableType, NormalTableType, SelectOption } from '../UploadDialog/interfaces/form';
import { ProcessedFile } from './ImportDialog';
import styles from './ImportFileForm.module.scss';

interface ImportFileFormProps {
  file: ProcessedFile;
}

interface FormState {
  fileName: string;
  type: NormalTableType;
  original: File;
  separator?: string;
}

const selectSeparatorOptions: SelectOption<CsvSeparator>[] = [
  { label: 'Tab', value: CsvSeparator.TAB },
  { label: ',', value: CsvSeparator.COMMA },
  { label: ';', value: CsvSeparator.SEMICOLUMN }
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
    setValue
  } = useForm<FormState>({
    defaultValues: {
      ...file,
      type: NormalTableType.RAW
    },
    shouldUnregister: true
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    setValue('original', file.original);
  }, [file]);

  const onSubmit = (data: FormState) => {
    const { original, ...meta } = data;
    const formData = new FormData();
    formData.append('file', original);
    formData.append('meta', JSON.stringify(meta));
    dispatch(importTable(formData));
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
                {`.${file.fileExtension}`}
              </InputAdornment>
            )
          }}
          variant="outlined"
          {...register('fileName')} />

        {file.fileExtension === 'csv'
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
