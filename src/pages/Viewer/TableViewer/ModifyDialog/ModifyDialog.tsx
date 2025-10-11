import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Stack,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Divider,
  Button,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { HelpOutlineRounded } from "@mui/icons-material";
import { SquaredBox } from "@components/core";
import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { updateUI, updateColumnCellsLabels } from "@store/slices/table/table.slice";
import { selectSelectedColumnCellsIdsAsArray } from "@store/slices/table/table.selectors";
import { toFormattedDate } from "@services/utils/format-date";

const Content = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

type ModifyDialogProps = {
  open: boolean;
  handleClose: () => void;
};

const ModifyDialog: React.FC<ModifyDialogProps> = ({ open, handleClose }) => {
  const dispatch = useAppDispatch();
  const tableRows = useAppSelector((state) => state.table.entities.rows);

  const selectedColumns = useAppSelector(selectSelectedColumnCellsIdsAsArray);
  const [selectedColumnsLocal, setSelectedColumnsLocal] = useState<string[]>(selectedColumns || []);

  const [selectedTransformation, setSelectedTransformation] = useState("");
  const [formatType, setFormatType] = useState("iso");
  const [customPattern, setCustomPattern] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedColumnsLocal(selectedColumns || []);
    setCustomPattern("");
    setError(null);
  }, [selectedColumns]);

  const handleApply = () => {
    if (!selectedColumnsLocal.length || selectedTransformation !== "date" || !tableRows?.allIds?.length) return;

    const pattern = formatType === "iso" ? "yyyy-MM-dd" : customPattern;
    const updates: { cellId: string; value: string }[] = [];

    for (const colId of selectedColumnsLocal) {
      for (const rowId of tableRows.allIds) {
        const cell = tableRows.byId[rowId]?.cells[colId];
        if (cell?.label != null) {
          const result = toFormattedDate(cell.label, pattern);
          if (result.error) {
            setError(`Error: ${result.error}`);
            return;
          }
          updates.push({ cellId: `${rowId}$${colId}`, value: result.value! });
        }
      }
    }
    setError(null);
    if (updates.length > 0) {
      dispatch(updateColumnCellsLabels({ updates }));
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <DialogTitle>
          Modify Column
        </DialogTitle>
        <IconButton
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            marginRight: "20px",
          }}
          onClick={() => {
            dispatch(updateUI({ openHelpDialog: true, tutorialStep: 3 }));
          }}>
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <DialogContentText paddingBottom="10px">
          Select a transformation function to modify with:
        </DialogContentText>
        <Content>
          <Stack>
            {/* Select trasformation function */}
            <FormControl className="field">
              <Select
                labelId="modifier-label"
                value={selectedTransformation}
                onChange={(e) => setSelectedTransformation(e.target.value)}
                variant="outlined"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "400px",
                    },
                  },
                }}
              >
                <MenuItem value="date">
                  Date formatter (ISO 8601, custom pattern)
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
          {/* Transformation options */}
          {selectedTransformation === "date" && selectedColumns && (
            <>
              <SquaredBox>
                <Typography component="span">
                  A transformation function that converts date-like values in the selected column(s) into
                  a standardized or custom date format, using
                  <i> date-fns </i>
                  library for date parsing and formatting.
                </Typography>
              </SquaredBox>
              {error && <Typography color="error">{error}</Typography>}
              <Divider />
              <Stack>
                <FormControl style={{ paddingBottom: "10px" }}>
                  <Typography sx={{ mb: 1 }}>
                    Select columns to transform:
                  </Typography>
                  <Select
                    multiple
                    value={selectedColumnsLocal}
                    onChange={(e) => setSelectedColumnsLocal(e.target.value as string[])}
                    renderValue={(selected) => selected.join(", ")}
                    displayEmpty
                    variant="contained"
                  >
                    {Object.keys(tableRows.byId[tableRows.allIds[0]]?.cells || {}).map(
                      (columnId) => (
                        <MenuItem
                          key={columnId}
                          value={columnId}
                          disabled={selectedColumns.includes(columnId)}
                        >
                          {columnId}
                          {selectedColumns.includes(columnId) && " (selected)"}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
                <Typography sx={{ mb: 1 }}>
                  Select the date format:
                </Typography>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={formatType === "iso"}
                      onChange={() => setFormatType("iso")}
                    />
                  )}
                  label="ISO 8601 (yyyy-MM-dd)"
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={formatType === "custom"}
                      onChange={() => {
                        if (!error) setFormatType("custom");
                      }}
                      disabled={!!error}
                    />
                  )}
                  label={
                    error
                      ? "Custom pattern (Not available, resolve error)"
                      : "Custom pattern"
                  }
                />
                {formatType === "custom" && (
                  <Stack style={{ paddingTop: "10px" }}>
                    <FormControl>
                      <Typography sx={{ mb: 1 }}>
                        Define your custom format pattern:
                      </Typography>
                      <TextField
                        label="Custom format pattern"
                        placeholder="e.g. dd/MM/yyyy"
                        value={customPattern}
                        onChange={(e) => setCustomPattern(e.target.value)}
                        disabled={!!error}
                      />
                    </FormControl>
                  </Stack>
                )}
              </Stack>
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  variant="outlined"
                  onClick={handleApply}
                  disabled={formatType === "custom" && !customPattern}
                >
                  Apply transformation
                </Button>
              </Stack>
            </>
          )}
        </Content>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyDialog;
