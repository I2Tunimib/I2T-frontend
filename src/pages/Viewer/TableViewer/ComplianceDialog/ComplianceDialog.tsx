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
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  HelpOutlineRounded,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
} from "@mui/icons-material";
import { selectAppConfig } from "@store/slices/config/config.selectors";
import {
  selectComplianceDialogStatus,
  selectCurrentTable,
  selectExportDialogStatus,
  selectIsUnsaved,
} from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { tableCompliance } from "@store/slices/table/table.thunk";
import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface ComplianceDialogProps {}

const ComplianceDialog: FC<ComplianceDialogProps> = () => {
  const [purpose, setPurpose] = useState<string>("General data processing");
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectComplianceDialogStatus);
  const { datasetId, tableId } = useParams<{
    datasetId: string;
    tableId: string;
  }>();
  const tableInstance = useAppSelector(selectCurrentTable);

  const handleClose = () => {
    dispatch(updateUI({ openComplianceStatusDialog: false }));
  };

  const handleConfirm = () => {
    if (!datasetId || !tableId) {
      return;
    }

    dispatch(
      tableCompliance({
        datasetId,
        tableId,
        purpose: purpose.trim() || "General data processing",
      }),
    );
  };

  const { complianceStatus, compliance: complianceResult } = tableInstance;

  // Parse compliance result
  const tableInfo = complianceResult?.[0]?.table;
  const columnResults = complianceResult?.slice(1) || [];

  const getGDPRColor = (gdpr: string) => {
    if (gdpr === "noGDPR") return "success";
    if (gdpr === "yesGDPR") return "error";
    if (gdpr === "pseudoGDPR") return "warning";
    return "default";
  };

  const getClassificationColor = (classification: string) => {
    if (classification === "personalData") return "error";
    if (classification === "quasiIdentifiers") return "warning";
    if (classification === "nonPersonalData") return "success";
    if (classification === "anonymousData") return "success";
    return "default";
  };

  const getActionColor = (action: string) => {
    if (action === "remove") return "error";
    if (action === "pseudonymize") return "warning";
    if (action === "noChange") return "success";
    return "default";
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <DialogTitle>GDPR Compliance Check</DialogTitle>
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
                tutorialStep: 5,
              }),
            );
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <DialogContentText>
          Specify the purpose of data processing for GDPR compliance evaluation
        </DialogContentText>

        <TextField
          fullWidth
          label="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., User analytics, Marketing campaigns, etc."
          sx={{ marginTop: "20px", marginBottom: "20px" }}
          multiline
          rows={2}
          helperText="Describe how this data will be used"
        />

        {complianceStatus === "PENDING" && (
          <Alert severity="info" icon={<CircularProgress size={20} />}>
            Checking GDPR compliance... This may take a moment.
          </Alert>
        )}

        {complianceStatus === "ERROR" && (
          <Alert severity="error">
            Compliance check failed. Please try again.
          </Alert>
        )}

        {complianceStatus === "DONE" && complianceResult && tableInfo && (
          <Box sx={{ marginTop: 2 }}>
            {/* Table Overview Card */}
            <Card sx={{ marginBottom: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  {tableInfo.gdpr === "noGDPR" ? (
                    <CheckCircle color="success" fontSize="large" />
                  ) : tableInfo.gdpr === "yesGDPR" ? (
                    <ErrorIcon color="error" fontSize="large" />
                  ) : (
                    <Warning color="warning" fontSize="large" />
                  )}
                  <Box>
                    <Typography variant="h6">
                      {`Table: ${tableInfo.sourceTable}`}
                    </Typography>
                    <Chip
                      label={tableInfo.gdpr}
                      color={getGDPRColor(tableInfo.gdpr)}
                      size="small"
                      sx={{ marginTop: 0.5 }}
                    />
                  </Box>
                </Stack>
                <Divider sx={{ marginBottom: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Reasoning:</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  {tableInfo.reasoning}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Confidence:</strong>
                  </Typography>
                  <Chip
                    label={`${(tableInfo.score * 100).toFixed(0)}%`}
                    size="small"
                    color={tableInfo.score >= 0.8 ? "success" : "warning"}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Columns Analysis */}
            <Typography variant="h6" gutterBottom>
              Column Analysis
            </Typography>
            <Paper sx={{ maxHeight: "400px", overflow: "auto" }}>
              <List>
                {columnResults.map((colResult: any, index: number) => {
                  const columnName = Object.keys(colResult)[0];
                  const analysis = colResult[columnName];
                  return (
                    <div key={columnName}>
                      <ListItem
                        sx={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: 2,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mb={1}
                          width="100%"
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {columnName}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <Chip
                            label={`${(analysis.score * 100).toFixed(0)}%`}
                            size="small"
                            color={
                              analysis.score >= 0.8 ? "success" : "warning"
                            }
                          />
                        </Stack>
                        <Stack direction="row" spacing={1} mb={1}>
                          <Chip
                            label={analysis.classification}
                            size="small"
                            color={getClassificationColor(
                              analysis.classification,
                            )}
                          />
                          <Chip
                            label={`Action: ${analysis.action}`}
                            size="small"
                            color={getActionColor(analysis.action)}
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.reasoning}
                        </Typography>
                      </ListItem>
                      {index < columnResults.length - 1 && <Divider />}
                    </div>
                  );
                })}
              </List>
            </Paper>
          </Box>
        )}

        {complianceStatus !== "PENDING" && (
          <FormControl fullWidth sx={{ marginTop: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={!purpose.trim()}
            >
              {complianceStatus === "DONE" ? "Check Again" : "Check Compliance"}
            </Button>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComplianceDialog;
