import {
  InputAdornment,
  MenuItem, TextField, Typography
} from '@material-ui/core';
import {
  Control, Controller, FieldArrayWithId,
  useFieldArray, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch
} from 'react-hook-form';
import { FC, useEffect } from 'react';
import { CsvSeparator } from '@services/converters/csv-converter';
import { enumKeys } from '@services/utils/objects-utils';
import { Skeleton } from '@material-ui/lab';
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
  watch: UseFormWatch<FormState>;
  setValue: UseFormSetValue<FormState>;
  getValues: UseFormGetValues<FormState>;
}

interface FileInputFormProps {
  item: FieldArrayWithId<FormState>;
  index: number;
  watchChallengeTable: boolean;
  control: Control<FormState, object>;
  register: UseFormRegister<FormState>;
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
  watchChallengeTable,
  register
}) => {
  return (
    <>
      <div className={styles.FormRow}>
        <TextField
          className={styles.BigTextField}
          label="File name"
          size="small"
          defaultValue={item.fileName}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {`.${item.fileExtension}`}
              </InputAdornment>
            )
          }}
          variant="outlined"
          {...register(`files.${index}.fileName`)} />

        {item.fileExtension === 'csv'
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
      {watchChallengeTable ? (
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
              {selectChallengeTableTypesOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          )}
        />
      ) : (
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
      )}
    </>
  );
};

const SkeletonForm = () => {
  return (
    <div className={styles.FormSkeletonContainer}>
      {[1, 2, 3].map((item) => (
        <div key={item} className={styles.FormSkeletonRow}>
          <Skeleton height={60} />
          <Skeleton height={60} width={60} />
        </div>
      ))}

    </div>
  );
};

const FormArray: FC<FormArrayProps> = ({
  files,
  control,
  register,
  watch,
  setValue
}) => {
  const {
    fields,
    append
  } = useFieldArray({
    control,
    name: 'files',
    shouldUnregister: true
  });

  const watchChallengeTable = watch('challengeTable');

  useEffect(() => {
    files.forEach((file) => {
      append({ ...file, type: NormalTableType.RAW });
    });
  }, [files]);

  const getTableChallengeType = (file: File) => {
    for (const key of enumKeys(ChallengeTableType)) {
      if (file.name.toLowerCase().includes(ChallengeTableType[key])) {
        return ChallengeTableType[key];
      }
    }
    return ChallengeTableType.DATA;
  };

  useEffect(() => {
    if (watchChallengeTable === true) {
      fields.forEach((field, index) => {
        setValue(`files.${index}.type`, getTableChallengeType(field.original));
      });
    } else if (watchChallengeTable === false) {
      fields.forEach((field, index) => {
        setValue(`files.${index}.type`, NormalTableType.RAW);
      });
    }
  }, [watchChallengeTable]);

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
                  watchChallengeTable,
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
