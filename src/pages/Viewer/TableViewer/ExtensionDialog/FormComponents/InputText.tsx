import { Stack, TextField } from '@mui/material';
import { forwardRef } from 'react';
import { BaseFormControlProps } from './types';
import InputDescription from './InputDescription';

export type CheckboxProps = BaseFormControlProps & {
  id: string;
  label: string;
  onChange: (e: any) => void;
  defaultValue?: string;
}

/**
 * Input text
 */
const InputText = forwardRef<HTMLInputElement, CheckboxProps>(({
  id,
  infoText,
  description,
  defaultValue,
  reset,
  setValue,
  formState,
  ...props
}, ref) => {
  const { errors } = formState;

  const error = Boolean(errors[id]);

  return (
    <Stack gap="10px">
      <InputDescription description={description} infoText={infoText} />
      <TextField
        error={error}
        helperText={error && errors[id].message}
        inputRef={ref}
        {...props}
      />
    </Stack>
  );
});

export default InputText;
