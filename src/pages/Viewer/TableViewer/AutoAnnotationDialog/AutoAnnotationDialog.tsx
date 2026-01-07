import { useAppDispatch, useAppSelector } from "@hooks/store";
import { FC, useState, useEffect, useMemo } from "react";
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
  selectAutoAnnotationDialogStatus,
  selectIsUnsaved,
} from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { automaticAnnotation } from "@store/slices/table/table.thunk";
import { useSnackbar } from "notistack";
import { useParams } from "react-router-dom";

interface AutoAnnotationDialogProps {}

const AutoAnnotationDialog: FC<AutoAnnotationDialogProps> = () => {
  const [target, setTarget] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectAutoAnnotationDialogStatus);
  const { datasetId, tableId } = useParams<{
    datasetId: string;
    tableId: string;
  }>();
  const { name: tableName } = useAppSelector(selectCurrentTable);
  const { API } = useAppSelector(selectAppConfig);
  const isUnsaved = useAppSelector(selectIsUnsaved);
  const { enqueueSnackbar } = useSnackbar();

  const availableMethods = useMemo(() => {
    if (target === "fullTable") {
      return [{ id: "alligator", label: "Semantic Table Annotation (Alligator)" }];
    }
    if (target === "schema") {
      return [{ id: "columnClassifier", label: "Column Classifier" }];
    }
    return [];
  }, [target]);

  const handleClose = () => {
    dispatch(updateUI({ openAutoAnnotationDialog: false }));
  };

  useEffect(() => {
    setTarget("");
    setMethod("");
  }, [isOpen]);

  const handleTargetChange = (e: SelectChangeEvent<string>) => {
    setTarget(e.target.value);
    setMethod("");
  };

  const handleConfirm = () => {
    dispatch(
      automaticAnnotation({
        datasetId,
        tableId,
        target,
        method,
      }),
    );

    dispatch(updateUI({ openAutoAnnotationDialog: false }));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Automatic Annotation</DialogTitle>
      <DialogContent>
        <DialogContentText>Choose what to annotate automatically:</DialogContentText>
        <FormControl fullWidth sx={{ marginTop: "20px", marginBottom: "20px" }}>
          <InputLabel id="target-label">Annotation target</InputLabel>
          <Select
            labelId="target-label"
            value={target}
            label="Annotate target"
            onChange={handleTargetChange}
            variant="outlined"
          >
            <MenuItem value="fullTable">Full table</MenuItem>
            <MenuItem value="schema">Schema</MenuItem>
          </Select>
        </FormControl>
        <DialogContentText>
          Choose the annotation method from those available:
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: "20px" }}>
          <InputLabel id="method-label" disabled={!target}>
            Annotation method
          </InputLabel>
          <Select
            labelId="method-label"
            value={method}
            label="Annotation method"
            onChange={(e) => setMethod(e.target.value)}
            disabled={!target}
            variant="outlined"
          >
            {availableMethods.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="primary" disabled={!target || !method} onClick={handleConfirm}>
          Start annotation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoAnnotationDialog;
