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

export interface AddMetadataFormProps {
  onPrefixChange?: (prefix: string) => void;
  currentService: string;
  onSubmit: (data: any) => void;
  context: "metadataDialog" | "typeTab" | "propertyTab";
  otherColumns?: { id: string; label: string; value: string }[];
}

const AddMetadataForm: FC<AddMetadataFormProps> = ({
  onPrefixChange,
  currentService,
  onSubmit,
  context,
  otherColumns,
}) => {
  const { handleSubmit, reset, register, control, setValue, watch } = useForm({
    defaultValues: {
      prefix: "",
      id: "",
      name: "",
      uri: "",
      score: 1.0,
      match: "true",
      obj: "",
    },
  });
  const [customPrefix, setCustomPrefix] = useState("");
  const [isFetchingName, setIsFetchingName] = useState(false);

  const watchedUri = watch("uri");
  const watchedPrefix = watch("prefix");

  useEffect(() => {
    if (onPrefixChange) {
      onPrefixChange(watchedPrefix);
    }
  }, [watchedPrefix, onPrefixChange]);

  useEffect(() => {
    if (currentService !== undefined) {
      reset({ prefix: currentService });
      setCustomPrefix("");
    }
  }, [currentService, reset]);

  console.log("AddMetadataForm currentService", currentService);

  const extractIdFromUri = (uri: string, prefix: string) => {
    try {
      const url = new URL(uri);
      if (prefix.startsWith("wd")) {
        return url.pathname.split("/").pop()?.split(":").pop() || "";
      }
      if (prefix.startsWith("geo")) {
        if (prefix.startsWith("geo")) {
          const parts = url.pathname.split("/").filter(Boolean);
          return parts[0] || "";
        }
      }
      return url.pathname.split("/").filter(Boolean).pop() || "";
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    const fetchNameFromUri = async () => {
      if (watchedUri) {
        let id = "";
        if (watchedUri.startsWith("https") && watchedPrefix) {
          id = extractIdFromUri(watchedUri, watchedPrefix);
        } else {
          id = watchedUri;
        }
        if (id) {
          try {
            setIsFetchingName(true);
            const result = await fetchTypeAndDescription(watchedPrefix.replace(/:$/, ""), id, "");
            console.log("result", result);

            if (result && result.name) {
              setValue("name", result.name);
            }
          } catch (err) {
            console.error("Errore nel recupero automatico del nome:", err);
          } finally {
            setIsFetchingName(false);
          }
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
          sx={{ minWidth: 200, flex: "1 1 200px" }}
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
      {watchedPrefix === "custom" && (
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
      )}
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
      <Tooltip title={isFetchingName ? "Fetching name from URI..." : "Enter a name"} arrow placement="top">
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
        <Tooltip title="Select the referenced column" arrow placement="top">
          <FormControl
            sx={{ minWidth: 200, flex: "1 1 200px" }}
            fullWidth
            size="small"
          >
            <Controller
              name="obj"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <SelectColumns
                  {...field}
                  id="obj"
                  label="Obj *"
                  options={otherColumns || []}
                  noGap={true}
                />
              )}
            />
          </FormControl>
        </Tooltip>
      )}
      {context !== "typeTab" && (
        <>
          <Tooltip
            title="Enter the score value, from 0.00 to 1.00"
            arrow
            placement="top"
          >
            <TextField
              sx={{ minWidth: 100, flex: "1 1 50px" }}
              size="small"
              label="Score"
              variant="outlined"
              {...register("score")}
            />
          </Tooltip>
          <FormControl size="small" sx={{ minWidth: 100, flex: "1 1 50px" }}>
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
      <Button
        type="submit"
        size="small"
        variant="contained"
        sx={{
          height: 40,
          padding: "0 16px",
          textTransform: "none",
        }}
      >
        Add
      </Button>
    </Stack>
  );
};

export default AddMetadataForm;
