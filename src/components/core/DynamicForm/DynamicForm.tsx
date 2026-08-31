import {
  Button,
  Stack,
  Select as SelectMaterial,
  MenuItem,
  InputLabel,
  Chip,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  CircularProgress,
} from "@mui/material";

import {
  Extender,
  Reconciliator,
  Modifier,
} from "@store/slices/config/interfaces/config";
import React, { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { suggest } from "@store/slices/table/table.thunk";
import {
  filterDetailLevelOptions,
  dateFormatterUtils,
} from "@services/utils/date-formatter-utils";
import { RootState } from "@store";
import {
  FORM_COMPONENTS,
  getDefaultValues,
  getRules,
  prepareFormInput,
  shouldShowField,
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
  const selectedColumns = service.selectedColumns;
  const rows = useAppSelector((state: RootState) => state.table.entities.rows);
  const { control, handleSubmit, reset, setValue, formState, watch } = useForm({
    defaultValues: getDefaultValues(service),
  });

  let activeColumnType = (service as any).columnType;
  if (!activeColumnType && selectedColumns.length === 1) {
    const colId = selectedColumns[0];
    const values: string[] = [];
    Object.keys(rows.byId).slice(0, 5).forEach((rowId) => {
      const cell = rows.byId[rowId].cells[colId];
      if (cell?.label != null) values.push(String(cell.label).trim());
    });
    activeColumnType = dateFormatterUtils(values);
  }

  console.log("activeColumnType", activeColumnType);

  // Watch all form values for dependency checking
  const watchedValues = watch();
  const formatType = watch("formatType");
  const columnToJoin = watch("columnToJoin");
  const splitDatetime = watch("splitDatetime");
  const operationType = watch("operationType");
  const isJoinInvalid = service.columnType === "unknown";
  const granularity = watch("granularity");
  const splitRenameMode = watch("splitRenameMode");
  const splitMode = watch("splitMode");
  console.log("splitDatetime", splitDatetime);

  let finalType = "";

  useEffect(() => {
    // rest form to selected extender values
    reset(getDefaultValues(service));
  }, [service]);

  const { formParams } = service;

  const onSubmit = (formValue: any) => {
    onSubmitCallback(
      {
        ...formValue,
        selectedColumns,
        columnType: activeColumnType,
        splitDatetime: formValue.splitDatetime,
      },
      () => reset(getDefaultValues(service)),
    );
  };

  const onCancel = () => {
    onCancelCallback();
  };

  const onSuggest = async () => {
    setSuggestLoading(true);
    let data = await dispatch(
      suggest({
        suggester: "/wikidata",
      }),
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

  if (columnToJoin && selectedColumns.length === 1) {
    const columns = [...selectedColumns, columnToJoin];
    const values = [];
    columns.forEach((colId) => {
      const rowId = rows.allIds[0];
      const cell = rows.byId[rowId].cells[colId];
      if (cell?.label != null) {
        values.push(String(cell.label).trim());
      }
    });
    finalType = dateFormatterUtils(values);
  }

  const modifiedFormParams = React.useMemo(() => {
    if (!service.formParams) return [];

    return service.formParams.map((param) => {
      if (param.id === "detailLevel") {
        let options = filterDetailLevelOptions(
          param.options,
          activeColumnType,
          formatType,
        );
        if (
          selectedColumns.length === 1 &&
          columnToJoin &&
          activeColumnType !== "datetime" &&
          finalType === "datetime"
        ) {
          options = options.filter(
            (dl) =>
              ![
                "year",
                "monthYear",
                "monthNumber",
                "monthText",
                "day",
                "dateOnly",
              ].includes(dl.id),
          );
        }
        return {
          ...param,
          options,
        };
      }
      return param;
    });
  }, [
    service.formParams,
    activeColumnType,
    formatType,
    columnToJoin,
    finalType,
    selectedColumns,
    rows,
  ]);

  return (
    <Stack component="form" gap="20px" onSubmit={handleSubmit(onSubmit)}>
      {service.id === "dateFormatter" &&
        (isJoinInvalid ? (
          <div style={{ color: "red", marginTop: 8 }}>
            Please select either <b> one date column </b> and{" "}
            <b> one time column </b> to create a datetime column, or
            <b> only date </b> or <b> only time column</b>.
          </div>
        ) : (
          <>
            {modifiedFormParams.map(
              ({ id, inputType, dependsOn, ...inputProps }) => {
                // Check generic dependency using shouldShowField utility
                const param = { id, inputType, dependsOn, ...inputProps };
                if (!shouldShowField(param, watchedValues)) {
                  return null;
                }

                const FormComponent = FORM_COMPONENTS[inputType];
                return (
                  <Controller
                    key={id}
                    defaultValue=""
                    rules={getRules(inputProps.rules)}
                    render={({
                      field: { selectedColumns: _, ...fieldProps },
                    }) => (
                      <FormComponent
                        id={id}
                        formState={formState}
                        reset={reset}
                        setValue={setValue}
                        {...fieldProps}
                        {...(prepareFormInput(inputProps) as any)}
                        {...(inputType === "selectColumns"
                          ? { selectedColumns }
                          : {})}
                      />
                    )}
                    name={id}
                    control={control}
                  />
                );
              },
            )}
            {selectedColumns.length > 1 && (
              <Controller
                name="joinColumns"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <>
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Join selected columns"
                    />
                    {field.value && activeColumnType !== "datetime" && (
                      <Controller
                        name="separator"
                        control={control}
                        defaultValue="; "
                        render={({ field }) => (
                          <TextField {...field} label="Separator" />
                        )}
                      />
                    )}
                  </>
                )}
              />
            )}
            {selectedColumns.length === 1 &&
              columnToJoin &&
              activeColumnType !== "datetime" &&
              finalType !== "datetime" && (
                <Controller
                  name="separator"
                  control={control}
                  defaultValue="; "
                  render={({ field }) => (
                    <TextField {...field} label="Separator" />
                  )}
                />
              )}
            {activeColumnType === "datetime" &&
              selectedColumns.length === 1 && (
                <Controller
                  name="splitDatetime"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Split datetime into a column date and a column time"
                    />
                  )}
                />
              )}
          </>
        ))}
      {service.id !== "dateFormatter" &&
        formParams &&
        formParams.map(({ id, inputType, dependsOn, ...inputProps }) => {
          // Check generic dependency using shouldShowField utility
          const param = { id, inputType, dependsOn, ...inputProps };
          if (!shouldShowField(param, watchedValues)) {
            return null;
          }

          const FormComponent = FORM_COMPONENTS[inputType];
          return (
            <Controller
              key={id}
              defaultValue=""
              rules={getRules(inputProps.rules)}
              render={({ field: { selectedColumns: _, ...fieldProps } }) => (
                <FormComponent
                  id={id}
                  formState={formState}
                  reset={reset}
                  setValue={setValue}
                  {...fieldProps}
                  {...(prepareFormInput(inputProps) as any)}
                  {...(["multipleColumnSelect", "selectColumns"].includes(
                    inputType,
                  )
                    ? { selectedColumns }
                    : {})}
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
          onClick={onSuggest}
          disabled={suggestLoading}
        >
          Suggest
          {suggestLoading && (
            <CircularProgress size={18} style={{ marginLeft: 8 }} />
          )}
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
                      (option) => option.id === value,
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
                  {option.label}{" "}
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
        <Button
          variant="outlined"
          type="submit"
          disabled={
            loading || (service.id === "dateFormatter" && isJoinInvalid)
          }
        >
          Confirm
          {loading && <CircularProgress size={18} style={{ marginLeft: 8 }} />}
        </Button>
      </Stack>
    </Stack>
  );
};

export default DynamicForm;
