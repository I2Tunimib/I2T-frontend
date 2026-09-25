import { FC, useEffect, useState } from "react";
import {
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  SelectColumns,
  SelectPrefix,
} from "@components/core/DynamicForm/formComponents/Select";
import { Controller, useForm } from "react-hook-form";
import { fetchTypeAndDescription } from "@services/utils/kg-info";
import { extractIdFromUri } from "@services/utils/uri-utils";

export interface AddMetadataFormProps {
  onPrefixChange?: (prefix: string) => void;
  currentService: string;
  onSubmit: (data: any) => void;
  context: "metadataDialog" | "typeTab" | "propertyTab";
  otherColumns?: { id: string; label: string; value: string }[];
  colId?: string;
  columnKind?: string;
}

const AddMetadataForm: FC<AddMetadataFormProps> = ({
  onPrefixChange,
  currentService,
  onSubmit,
  context,
  otherColumns,
  colId,
  columnKind = "",
}) => {
  const isLiteral = columnKind === "literal";
  const { handleSubmit, reset, register, control, setValue, watch } = useForm({
    defaultValues: {
      prefix: "",
      id: "",
      name: "",
      uri: "",
      score: 1.0,
      match: "true",
      subj: isLiteral ? "" : colId,
      obj: isLiteral ? colId : "",
    },
  });
  const [customPrefix, setCustomPrefix] = useState("");
  const [isFetchingName, setIsFetchingName] = useState(false);

  const watchedUri = watch("uri");
  const watchedPrefix = watch("prefix");
  const watchedName = watch("name");

  useEffect(() => {
    if (onPrefixChange) {
      onPrefixChange(watchedPrefix);
    }
  }, [watchedPrefix, onPrefixChange]);

  useEffect(() => {
    if (currentService !== undefined && context !== "typeTab") {
      reset({ prefix: currentService });
      setCustomPrefix("");
    }
  }, [currentService, reset]);

  useEffect(() => {
    setValue("subj", isLiteral ? "" : colId);
    setValue("obj", isLiteral ? colId : "");
  }, [columnKind, isLiteral, colId, setValue]);

  console.log("AddMetadataForm currentService", currentService);

  useEffect(() => {
    const fetchNameFromUri = async () => {
      if (!watchedUri || !watchedPrefix) return;
      const cleanPrefix = watchedPrefix.replace(/:$/, "");
      const id = extractIdFromUri(watchedUri, cleanPrefix);
      if (id) {
        try {
          setIsFetchingName(true);
          let result;
          if (cleanPrefix === "geoCoord" || cleanPrefix === "georss") {
            const base = import.meta.env.VITE_BACKEND_API_URL;
            const response = await fetch(`${base}/metadata/osm?id=${encodeURIComponent(id)}`);
            if (response.ok) {
              result = await response.json();
            }
          } else {
            result = await fetchTypeAndDescription(cleanPrefix, id, "", context);
          }

          if (result && result.name) {
            setValue("name", result.name);
            if (result.osmId && result.osmType) {
              setValue("osmId", result.osmId);
              setValue("osmType", result.osmType);
            }
          } else {
            setValue("name", "");
          }
        } catch (err) {
          console.error("Error in fetching name:", err);
        } finally {
          setIsFetchingName(false);
        }
      }
    };
    const timeoutId = setTimeout(() => {
      fetchNameFromUri();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUri, watchedPrefix, setValue]);

  return (
    <Stack
      component="form"
      direction="row"
      gap={1}
      onSubmit={handleSubmit(onSubmit)}
    >
      {context === "propertyTab" && watchedPrefix !== "custom" && (
        <FormControl
          sx={{ minWidth: 150, flex: "1 1 200px" }}
          fullWidth
          size="small"
        >
          <Controller
            name="subj"
            control={control}
            defaultValue={isLiteral ? "" : colId}
            rules={{ required: true }}
            render={({ field }) => {
              const finalOptions = isLiteral
                ? otherColumns || []
                : [
                    {
                      id: colId,
                      value: colId,
                      label: colId,
                      kind: columnKind,
                      colFixed: false,
                    },
                    ...(otherColumns || []),
                  ];

              return (
                <SelectColumns
                  {...field}
                  id="subj"
                  label="Subj *"
                  options={finalOptions}
                  value={field.value}
                  noGap={true}
                  disabled={!isLiteral}
                />
              );
            }}
          />
        </FormControl>
      )}
      <Tooltip
        title={
          !!currentService
            ? context === "propertyTab"
              ? "Fixed: only Wikidata prefix allowed for properties"
              : "Fixed with Reconciliation service used"
            : "Select a prefix from the available ones"
        }
        arrow
        placement="top"
      >
        <FormControl
          sx={{ minWidth: 150, flex: "1 1 200px" }}
          fullWidth
          size="small"
        >
          <Controller
            name="prefix"
            control={control}
            render={({ field }) => (
              <SelectPrefix
                id="prefix"
                label="Prefix *"
                required
                variant="outlined"
                context={context}
                noGap={true}
                sx={{
                  minWidth: 100,
                  flex: context === "typeTab" ? "1 1 20px" : "1 1 50px",
                }}
                {...field}
              />
            )}
          />
        </FormControl>
      </Tooltip>
      {watchedPrefix === "custom" ? (
        <Stack direction="row" gap={1} alignItems="center">
          <TextField
            sx={{ minWidth: 150, flex: "1 1 150px" }}
            size="small"
            label="Custom Prefix"
            variant="outlined"
            value={customPrefix}
            onChange={(e) => setCustomPrefix(e.target.value)}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              const trimmed = customPrefix.trim();
              if (trimmed) {
                // Remove any trailing colons and whitespace to store a normalized prefix (e.g., "wd" not "wd:")
                const sanitized = trimmed.replace(/:+$/, "");
                setValue("prefix", sanitized);
                setCustomPrefix("");
              }
            }}
            sx={{ height: 40 }}
          >
            OK
          </Button>
        </Stack>
      ) : (
        <>
          <TextField
            sx={{
              minWidth: 300,
              flex: context === "typeTab" ? "1 1 150px" : "1 1 300px",
            }}
            size="small"
            label="Uri"
            required
            variant="outlined"
            {...register("uri", {
              onBlur: (e) => {}
            })}
          />
          <Tooltip title={isFetchingName ? "Fetching name from URI..." : ""} arrow placement="top">
            <TextField
              sx={{
                minWidth: 150,
                flex: context === "typeTab" ? "1 1 30px" : "1 1 150px",
                "& .MuiInputBase-root.Mui-disabled": {
                  backgroundColor: "rgba(0, 0, 0, 0.03)"
                }
              }}
              size="small"
              label="Name"
              required
              variant="outlined"
              {...register("name")}
              disabled={isFetchingName}
              InputLabelProps={{
                shrink: isFetchingName || !!watch("name")
              }}
              InputProps={{
                endAdornment: isFetchingName ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} color="inherit" />
                  </InputAdornment>
                ) : null,
              }}
            />
          </Tooltip>
          {context === "propertyTab" && (
            <FormControl
              sx={{ minWidth: 150, flex: "1 1 200px" }}
              fullWidth
              size="small"
            >
              <Controller
                name="obj"
                control={control}
                defaultValue={isLiteral ? colId : ""}
                rules={{ required: true }}
                render={({ field }) => {
                  const finalOptions = isLiteral
                    ? [
                        {
                          id: colId,
                          value: colId,
                          label: colId,
                          kind: columnKind,
                          colFixed: true,
                        },
                        ...(otherColumns || []),
                      ]
                    : otherColumns || [];

                  return (
                    <SelectColumns
                      {...field}
                      id="obj"
                      label="Obj *"
                      value={field.value}
                      options={finalOptions}
                      noGap={true}
                      disabled={isLiteral}
                    />
                  );
                }}
              />
            </FormControl>
          )}
          {context !== "typeTab" && (
            <>
              <Tooltip
                title="Enter the score value, from 0.00 to 1.00"
                arrow
                placement="top"
              >
                <TextField
                  sx={{ minWidth: 60, flex: "1 1 50px" }}
                  size="small"
                  label="Score"
                  variant="outlined"
                  {...register("score")}
                />
              </Tooltip>
              <FormControl size="small" sx={{ minWidth: 90, flex: "1 1 50px" }}>
                <InputLabel>Match</InputLabel>
                <Controller
                  name="match"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Match">
                      <MenuItem value="true">true</MenuItem>
                      <MenuItem value="false">false</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </>
          )}
          <Tooltip
            title={isFetchingName ? "Fetching name..." : "Please provide all the required inputs"}
            arrow
            placement="top"
          >
            <span>
              <Button
                type="submit"
                size="small"
                variant="contained"
                disabled={isFetchingName || !watchedName}
                sx={{
                  height: 40,
                  padding: "0 16px",
                  textTransform: "none",
                }}
              >
                Add
              </Button>
            </span>
          </Tooltip>
        </>
      )}
    </Stack>
  );
};

export default AddMetadataForm;
