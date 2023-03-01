/* eslint-disable react/no-danger */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as SelectMaterial,
  Stack
} from '@mui/material';
import { forwardRef } from 'react';
import { SelectInputProps } from '@mui/material/Select/SelectInput';
import { SelectSchema } from '@store/slices/config/interfaces/config';
import { useFormContext } from 'react-hook-form';
import { BaseFormControlProps, Option } from '../types';

export type SelectProps = BaseFormControlProps & SelectInputProps & SelectSchema;

export type SelectOptionSelector = (state: any) => Option[];

/**
 * Select component
 */
const Select = forwardRef<HTMLInputElement, SelectProps>(({
  id,
  label,
  description,
  infoText,
  options,
  defaultValue,
  children,

  onChange,
  ...props
}, ref) => {
  return (
    <Stack gap="10px">
      <FormControl>
        <InputLabel>{label}</InputLabel>
        <SelectMaterial
          inputRef={ref}
          onChange={onChange}
          labelId="select-match"
          label={label}
          {...props}>
          {options.map((option) => (
            <MenuItem key={option.id} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </SelectMaterial>
      </FormControl>
    </Stack>
  );
});

export type SelectColumnProps = Omit<SelectProps, 'options'>;

export default Select;
