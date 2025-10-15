/* eslint-disable react/no-danger */
import {
  Stack,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from "@mui/material";
import { forwardRef, useState, useEffect } from "react";
import InputDescription from "./InputDescription";
import { BaseFormControlProps, Option } from "./types";

export type RadioGroupProps = BaseFormControlProps & {
  id: string;
  label: string;
  options: Option[];
  onChange: (value: string) => void;
  defaultValue?: string;
};

/**
 * Group of radio buttons
 */
const RadioGroupComponent = forwardRef<HTMLInputElement, RadioGroupProps>(({
  id: inputId,
  description,
  infoText,
  defaultValue,
  options,
  formState,
  onChange,
}, ref) => {
  const [state, setState] = useState<string>(defaultValue || "");

  const { errors } = formState;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setState(value);
  };

  // Pass the updated value to parent
  useEffect(() => {
    onChange(state);
  }, [state]);

  const error = Boolean(errors[inputId]);

  return (
    <Stack gap="10px">
      <InputDescription description={description} infoText={infoText} />
      <FormControl error={error}>
        <RadioGroup value={state} onChange={handleChange}>
          {options.map(({ id, label, value }) => (
            <FormControlLabel
              key={id}
              value={value}
              control={<Radio inputRef={ref} />}
              label={label}
            />
          ))}
        </RadioGroup>
        {error && <FormHelperText>{errors[inputId]?.message}</FormHelperText>}
      </FormControl>
    </Stack>
  );
});

export default RadioGroupComponent;
