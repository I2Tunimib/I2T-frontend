import { Stack, TextField } from '@mui/material';
import { forwardRef } from 'react';
import { InputTextSchema } from '@store/slices/config/interfaces/config';
import { useFormContext } from 'react-hook-form';
import { BaseFormControlProps } from '../types';
import InputDescription from '../FormFieldDescription';

export type InputTextProps = BaseFormControlProps & InputTextSchema

/**
 * Input text
 */
const InputText = forwardRef<HTMLInputElement, InputTextProps>(({
  id,
  infoText,
  description,
  defaultValue,
  // reset,
  // setValue,
  // formState,
  ...props
}, ref) => {
  const { formState } = useFormContext();
  const { errors } = formState;

  const error = Boolean(errors[id]);

  return (
    <Stack gap="10px">
      {/* <InputDescription description={description} infoText={infoText} /> */}
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
