/* eslint-disable react/no-danger */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as SelectMaterial,
  Stack,
} from "@mui/material";
import { forwardRef, useEffect } from "react";
import { useAppSelector } from "@hooks/store";
import { selectColumnsAsSelectOptions } from "@store/slices/table/table.selectors";
import { SelectInputProps } from "@mui/material/Select/SelectInput";
import { BaseFormControlProps, Option } from "./types";
import InputDescription from "./InputDescription";

export type SelectProps = BaseFormControlProps &
  SelectInputProps & {
    id: string;
    label: string;
    options: Option[];
    onChange: (e: any) => void;
    defaultValue?: string;
  };

export type SelectOptionSelector = (state: any) => Option[];

/**
 * Select component
 */
export const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      id,
      label,
      description,
      infoText,
      options,
      defaultValue,
      children,
      formState,
      reset,
      setValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const { errors } = formState;

    const error = Boolean(errors[id]);

    return (
      <Stack gap="10px">
        <InputDescription description={description} infoText={infoText} />
        <FormControl error={error}>
          <InputLabel>{label}</InputLabel>
          <SelectMaterial
            inputRef={ref}
            onChange={onChange}
            labelId="select-match"
            label={label}
            {...props}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </SelectMaterial>
          {error && <FormHelperText>{errors[id].message}</FormHelperText>}
        </FormControl>
      </Stack>
    );
  }
);

export type SelectColumnProps = Omit<SelectProps, "options">;

/**
 * Select component where the options are the columns of the table
 */
export const SelectColumns = forwardRef<HTMLInputElement, SelectColumnProps>(
  (props, ref) => {
    const { id, setValue } = props;

    const options = useAppSelector(selectColumnsAsSelectOptions);

    // useEffect(() => {
    //   if (options && options.length > 0) {
    //     setValue(id, options[0].value);
    //   }
    // }, [setValue, options]);

    return <Select ref={ref} options={options} {...props} />;
  }
);
