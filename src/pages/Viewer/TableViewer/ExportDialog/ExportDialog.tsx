import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import { selectAppConfig } from "@store/slices/config/config.selectors";
import {
  selectCurrentTable,
  selectExportDialogStatus,
  selectIsUnsaved,
} from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { exportTable } from "@store/slices/table/table.thunk";
import fileDownload from "js-file-download";
import { useSnackbar } from "notistack";
import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface ExportDialogProps {}

const ExportDialog: FC<ExportDialogProps> = () => {
  const [type, setType] = useState<string>("");
  const [format, setFormat] = useState<string>("");
  const [csvDelimiter, setCsvDelimiter] = useState<string>(",");
  const [csvQuote, setCsvQuote] = useState<string>('"');
  const [csvDecimalSeparator, setCsvDecimalSeparator] = useState<string>(".");
  const [csvIncludeHeader, setCsvIncludeHeader] = useState<"yes" | "no" | "">("");
  const [rdfFormat, setRdfFormat] = useState<string>("");
  const [baseUri, setBaseUri] = useState<string>("");
  const [matchValue, setMatchValue] = useState<string>("");
  const [scoreValue, setScoreValue] = useState<number>(0);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectExportDialogStatus);
  const { datasetId, tableId } = useParams<{
    datasetId: string;
    tableId: string;
  }>();
  const { name: tableName } = useAppSelector(selectCurrentTable);
  const { API } = useAppSelector(selectAppConfig);
  const isUnsaved = useAppSelector(selectIsUnsaved);
  const { enqueueSnackbar } = useSnackbar();

  const handleClose = () => {
    dispatch(updateUI({ openExportDialog: false }));
  };

  useEffect(() => {
    setFormat("");
    setType("");
    setCsvDelimiter(",");
    setCsvQuote('"');
    setCsvDecimalSeparator(".");
    setCsvIncludeHeader();
    setRdfFormat("");
    setBaseUri("");
    setScoreValue(0);
    setMatchValue("");
  }, [API, isOpen]);

  const filteredFormats = API.ENDPOINTS.EXPORT.filter(({ name }) => {
    if (type === "table") return !name.toLowerCase().includes("pipeline");
    if (type === "pipeline") return name.toLowerCase().includes("pipeline");
    return true;
  });

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setType(event.target.value);
    setFormat("");
  };

  const handleFormatChange = (event: SelectChangeEvent<string>) => {
    const newFormat = event.target.value;

    // Check if the selected format is a pipeline and we have unsaved changes
    const isPipeline =
      newFormat === "Python pipeline" ||
      newFormat === "Jupyter notebook pipeline";

    if (isPipeline && isUnsaved) {
      // Show warning but don't change the format
      enqueueSnackbar(
        "Please save your changes before generating a pipeline. Click the save icon in the toolbar.",
        {
          variant: "warning",
          autoHideDuration: 6000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );
      return;
    }

    // Otherwise update the format
    setFormat(newFormat);
  };

  const handleConfirm = () => {
    const exportEndpoint = API.ENDPOINTS.EXPORT.find(
      (endpoint) => endpoint.name === format,
    );
    if (!exportEndpoint) {
      return;
    }

    // Don't allow pipeline exports if there are unsaved changes
    const isPipeline =
      format === "Python pipeline" || format === "Jupyter notebook pipeline";
    if (isPipeline && isUnsaved) {
      dispatch(updateUI({ openExportDialog: false }));
      enqueueSnackbar(
        "Please save your changes before generating a pipeline. Click the save icon in the toolbar.",
        {
          variant: "warning",
          autoHideDuration: 6000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );
      return;
    }

    const { params } = exportEndpoint;

    dispatch(
      exportTable({
        format,
        params: { tableId, datasetId },
      }),
    )
      .unwrap()
      .then((data) => {
        console.log("Export data received:", {
          format,
          dataType: typeof data,
          isArray: Array.isArray(data),
          dataPreview: typeof data === "string" ? data.substring(0, 100) : data,
        });

        if (params) {
          const { postDownload, extension } = params;
          const processedData = postDownload ? postDownload(data) : data;

          console.log("Processed data for download:", {
            originalType: typeof data,
            processedType: typeof processedData,
            processedPreview:
              typeof processedData === "string"
                ? processedData.substring(0, 100)
                : processedData,
          });

          fileDownload(processedData, `${tableName}.${extension}`);
        }
      });
    dispatch(updateUI({ openExportDialog: false }));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Export</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose what to export:
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: "20px", marginBottom: "20px" }}>
          <InputLabel id="type-label">Export type</InputLabel>
          <Select
            labelId="type-label"
            id="export-type-select"
            value={type}
            label="Export type"
            onChange={handleTypeChange}
            variant="outlined"
          >
            <MenuItem value="table">Table</MenuItem>
            <MenuItem value="pipeline">Pipeline</MenuItem>
          </Select>
        </FormControl>
        <DialogContentText>
          Choose an export format from those available:
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: "20px" }}>
          <InputLabel id="export-label" disabled={!type}>Export format</InputLabel>
          <Select
            labelId="export-label"
            id="export-select"
            value={format}
            label="Export format"
            onChange={handleFormatChange}
            disabled={!type}
            variant="outlined"
          >
            {filteredFormats.map(({ name, path }) => {
              // Disable pipeline options if there are unsaved changes
              const isPipeline =
                name === "Python pipeline" ||
                name === "Jupyter notebook pipeline";
              const isDisabled = isPipeline && isUnsaved;

              // For disabled items, wrap with Tooltip
              if (isDisabled) {
                return (
                  <Tooltip
                    key={path}
                    title="You must save your changes before generating a pipeline"
                    placement="right"
                  >
                    <span>
                      <MenuItem
                        value={name}
                        disabled={isDisabled}
                        sx={{ color: "text.disabled", fontStyle: "italic" }}
                      >
                        {name}
                        (save required)
                      </MenuItem>
                    </span>
                  </Tooltip>
                );
              }

              // For enabled items, render MenuItem directly without Tooltip wrapper
              return (
                <MenuItem key={path} value={name}>
                  {name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {format === "CSV" && (
          <>
            <DialogContentText sx={{ marginTop: "20px" }}>
              Configuration parameters
            </DialogContentText>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <InputLabel id="csv-sep">Field separator</InputLabel>
              <Select
                labelId="csv-sep"
                id="csv-sep-select"
                value={csvDelimiter}
                label="Field separator"
                onChange={(e) => setCsvDelimiter(e.target.value)}
                variant="outlined"
                required
              >
                <MenuItem value=",">Comma (,)</MenuItem>
                <MenuItem value=";">Semicolon (;)</MenuItem>
                <MenuItem value="\t">Tab (\t)</MenuItem>
              </Select>
              <FormHelperText>
                Character used to separate fields (default: comma).
              </FormHelperText>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <InputLabel id="csv-quote">Quote character</InputLabel>
              <Select
                labelId="csv-quote"
                id="csv-quote-select"
                value={csvQuote}
                label="Quote character"
                onChange={(e) => setCsvQuote(e.target.value)}
                variant="outlined"
                required
              >
                <MenuItem value='"'>Double quote (")</MenuItem>
                <MenuItem value="'">Single quote (')</MenuItem>
              </Select>
              <FormHelperText>
                Character used to quote text fields (default: ").
              </FormHelperText>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <InputLabel id="csv-dec-sep">Decimal separator</InputLabel>
              <Select
                labelId="csv-dec-sep"
                id="csv-dec-sep-select"
                value={csvDecimalSeparator}
                label="Decimal separator"
                onChange={(e) => setCsvDecimalSeparator(e.target.value)}
                variant="outlined"
                required
              >
                <MenuItem value=".">Dot (.)</MenuItem>
                <MenuItem value=",">Comma (,)</MenuItem>
              </Select>
              <FormHelperText>
                Character used to seperate decimal values (default: .).
              </FormHelperText>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">Include header row</Typography>
                <RadioGroup
                  row
                  value={csvIncludeHeader}
                  onChange={(e) => setCsvIncludeHeader(e.target.value as "yes" | "no")}
                  required
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </Box>
            </FormControl>
          </>
        )}
        {format === "RDF" && (
          <>
            <DialogContentText sx={{ marginTop: "20px" }}>
              Choose an export RDF format:
            </DialogContentText>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <InputLabel id="rdf-format">Output RDF format</InputLabel>
              <Select
                labelId="rdf-format"
                id="rdf-format-select"
                value={rdfFormat}
                label="Output RDF format"
                onChange={(e) => setRdfFormat(e.target.value)}
                variant="outlined"
                required
              >
                <MenuItem value="TURTLE">Turtle (.ttl)</MenuItem>
                <MenuItem value="XML">XML (.xml)</MenuItem>
                <MenuItem value="JSON">JSON (.json)</MenuItem>
                <MenuItem value="TRIG">TriG (.trig)</MenuItem>
                <MenuItem value="TRIX">TriX (.trix)</MenuItem>
                <MenuItem value="NQUADS">N-Quads (.nq)</MenuItem>
                <MenuItem value="NTRIPLES">N-Triples (.nt)</MenuItem>
              </Select>
            </FormControl>
            <DialogContentText sx={{ marginTop: "20px" }}>
              Configuration parameters
            </DialogContentText>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <TextField
                id="rdf-uri-text"
                value={baseUri}
                placeholder="http://example.org/"
                label="@base URI"
                onChange={(e) => setBaseUri(e.target.value)}
                variant="outlined"
                required
                helperText="URI to resolve relative URIs."
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <TextField
                id="rdf-score-text"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                value={scoreValue}
                label="Threshold score to filter exported entities"
                onChange={(e) => setScoreValue(Number(e.target.value))}
                variant="outlined"
                required
                helperText="Defines the minimum threshold score for filtering results; only entries with scores equal to
                or above this value are included."
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <Typography variant="body1">Match value</Typography>
              <RadioGroup
                value={matchValue}
                onChange={(e) => setMatchValue(e.target.value)}
                row
                required
              >
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label="All (Including all matching results.)"
                />
                <FormControlLabel
                  value="only_true"
                  control={<Radio />}
                  label="Only true (Including only results explicitly marked as true.)"
                />
              </RadioGroup>
            </FormControl>
          </>
        )}
        {/* <FormControlLabel
          control={<Checkbox checked={keepMatching} onChange={handleChange} />}
          label="Keep only matching metadata"
        /> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
