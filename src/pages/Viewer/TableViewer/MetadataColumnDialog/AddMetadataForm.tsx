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
} from "@mui/material";
import {
  SelectColumns,
  SelectPrefix,
} from "@components/core/DynamicForm/formComponents/Select";
import { Controller, useForm } from "react-hook-form";

export interface AddMetadataFormProps {
  currentService: string;
  onSubmit: (data: any) => void;
  context: "metadataDialog" | "typeTab" | "propertyTab";
  otherColumns?: { id: string; label: string; value: string }[];
}

const AddMetadataForm: FC<AddMetadataFormProps> = ({
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

  const watchedPrefix = watch("prefix");

  useEffect(() => {
    if (currentService !== undefined) {
      reset({ prefix: currentService });
      setCustomPrefix("");
    }
  }, [currentService, reset]);

  console.log("AddMetadataForm currentService", currentService);

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
                disabled={!!currentService}
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
        {...register("uri")}
      />
      <Tooltip title="Enter a name" arrow placement="top">
        <TextField
          sx={{
            minWidth: 150,
            flex: context === "typeTab" ? "1 1 30px" : "1 1 150px",
          }}
          size="small"
          label="Name"
          required
          variant="outlined"
          {...register("name")}
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
