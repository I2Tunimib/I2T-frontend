import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
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
  const [format, setFormat] = useState<string>("");
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
    if (API.ENDPOINTS.EXPORT && API.ENDPOINTS.EXPORT.length > 0) {
      setFormat(API.ENDPOINTS.EXPORT[0].name || "");
    }
  }, [API]);

  const handleChange = (event: SelectChangeEvent<string>) => {
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
      <DialogTitle>Export table</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose an export format from those available:
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: "20px" }}>
          <InputLabel id="export-label">Export format</InputLabel>
          <Select
            labelId="export-label"
            id="export-select"
            value={format}
            label="Export format"
            onChange={handleChange}
          >
            {API.ENDPOINTS.EXPORT.map(({ name, path }) => {
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
                        {name} (save required)
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
