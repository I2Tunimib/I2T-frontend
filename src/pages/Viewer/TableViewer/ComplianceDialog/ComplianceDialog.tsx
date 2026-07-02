import React, { FC, useState, useEffect } from "react";
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
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import { HelpOutlineRounded } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { selectComplianceDialogStatus } from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import GDPRContent from "./GDPRContent";

interface ComplianceDialogProps {
  tableId?: string;
  datasetId?: string;
  readonly?: boolean;
}

const ComplianceDialog: FC<ComplianceDialogProps> = ({
  tableId,
  datasetId,
  readonly = false,
}) => {
  const [complianceType, setComplianceType] = useState<string>("");
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectComplianceDialogStatus);
  const initialComplianceType = useAppSelector((state: any) => state.table.ui.initialComplianceType);

  const handleClose = () => {
    dispatch(updateUI({ openComplianceStatusDialog: false }));
  };

  useEffect(() => {
    if (isOpen) {
      setComplianceType(initialComplianceType || "");
    } else {
      setComplianceType("");
      dispatch(updateUI({ initialComplianceType: "" }));
    }
  }, [isOpen, initialComplianceType, dispatch]);

  const handleTypeChange = (e: SelectChangeEvent<string>) => {
    setComplianceType(e.target.value);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <DialogTitle>{readonly ? "Compliance report" : "Compliance assessment"}</DialogTitle>
        <IconButton
          aria-label="open-compliance-tutorial"
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
        <Stack direction="row" alignItems="center">
          <DialogContentText>
            Select the type of compliance check you want to perform:
          </DialogContentText>
          <IconButton
            aria-label="open-compliance-discover"
            size="small"
            onClick={() => {
              dispatch(
                updateUI({
                  openHelpDialog: true,
                  helpStart: "discover",
                  discoverStep: 27,
                }),
              );
            }}
          >
            <HelpOutlineRounded />
          </IconButton>
        </Stack>
        <FormControl fullWidth sx={{ marginTop: "20px", marginBottom: "20px" }}>
          <InputLabel id="compliance-type-label">Compliance type</InputLabel>
          <Select
            labelId="compliance-type-label"
            value={complianceType}
            label="Compliance type"
            onChange={handleTypeChange}
            variant="outlined"
          >
            <MenuItem value="GDPR">
              GDPR (General Data Protection Regulation)
            </MenuItem>
          </Select>
        </FormControl>

        {complianceType === "GDPR" && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
            <GDPRContent tableId={tableId} datasetId={datasetId} readonly={readonly} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {complianceType ? "Close" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComplianceDialog;
