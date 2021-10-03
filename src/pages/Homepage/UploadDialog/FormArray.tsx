import {
  InputAdornment,
  MenuItem, TextField,
  Typography, Skeleton
} from '@mui/material';
import {
  Control, Controller, FieldArrayWithId,
  useFieldArray, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch
} from 'react-hook-form';
import { FC, useEffect } from 'react';
import { enumKeys } from '@services/utils/objects-utils';
import { CsvSeparator } from '@store/slices/table/interfaces/table';
import { ProcessedFile } from './UploadDialog';
import styles from './FormArray.module.scss';
import {
  ChallengeTableType, FormState,
  NormalTableType, SelectOption
} from './interfaces/form';

interface FormArrayProps {
  files: ProcessedFile[];
  control: Control<FormState, object>;
  register: UseFormRegister<FormState>;
}

interface FileInputFormProps {
  item: FieldArrayWithId<FormState>;
  index: number;
  control: Control<FormState, object>;
  register: UseFormRegister<FormState>;
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

const selectChallengeTableTypesOptions: SelectOption<ChallengeTableType>[] = [
  { label: 'Data', value: ChallengeTableType.DATA },
  { label: 'CEA', value: ChallengeTableType.CEA },
  { label: 'CPA', value: ChallengeTableType.CPA },
  { label: 'CTA', value: ChallengeTableType.CTA }
];

/**
 * Form fields for each file.
 */
const FileInputForm: FC<FileInputFormProps> = ({
  item,
  index,
  control,
  register
}) => {
  return (
    <>
      <div className={styles.FormRow}>
        <TextField
          className={styles.BigTextField}
          label="File name"
          size="small"
          defaultValue={item.name}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {`.${item.format}`}
              </InputAdornment>
            )
          }}
          variant="outlined"
          {...register(`files.${index}.name`)} />

        {item.format === 'csv'
          ? (
            <Controller
              control={control}
              name={`files.${index}.separator`}
              defaultValue={item.separator}
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
        name={`files.${index}.type`}
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
    </>
  );
};

const SkeletonForm = () => {
  return (
    <div className={styles.FormSkeletonContainer}>
      {[1, 2, 3].map((item) => (
        <div key={item} className={styles.FormSkeletonItem}>
          <Skeleton height={20} width={40} />
          <div className={styles.FormSkeletonRow}>
            <Skeleton height={60} />
            <Skeleton height={60} width={60} />
          </div>
        </div>
      ))}

    </div>
  );
};

const FormArray: FC<FormArrayProps> = ({
  files,
  control,
  register
}) => {
  const {
    fields,
    append
  } = useFieldArray({
    control,
    name: 'files',
    shouldUnregister: true
  });

  useEffect(() => {
    files.forEach((file) => {
      append({ ...file, type: NormalTableType.RAW });
    });
  }, [files]);

  return (
    <div className={styles.Container}>
      {files.length > 0
        ? (
          <>
            {fields.map((item, index) => (
              <div key={index} className={styles.FormArrayItem}>
                <Typography variant="subtitle2">{`Table ${index + 1}`}</Typography>
                <FileInputForm {...{
                  item,
                  index,
                  control,
                  register
                }}
                />
              </div>
            ))}
          </>
        )
        : (
          <SkeletonForm />
        )
      }
    </div>
  );
};

export default FormArray;
