import { FC, useState, useEffect } from "react";
import { useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { selectCurrentTable } from "@store/slices/table/table.selectors";
import tableAPI from "@services/api/table";
import { useParams } from "react-router-dom";

interface EvaluatorContentProps {
  tableId?: string;
  datasetId?: string;
}

const EvaluatorContent: FC<EvaluatorContentProps> = ({
  tableId: propTableId,
  datasetId: propDatasetId,
}) => {
  const { datasetId: paramDatasetId, tableId: paramTableId } = useParams<{
    datasetId: string;
    tableId: string;
  }>();

  const datasetId = propDatasetId || paramDatasetId;
  const tableId = propTableId || paramTableId;
  const tableInstance = useAppSelector(selectCurrentTable);
  const [policyText, setPolicyText] = useState<string>("");
  const [sotwCsvText, setSotwCsvText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRawView, setIsRawView] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const parseCsv = (csvString: string) => {
    if (!csvString.trim()) return { headers: [], rows: [] };
    const lines = csvString.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
    const rows = lines.slice(1).map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim()));
    return { headers, rows };
  };

  const { headers: csvHeaders, rows: csvRows } = parseCsv(sotwCsvText);

  useEffect(() => {
    if (tableInstance?.odrlPolicies && Object.keys(tableInstance.odrlPolicies).length > 0) {
      setPolicyText(JSON.stringify(tableInstance.odrlPolicies, null, 2));
    } else {
      setPolicyText("");
    }
  }, [tableInstance?.odrlPolicies]);

  useEffect(() => {
    const fetchSotwCsv = async () => {
      if (!datasetId || !tableId) return;
      setLoading(true);
      try {
        const response = await tableAPI.exportTable("State of the World (CSV)", {
          datasetId,
          tableId,
        });
        setSotwCsvText(response.data);
      } catch (err) {
        console.error("Failed to load SoTW CSV:", err);
        setSotwCsvText("");
      } finally {
        setLoading(false);
      }
    };

    fetchSotwCsv();
  }, [datasetId, tableId]);

  const handleEvaluatePolicy = async () => {
    if (!policyText.trim() || !sotwCsvText.trim()) return;
    setLoading(true);
    setEvaluationResult(null);

    try {
      const response = await tableAPI.evaluatePolicy(
        { datasetId, tableId },
        { policy: policyText, sotw: sotwCsvText }
      );
      setEvaluationResult(response.data);
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const isValid = evaluationResult?.valid;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" fontWeight="bold">
        Policy Evaluator on SotW
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The ODRL Policy and the State of the World (CSV) are automatically retrieved from the current table and pipeline.
        You can inspect them below.
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="stretch"
      >
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            bgcolor: "#fafafa",
            overflow: "hidden",
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              ODRL Policy (JSON-LD)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Policy Text
            </Typography>
          </Box>
          <TextField
            multiline
            rows={12}
            fullWidth
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            placeholder="No ODRL policy found for this table..."
            InputProps={{
              sx: {
                fontFamily: "monospace",
                fontSize: "0.75rem",
                bgcolor: "#ffffff",
              },
            }}
          />
        </Paper>

        {/* State of the World (CSV) */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            bgcolor: "#fafafa",
            overflow: "hidden",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                State of the World (CSV)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isRawView ? "CSV Text (Raw)" : "Structured Table View"}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={isRawView}
                  onChange={(e) => setIsRawView(e.target.checked)}
                />
              }
              label={<Typography variant="caption">Raw View</Typography>}
            />
          </Stack>

          {isRawView ? (
            <TextField
              multiline
              rows={12}
              fullWidth
              value={sotwCsvText}
              onChange={(e) => setSotwCsvText(e.target.value)}
              placeholder="No table data available to generate CSV..."
              InputProps={{
                sx: {
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  bgcolor: "#ffffff",
                },
              }}
            />
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxHeight: 300, bgcolor: "#ffffff" }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {csvHeaders.map((header, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          bgcolor: "#f5f5f5",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span title={header}>
                          {header.split("/").pop()?.split("#").pop() || header}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvRows.length > 0 ? (
                    csvRows.map((row, rIdx) => (
                      <TableRow key={rIdx} hover>
                        {row.map((cell, cIdx) => (
                          <TableCell
                            key={cIdx}
                            sx={{
                              fontSize: "0.75rem",
                              fontFamily: "monospace",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={csvHeaders.length || 1} align="center">
                        <Typography variant="caption" color="text.secondary">
                          No operations recorded yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <Button
        variant="outlined"
        color="primary"
        size="medium"
        startIcon={<PlayArrowRoundedIcon />}
        onClick={handleEvaluatePolicy}
        disabled={loading || !policyText.trim() || !sotwCsvText.trim()}
        fullWidth
      >
        {loading ? "Evaluating..." : "Evaluate Policy"}
      </Button>

      {evaluationResult && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Evaluation Result
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: isValid ? "#edf7ed" : "#fdeded",
              border: `1px solid ${isValid ? "#c8e6c9" : "#f5c6cb"}`,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body2"
              color={isValid ? "#1e4620" : "#5f2120"}
            >
              {isValid
                ? "✅ YES — State of the World is VALID (Compliant with the Policy)"
                : "❌ NO — State of the World is NOT VALID (Non-compliant with the Policy)"}
            </Typography>
          </Paper>

          <Divider sx={{ my: 1 }} />

          {/* Evaluation Summary */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Evaluation Summary
            </Typography>

            {/* Rows Violating Permissions */}
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Rows violating permissions
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fafafa", mt: 0.5 }}>
              <pre style={{ margin: 0, fontSize: "0.75rem", fontFamily: "monospace" }}>
                {JSON.stringify(evaluationResult.rows_violating_permissions || [], null, 2)}
              </pre>
            </Paper>

            {/* Rows Violating Prohibitions */}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Rows violating prohibitions
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fafafa", mt: 0.5 }}>
              <pre style={{ margin: 0, fontSize: "0.75rem", fontFamily: "monospace" }}>
                {JSON.stringify(evaluationResult.rows_violating_prohibitions || [], null, 2)}
              </pre>
            </Paper>

            {/* JSON Response */}
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  View Full Evaluation JSON Response
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#272822", color: "#f8f8f2" }}>
                  <pre style={{ margin: 0, fontSize: "0.75rem", fontFamily: "monospace", overflowX: "auto" }}>
                    {JSON.stringify(evaluationResult, null, 2)}
                  </pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EvaluatorContent;
