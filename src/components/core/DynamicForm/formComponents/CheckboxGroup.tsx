/* eslint-disable react/no-danger */
import {
  Stack, Checkbox as MaterialCheckbox,
  FormControlLabel,
  FormControl,
  FormHelperText
} from '@mui/material';
import {
  ChangeEvent, forwardRef,
  useState, useEffect
} from 'react';
import { BaseFormControlProps, Option } from './types';
import InputDescription from './InputDescription';

export type CheckboxProps = BaseFormControlProps & {
  id: string;
  label: string;
  options: Option[];
  onChange: (e: any) => void;
  defaultValue?: any;
}

/**
 * Group of checkboxes
 */
const CheckboxGroup = forwardRef<HTMLInputElement, CheckboxProps>(({
  id: inputId,
  description,
  infoText,
  defaultValue,
  options,
  formState,
  onChange
}, ref) => {
  const [state, setState] = useState<string[]>(defaultValue || []);

  const { errors } = formState;

  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setState((oldState) => (oldState.includes(value)
      ? oldState.filter((c) => c !== value)
      : [...oldState, value]));
  };

  useEffect(() => {
    onChange(state);
  }, [state]);

  const error = Boolean(errors[inputId]);

  return (
    <Stack gap="10px">
      <InputDescription description={description} infoText={infoText} />
      <Stack component={FormControl} error={error}>
        {options.map(({ id, value, label }) => (
          <FormControlLabel
            key={id}
            control={(
              <MaterialCheckbox
                inputRef={ref}
                value={value}
                onChange={(e) => handleCheck(e)}
                checked={state.includes(value)}
              />
            )}
            label={label}
          />
        ))}
        {error && <FormHelperText>{errors[inputId].message}</FormHelperText>}
      </Stack>
    </Stack>
  );
});

export default CheckboxGroup;
