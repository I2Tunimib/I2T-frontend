import {
  Button,
  Stack,
  Select as SelectMaterial,
  MenuItem,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Extender,
  Reconciliator,
} from "@store/slices/config/interfaces/config";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import LoadingButton from "@mui/lab/LoadingButton";
import { useAppDispatch } from "@hooks/store";
import { updateUI } from "@store/slices/table/table.slice";
import {
  FORM_COMPONENTS,
  getDefaultValues,
  getRules,
  prepareFormInput,
} from "./componentsConfig";
import { suggest } from "@store/slices/table/table.thunk";

export type DynamicFormProps = {
  loading: boolean | undefined;
  service: Extender | Reconciliator;
  onSubmit: (formState: Record<string, any>) => void;
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
    onSubmitCallback(formValue);
    reset(getDefaultValues(service));
  };

  const onCancel = () => {
    onCancelCallback();
  };

  const onSuggest = async () => {
    let data = await dispatch(
      suggest({
        suggester: "/wikidata",
      })
    ).unwrap();
    setSuggestions(data.data);
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
        formParams.map(({ id, inputType, ...inputProps }) => {
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
        <Button onClick={onSuggest}>Suggest</Button>
      )}
      {suggestions.length > 0 && (
        <>
          <InputLabel id="suggestion-label">Suggestion list</InputLabel>
          <SelectMaterial
            onChange={onSuggestChange}
            multiple={true}
            labelId="suggestion-match"
            label={"Select suggestion"}
            value={selectedSuggestion}
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
                {option.label} {option.percentage + "%"}
              </MenuItem>
            ))}
          </SelectMaterial>
        </>
      )}
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button onClick={onCancel}>Cancel</Button>
        <LoadingButton variant="outlined" type="submit" loading={loading}>
          Confirm
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default DynamicForm;
