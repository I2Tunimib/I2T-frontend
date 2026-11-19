import { FC, useState, useEffect } from "react";
import { useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { selectCurrentTable } from "@store/slices/table/table.selectors";
import tableAPI from "@services/api/table";
import { useParams } from "react-router-dom";
import styles from "./CompliancePolicyPanel.module.scss";

interface ValidatorContentProps {
  tableId?: string;
  datasetId?: string;
}

const ValidatorContent: FC<ValidatorContentProps> = ({
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
  const [loading, setLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (tableInstance?.odrlPolicies && Object.keys(tableInstance.odrlPolicies).length > 0) {
      setPolicyText(JSON.stringify(tableInstance.odrlPolicies, null, 2));
    } else {
      setPolicyText("");
    }
  }, [tableInstance?.odrlPolicies]);

  const handleValidatePolicy = async () => {
    if (!policyText.trim()) return;
    setLoading(true);
    setValidationResult(null);

    try {
      const response = await tableAPI.validatePolicy(
        { datasetId, tableId },
        { odrl: policyText }
      );
      setValidationResult(response.data?.result);
    } catch (err) {
      console.error("SHACL validation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const results = validationResult ? [
    {
      label: "RDF",
      isValid: validationResult.is_valid_RDF,
      trueText: "Valid ✅",
      falseText: "Invalid ❌",
    },
    {
      label: "Contains ODRL",
      isValid: validationResult.contains_ODRL,
      trueText: "Yes ✅",
      falseText: "No ❌",
    },
    {
      label: "ODRL",
      isValid: validationResult.is_valid_ODRL,
      trueText: "Valid ✅",
      falseText: "Invalid ❌",
    }
  ] : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" fontWeight="bold">
        SHACL Inspector
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Inspects ODRL policy JSON to determine if they are correct RDF files containing syntactically correct ODRL files, using SHACL shapes for validation.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          bgcolor: "#fafafa",
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

      <Button
        variant="outlined"
        color="primary"
        size="medium"
        startIcon={<PlayArrowRoundedIcon />}
        onClick={handleValidatePolicy}
        disabled={loading || !policyText.trim()}
        fullWidth
      >
        {loading ? "Validating..." : "Validate Policy"}
      </Button>

      {validationResult && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Validation Result
          </Typography>

          {/* Main results */}
          {results.map((item, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                bgcolor: item.isValid ? "#edf7ed" : "#fdeded",
                border: `1px solid ${item.isValid ? "#c8e6c9" : "#f5c6cb"}`,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                color={item.isValid ? "#1e4620" : "#5f2120"}
              >
                <b>{item.label}:</b> {item.isValid ? item.trueText : item.falseText}
              </Typography>
            </Paper>
          ))}

          {/* SHACL Validation Explanation Banner */}
          {(validationResult.is_valid_RDF === false || validationResult.contains_ODRL === false || validationResult.is_valid_ODRL === false)
            && validationResult.shacl_validation_report_explanation && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "#fdeded",
                border: "1px solid #f5c6cb",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="#5f2120">
                {validationResult.shacl_validation_report_explanation}
              </Typography>
            </Paper>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Validation Details */}
          <Box sx={{ mt: 0 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Validation details
            </Typography>
            <ul className={styles.List}>
              {validationResult.file_format && (
                <li>
                  <Typography variant="body2">
                    <b>File format:</b> {validationResult.file_format}
                  </Typography>
                </li>
              )}
              {validationResult.ODRL_graph_size !== undefined && (
                <li>
                  <Typography variant="body2">
                    <b>RDF graph size:</b> {validationResult.ODRL_graph_size} triples
                  </Typography>
                </li>
              )}
            </ul>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* ODRL Statistics */}
          {validationResult.is_valid_ODRL && (
            <Box sx={{ mt: 0 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ODRL Statistics
              </Typography>
              {validationResult.odrl_stats_text && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    ODRL Entities Summary:
                  </Typography>
                  <ul className={styles.List}>
                    {validationResult.odrl_stats_text.split("\n").map((line: string, index: number) => {
                      const cleanLine = line.trim();
                      if (cleanLine.startsWith("-")) {
                        return (
                          <li key={index}>
                            <Typography variant="body2">{cleanLine.replace("-", "").trim()}</Typography>
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </>
              )}

              {/* ODRL Statistics Details */}
              {validationResult.odrl_stats && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    ODRL Statistics Details
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fafafa", mt: 0.5 }}>
                    <pre style={{ margin: 0, fontSize: "0.75rem", fontFamily: "monospace" }}>
                      {JSON.stringify(validationResult.odrl_stats, null, 2)}
                    </pre>
                  </Paper>
                </>
              )}
            </Box>
          )}

          {/* Errors */}
          {validationResult.errors && validationResult.errors.length > 0 && (
            <Box sx={{ mt: 0 }}>
              <Typography variant="subtitle2">
                Errors ({validationResult.errors.length}):
              </Typography>
              <ul className={styles.List}>
                {validationResult.errors.map((err: string, idx: number) => (
                  <li key={idx}>
                    <Typography variant="body2" color="error">{err}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Information */}
          {validationResult.info && validationResult.info.length > 0 && (
            <Box sx={{ mt: 0 }}>
              <Typography variant="subtitle2">
                Information ({validationResult.info.length}):
              </Typography>
              <ul className={styles.List}>
                {validationResult.info.map((msg: string, idx: number) => (
                  <li key={idx}>
                    <Typography variant="body2">{msg}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* SHACL Validation Report (Accordion) */}
          {validationResult.shacl_validation_report && (
            <Accordion sx={{ mt: 0 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  SHACL Validation Report
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#272822", color: "#f8f8f2" }}>
                  <pre style={{ margin: 0, fontSize: "0.75rem", fontFamily: "monospace", overflowX: "auto" }}>
                    {validationResult.shacl_validation_report}
                  </pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ValidatorContent;
