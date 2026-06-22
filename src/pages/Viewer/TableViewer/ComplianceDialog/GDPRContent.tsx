import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  TextField,
  FormControl,
  Typography,
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
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Download,
  Article,
} from "@mui/icons-material";
import { selectCurrentTable } from "@store/slices/table/table.selectors";
import { tableCompliance } from "@store/slices/table/table.thunk";
import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ComplianceReport } from "@store/slices/table/interfaces/table";
import tableAPI from "@services/api/table";

interface GDPRContentProps {
  tableId?: string;
  datasetId?: string;
}

const GDPRContent: FC<GDPRContentProps> = ({
  tableId: propTableId,
  datasetId: propDatasetId,
}) => {
  const [purpose, setPurpose] = useState<string>("General data processing");
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(-1);
  const dispatch = useAppDispatch();
  const { datasetId: paramDatasetId, tableId: paramTableId } = useParams<{
    datasetId: string;
    tableId: string;
  }>();

  // Use props if provided, otherwise fall back to URL params
  const datasetId = propDatasetId || paramDatasetId;
  const tableId = propTableId || paramTableId;
  const tableInstance = useAppSelector(selectCurrentTable);

  const handleConfirm = () => {
    if (!datasetId || !tableId) return;
    dispatch(
      tableCompliance({
        datasetId,
        tableId,
        purpose: purpose.trim() || "General data processing",
      }),
    );
  };

  const handleDownload = async (format: "json" | "md") => {
    if (!datasetId || !tableId) return;
    const reportIndex =
      selectedReportIndex >= 0 ? selectedReportIndex : "latest";
    try {
      const response = await tableAPI.downloadComplianceReport(
        { datasetId, tableId, reportIndex },
        format,
      );
      const ext = format === "md" ? "md" : "json";
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `compliance_report_${reportIndex}.${ext}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // silently fail — user will see no file
    }
  };

  const {
    complianceStatus,
    complianceReports,
    compliance: legacyCompliance,
  } = tableInstance;

  // Select the last report by default whenever reports change
  useEffect(() => {
    if (complianceReports && complianceReports.length > 0) {
      setSelectedReportIndex(complianceReports.length - 1);
    }
  }, [complianceReports?.length]);

  // Resolve the active compliance result
  const activeReport: ComplianceReport | null =
    complianceReports &&
    complianceReports.length > 0 &&
    selectedReportIndex >= 0
      ? complianceReports[selectedReportIndex]
      : null;

  // Fall back to legacy compliance field for older tables
  const complianceResult: any[] | null =
    activeReport?.result ?? legacyCompliance ?? null;

  const tableInfo = complianceResult?.[0]?.table;
  const columnResults: { name: string; analysis: any }[] =
    complianceResult
      ?.slice(1)
      .flatMap((item: any) =>
        Object.entries(item).map(([name, analysis]) => ({ name, analysis })),
      )
      .filter(
        ({ analysis }) =>
          analysis !== null &&
          typeof analysis === "object" &&
          "classification" in analysis,
      ) ?? [];

  const getGDPRColor = (gdpr: string) => {
    if (gdpr === "noGDPR") return "success";
    if (gdpr === "yesGDPR") return "error";
    if (gdpr === "pseudoGDPR") return "warning";
    return "default";
  };

  const getActionColor = (action: string) => {
    if (action === "remove") return "error";
    if (action === "pseudonymize") return "warning";
    if (action === "noChange") return "success";
    return "default";
  };

  const formatReportLabel = (report: ComplianceReport, index: number) => {
    const date = new Date(report.date).toLocaleString();
    const user = report.userId ? `User ${report.userId}` : "Unknown user";
    return `Report ${index + 1} — ${date} by ${user}`;
  };

  const hasMultipleReports = complianceReports && complianceReports.length > 1;
  const isResultAvailable =
    complianceStatus === "DONE" && complianceResult && tableInfo;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        GDPR Configuration
      </Typography>
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

      {isResultAvailable && (
        <Box sx={{ marginTop: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ marginBottom: 2 }}
          >
            {hasMultipleReports && (
              <FormControl fullWidth>
                <InputLabel id="report-select-label">Report</InputLabel>
                <Select
                  labelId="report-select-label"
                  value={selectedReportIndex}
                  label="Report"
                  onChange={(e) =>
                    setSelectedReportIndex(Number(e.target.value))
                  }
                  size="small"
                >
                  {complianceReports!.map((report, index) => (
                    <MenuItem key={index} value={index}>
                      {formatReportLabel(report, index)}
                      {index === complianceReports!.length - 1 && (
                        <Chip
                          label="latest"
                          size="small"
                          sx={{ ml: 1 }}
                          color="primary"
                        />
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Tooltip title="Download as JSON">
              <IconButton onClick={() => handleDownload("json")} size="small">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download as Markdown">
              <IconButton onClick={() => handleDownload("md")} size="small">
                <Article />
              </IconButton>
            </Tooltip>
          </Stack>

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
              {columnResults.map(({ name: columnName, analysis }, index) => {
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
                          color="default"
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                          label={analysis.classification}
                          size="small"
                          color="default"
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
    </Box>
  );
};

export default GDPRContent;
