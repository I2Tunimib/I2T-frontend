/* eslint-disable react/no-danger */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as SelectMaterial,
  Stack,
} from "@mui/material";
import { forwardRef } from "react";
import { useAppSelector } from "@hooks/store";
import { selectColumnsAsSelectOptions } from "@store/slices/table/table.selectors";
import { KG_INFO } from "@services/utils/kg-info";
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
      selectedColumns,
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
              <MenuItem key={option.id} value={option.value} disabled={option.disabled}>
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
export const SelectColumns = forwardRef<HTMLInputElement, SelectColumnProps & { selectedColumns?: string[] }>(
  (props, ref) => {
    const { id, setValue, selectedColumns = [] } = props;
    const options = useAppSelector(selectColumnsAsSelectOptions);

    const modifiedOptions = options.map((option) => {
      const isSelected = selectedColumns.includes(option.value);
      return {
        ...option,
        label: isSelected ? `${option.label} (selected)` : option.label,
        disabled: isSelected,
      };
    });
    return <Select ref={ref} options={modifiedOptions} {...props} />;
  }
);

export type SelectPrefixProps = BaseFormControlProps & {
  id: string;
  label: string;
  onChange: (value: string) => void;
};

export const SelectPrefix = forwardRef<HTMLInputElement, SelectPrefixProps>(
  ({ id, label, onChange, ...formProps }, ref) => {
    const exclusion = ["maps", "wiki", "dbp", "cr"];
    const options: Option[] = Object.keys(KG_INFO)
      .filter((key) => !exclusion.includes(key) && KG_INFO[key].groupName)
      .map((key) => ({
        id: key,
        value: key,
        label: `${key} (${KG_INFO[key].groupName || "N/A"})`,
      }));

    return <Select ref={ref} id={id} label={label} options={options} onChange={onChange} {...formProps} />;
  }
);
