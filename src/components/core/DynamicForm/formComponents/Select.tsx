/* eslint-disable react/no-danger */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as SelectMaterial,
  Stack,
  Box,
} from "@mui/material";
import { forwardRef } from "react";
import { useAppSelector } from "@hooks/store";
import { selectColumnsAsSelectOptions } from "@store/slices/table/table.selectors";
import { KG_INFO } from "@services/utils/kg-info";
import { SelectInputProps } from "@mui/material/Select/SelectInput";
import { ButtonShortcut } from "@components/kit";
import { BaseFormControlProps, Option } from "./types";
import InputDescription from "./InputDescription";

const getKind = (kind: string) => {
  if (kind === "entity") {
    return (
      <ButtonShortcut
        text="E"
        tooltipText="Named Entity"
        size="xs"
        variant="flat"
        color="blue"
      />
    );
  }
  if (kind === "literal") {
    return (
      <ButtonShortcut
        text="L"
        tooltipText="Literal"
        size="xs"
        variant="flat"
        color="green"
      />
    );
  }
  return null;
};

export type SelectProps = BaseFormControlProps &
  SelectInputProps & {
    id: string;
    label: string;
    options: Option[];
    onChange: (e: any) => void;
    defaultValue?: string;
    noGap?: boolean;
    height?: number;
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
      noGap = false,
      selectedColumns,
      ...props
    },
    ref
  ) => {
    const errors = formState?.errors ?? {};

    const error = Boolean(errors[id]);

    return (
      <Stack gap={noGap ? 0 : "10px"}>
        <InputDescription description={description} infoText={infoText} />
        <FormControl error={error}>
          <InputLabel sx={noGap ? { top: "-6px" } : {}}>
            {label}
          </InputLabel>
          <SelectMaterial
            inputRef={ref}
            onChange={onChange}
            labelId="select-match"
            label={label}
            {...props}
            sx={noGap ? { height: 40 } : {}}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.value} disabled={option.disabled}>
                <Box display="flex" alignItems="center" width="100%">
                  <span style={{ flex: 1 }}>{option.label}</span>
                  {noGap && option.kind && option.kind !== "" && (
                    <Box display="flex" justifyContent="flex-end">
                      {getKind(option.kind)}
                    </Box>
                  )}
                </Box>
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
  value: string;
  context?: string;
  onChange: (value: string) => void;
};

export const SelectPrefix = forwardRef<HTMLInputElement, SelectPrefixProps>(
  ({ id, label, value, onChange, context, ...formProps }, ref) => {
    const exclusion = ["maps", "wiki", "dbp", "cr"];
    const prefixProperty = ["wd", "wdA", "wdL"];
    const options: Option[] = Object.keys(KG_INFO)
      .filter((key) => {
        if (exclusion.includes(key) || !KG_INFO[key].groupName) return false;
        if (context === "propertyTab") {
          return prefixProperty.includes(key);
        }
        return true;
      })
      .map((key) => ({
        id: key,
        value: key,
        label: `${key} (${KG_INFO[key].groupName || "N/A"})`,
      }));

    return <Select ref={ref} id={id} label={label} value={value ?? ""} options={options} onChange={onChange} {...formProps} />;
  }
);
