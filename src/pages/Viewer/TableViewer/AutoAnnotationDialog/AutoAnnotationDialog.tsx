import { useAppDispatch, useAppSelector } from "@hooks/store";
import React, { FC, useState, useEffect, useMemo } from "react";
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
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Tooltip,
  Stack,
} from "@mui/material";
import { selectAutoAnnotationDialogStatus } from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { automaticAnnotation } from "@store/slices/table/table.thunk";
import { useParams } from "react-router-dom";
import { HelpOutlineRounded } from "@mui/icons-material";

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

  const availableMethods = useMemo(() => {
    if (target === "fullTable") {
      return [
        { id: "alligator", label: "Semantic Table Annotation (Alligator)" },
      ];
    }
    if (target === "schema") {
      return [
        { id: "columnClassifier", label: "Column Classifier" },
        { id: "llm", label: "LLM Column Classifier" },
      ];
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
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <DialogTitle>Automatic Annotation</DialogTitle>
        <IconButton
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            marginRight: "20px",
          }}
          onClick={() => {
            dispatch(
              updateUI({
                openHelpDialog: true,
                helpStart: "tutorial",
                tutorialStep: 4,
              }),
            );
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <DialogContentText>
          Choose what to annotate automatically:
        </DialogContentText>
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
        <Button
          color="primary"
          disabled={!target || !method}
          onClick={handleConfirm}
        >
          Start annotation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoAnnotationDialog;
