/* eslint-disable react/no-danger */
import {
  Stack, Checkbox as MaterialCheckbox,
  FormControlLabel,
  FormControl
} from '@mui/material';
import {
  ChangeEvent, forwardRef,
  useState, useEffect
} from 'react';
import { CheckboxSchema } from '@store/slices/config/interfaces/config';
import { BaseFormControlProps } from '../types';

export type CheckboxProps = BaseFormControlProps & CheckboxSchema;

/**
 * Group of checkboxes
 */
const CheckboxGroup = forwardRef<HTMLInputElement, CheckboxProps>(({
  options,
  defaultValue,
  onChange
}, ref) => {
  const [state, setState] = useState<string[]>(defaultValue || []);

  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setState((oldState) => (oldState.includes(value)
      ? oldState.filter((c) => c !== value)
      : [...oldState, value]));
  };

  useEffect(() => {
    onChange(state);
  }, [state]);

  return (
    <Stack gap="10px">
      <Stack component={FormControl}>
        {options.map(({ id: optId, value: optValue, label }) => (
          <FormControlLabel
            key={optId}
            control={(
              <MaterialCheckbox
                inputRef={ref}
                value={optValue}
                onChange={handleCheck}
                checked={state.includes(optValue)}
              />
            )}
            label={label}
          />
        ))}
      </Stack>
    </Stack>
  );
});

export default CheckboxGroup;
