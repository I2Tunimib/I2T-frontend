/* eslint-disable react/no-danger */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as SelectMaterial,
  Stack,
  Button,
  Box,
} from "@mui/material";
import { SelectProps as MuiSelectProps } from "@mui/material/Select";
import { forwardRef, useState } from "react";
import { useAppSelector } from "@hooks/store";
import { selectColumnsAsSelectOptions } from "@store/slices/table/table.selectors";
import { BaseFormControlProps, Option } from "./types";
import InputDescription from "./InputDescription";

export type SelectProps = BaseFormControlProps &
  MuiSelectProps & {
    id: string;
    label: string;
    options: Option[];
    onChange: (e: any) => void;
    selectedColumns?: string[];
    defaultValue?: string[];
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
      formState,
      reset,
      setValue,
      onChange,
      multiple,
      selectedColumns = [],
      value,
      ...props
    },
    ref
  ) => {
    const { errors } = formState;
    const [open, setOpen] = useState(false);

    const error = Boolean(errors[id]);

    const handleClose = () => {
      setOpen(false);
    };

    const handleConfirm = () => {
      setOpen(false);
    };

    return (
      <Stack gap="10px">
        <InputDescription description={description} infoText={infoText} />
        <FormControl error={error}>
          <InputLabel>{label}</InputLabel>
          <SelectMaterial
            inputRef={ref}
            onChange={onChange}
            multiple={true}
            labelId="select-match"
            label={label}
            value={Array.isArray(value) ? value : [value]}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={handleClose}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
                sx: {
                  "& .MuiList-root": {
                    paddingBottom: 0,
                  },
                  display: "flex",
                  flexDirection: "column",
                },
              },
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
            }}
            {...props}
          >
            {options.map((option) => {
              const isDisabled = selectedColumns?.includes(option.value);
              return (
                <MenuItem
                  key={option.id}
                  value={option.value}
                  disabled={isDisabled}
                >
                  {option.label} {isDisabled && "(selected)"}
                </MenuItem>
              );
            })}
            <Box
              component="div"
              sx={{
                p: 1,
                borderTop: 1,
                borderColor: "divider",
                backgroundColor: "background.paper",
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                margin: 0,
              }}
              onClick={(e) => e.stopPropagation()} // Prevent menu from closing when clicking the box
            >
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={handleConfirm}
                onMouseDown={(e) => e.stopPropagation()} // Prevent menu item selection behavior
              >
                Confirm
              </Button>
            </Box>
          </SelectMaterial>
          {error && (
            <FormHelperText>{String(errors[id]?.message || "")}</FormHelperText>
          )}
        </FormControl>
      </Stack>
    );
  }
);

export type SelectColumnProps = Omit<SelectProps, "options">;

/**
 * Select component where the options are the columns of the table
 */
export const MultipleColumnSelect = forwardRef<
  HTMLInputElement,
  SelectColumnProps
>((props, ref) => {
  const { id, setValue } = props;

  const options = useAppSelector(selectColumnsAsSelectOptions);

  // useEffect(() => {
  //   if (options && options.length > 0) {
  //     setValue(id, [options[0].value]);
  //   }
  // }, [setValue, options]);

  return <Select ref={ref} options={options} {...props} />;
});
