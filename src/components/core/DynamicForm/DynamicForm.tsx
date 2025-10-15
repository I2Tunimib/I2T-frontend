import {
  Button,
  Stack,
  Select as SelectMaterial,
  MenuItem,
  InputLabel,
  Chip,
  FormControl,
} from "@mui/material";
import {
  Extender,
  Reconciliator,
  Modifier,
} from "@store/slices/config/interfaces/config";
import React, { FC, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useAppDispatch } from "@hooks/store";
import { suggest } from "@store/slices/table/table.thunk";
import {
  FORM_COMPONENTS,
  getDefaultValues,
  getRules,
  prepareFormInput,
} from "./componentsConfig";

export type DynamicFormProps = {
  loading: boolean | undefined;
  service: Extender | Reconciliator | Modifier;
  onSubmit: (formState: Record<string, any>, reset?: Function) => void;
  onCancel: () => void;
};

const DynamicForm: FC<DynamicFormProps> = ({
  loading,
  service,
  onSubmit: onSubmitCallback,
  onCancel: onCancelCallback,
}) => {
  const dispatch = useAppDispatch();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any[]>([]);
  const { control, handleSubmit, reset, setValue, formState } = useForm({
    defaultValues: getDefaultValues(service),
  });

  useEffect(() => {
    // rest form to selected extender values
    reset(getDefaultValues(service));
  }, [service]);

  const { formParams } = service;

  const onSubmit = (formValue: any) => {
    onSubmitCallback(formValue, () => reset(getDefaultValues(service)));
    // reset(getDefaultValues(service));
  };

  const onCancel = () => {
    onCancelCallback();
  };

  const onSuggest = async () => {
    setSuggestLoading(true);
    let data = await dispatch(
      suggest({
        suggester: "/wikidata",
      })
    ).unwrap();
    setSuggestions(data.data);
    setSuggestLoading(false);
  };

  const onSuggestChange = (event: any) => {
    console.log("event", event, formParams);
    const { value } = event.target;
    setSelectedSuggestion(value);
    setValue("properties", value.join(" "));
  };

  return (
    <Stack component="form" gap="20px" onSubmit={handleSubmit(onSubmit)}>
      {formParams &&
        formParams.map(({ id, inputType, conditional, ...inputProps }) => {
          if (conditional) {
            const fieldValue = useWatch({
              control,
              name: conditional.field,
            });
            if (fieldValue !== conditional.value) {
              return;
            }
          }
          const FormComponent = FORM_COMPONENTS[inputType];
          return (
            <Controller
              key={id}
              defaultValue=""
              rules={getRules(inputProps.rules)}
              render={({ field }) => (
                <FormComponent
                  id={id}
                  formState={formState}
                  reset={reset}
                  setValue={setValue}
                  {...field}
                  {...(prepareFormInput(inputProps) as any)}
                />
              )}
              name={id}
              control={control}
            />
          );
        })}
      {service.id === "wikidataPropertySPARQL" && (
        <Button
          variant="outlined"
          loading={suggestLoading}
          onClick={onSuggest}
        >
          Suggest
        </Button>
      )}
      {suggestions.length > 0 && (
        <>
          {/*  */}
          <FormControl fullWidth variant="outlined">
            <InputLabel id="suggestion-label">Suggestion list</InputLabel>
            <SelectMaterial
              onChange={onSuggestChange}
              multiple={true}
              id="suggestion"
              variant="outlined"
              labelId="suggestion-label"
              label="Suggestion list"
              value={selectedSuggestion}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300, // Controls the height of the dropdown
                    overflow: "auto", // Enables scrolling
                  },
                },
                // These control how the menu is positioned relative to the select
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                TransitionProps: {
                  style: { marginTop: "10px" },
                },
              }}
              renderValue={(selected) => (
                <div>
                  {selected.map((value) => {
                    const selectedOption = suggestions.find(
                      (option) => option.id === value
                    );
                    return (
                      <Chip
                        style={{ marginRight: 5 }}
                        key={value}
                        label={selectedOption ? selectedOption.label : value}
                      />
                    );
                  })}
                </div>
              )}
            >
              {suggestions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                  {" "}
                  {Number.isInteger(option.percentage)
                    ? option.percentage + "%"
                    : option.percentage.toFixed(2) + "%"}
                </MenuItem>
              ))}
            </SelectMaterial>
          </FormControl>
        </>
      )}
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="outlined" type="submit" loading={loading}>
          Confirm
        </Button>
      </Stack>
    </Stack>
  );
};

export default DynamicForm;
