import {
  Stack,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from "@mui/material";
import { forwardRef } from "react";
import InputDescription from "./InputDescription";
import { BaseFormControlProps, Option } from "./types";

export type RadioGroupProps = BaseFormControlProps & {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
};

/**
 * Group of radio buttons
 */
const RadioGroupComponent = forwardRef<HTMLInputElement, RadioGroupProps>(
  (props, ref) => {
    const { id: inputId, description, infoText, options, formState, value, onChange } = props;

    const error = Boolean(formState?.errors?.[inputId]);

    return (
      <Stack gap="10px">
        <InputDescription description={description} infoText={infoText} />
        <FormControl error={error}>
          <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map(({ id, label, value }) => (
              <FormControlLabel
                key={id}
                value={value}
                control={<Radio inputRef={ref} />}
                label={label}
              />
            ))}
          </RadioGroup>
          {error && <FormHelperText>{formState.errors[inputId]?.message}</FormHelperText>}
        </FormControl>
      </Stack>
    );
  }
);

export default RadioGroupComponent;
