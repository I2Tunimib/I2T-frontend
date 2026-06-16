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
  Typography, IconButton, Stack,
} from "@mui/material";
import { selectAppConfig } from "@store/slices/config/config.selectors";
import {
  selectCurrentTable,
  selectExportDialogStatus,
  selectIsUnsaved,
  selectCurrentView,
} from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { exportTable } from "@store/slices/table/table.thunk";
import fileDownload from "js-file-download";
import { useSnackbar } from "notistack";
import React, { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HelpOutlineRounded } from "@mui/icons-material";

interface ExportDialogProps {}

const ExportDialog: FC<ExportDialogProps> = () => {
  const [type, setType] = useState<string>("");
  const [format, setFormat] = useState<string>("");
  const [csvDelimiter, setCsvDelimiter] = useState<string>(",");
  const [csvQuote, setCsvQuote] = useState<string>('"');
  const [csvDecimalSeparator, setCsvDecimalSeparator] = useState<string>(".");
  const [csvIncludeHeader, setCsvIncludeHeader] = useState<string>("true");
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
  const graphSnapshot = useAppSelector((state) => state.table.ui.currentGraphSnapshot) || "";
  const graphData = useAppSelector((state) => state.table.ui.currentGraphData || { nodes: [], links: [] });
  const showLinkLabels = useAppSelector((state) => state.table.ui.showLinkLabels);
  const metrics = useAppSelector((state) => state.table.ui.currentMetrics || []);
  const currentView = useAppSelector(selectCurrentView);

  const handleClose = () => {
    dispatch(updateUI({ openExportDialog: false }));
  };

  useEffect(() => {
    setFormat("");
    setType("");
    setCsvDelimiter(",");
    setCsvQuote('"');
    setCsvDecimalSeparator(".");
    setCsvIncludeHeader("");
    setRdfFormat("");
    setBaseUri("");
    setScoreValue(0);
    setMatchValue("");
  }, [API, isOpen]);

  const filteredFormats = API.ENDPOINTS.EXPORT.filter(({ name }) => {
    if (type === "schema") return name.toLowerCase().includes("schema");
    if (type === "table") return !name.toLowerCase().includes("schema") && !name.toLowerCase().includes("pipeline");
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

  const handleLinkLabelsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "true";
    dispatch(updateUI({ showLinkLabels: value }));
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

    // RDF extension mapping
    const rdfExtensions: Record<string, string> = {
      TURTLE: "ttl",
      XML: "rdf",
      JSON: "jsonld",
      TRIG: "trig",
      TRIX: "trix",
      NQUADS: "nq",
      NTRIPLES: "nt",
    };

    // Build API params
    const apiParams: Record<string, string | number> = {
      tableId: tableId!,
      datasetId: datasetId!,
    };

    // Add CSV-specific params if this is an RDF export
    if (format === "CSV") {
      apiParams.delimiter = csvDelimiter;
      apiParams.quote = csvQuote;
      apiParams.decimalSeparator = csvDecimalSeparator;
      apiParams.includeHeader = csvIncludeHeader;
    }

    // Add RDF-specific params if this is an RDF export
    if (format === "RDF") {
      apiParams.serialization = rdfFormat;
      apiParams.baseUri = baseUri;
      apiParams.score = scoreValue;
      apiParams.match = matchValue;
    }

    dispatch(
      exportTable({
        format,
        params: apiParams,
      }),
    )
      .unwrap()
      .then((data) => {
        console.log("Export data received:", {
          format,
          params,
          dataType: typeof data,
          isArray: Array.isArray(data),
          dataPreview: typeof data === "string" ? data.substring(0, 100) : data,
        });

        if (format === "HTML Schema Report") {
          const schema = data[0] || {};
          console.log("schema", schema);
          const cleanStr = (str: string) => str?.trim().replace(/^\uFEFF/, '') || '';

          const nodesHtml = Object.values(schema).map((th: any, index: number) => {
            const types = th.metadata?.flatMap((m: any) => m.type ?? []) ?? [];

            const outgoing = (graphData?.links || []).filter((l: any) => cleanStr(l.source) === cleanStr(th.label));
            const incoming = (graphData?.links || []).filter((l: any) => cleanStr(l.target) === cleanStr(th.label));
            const totalPropertiesCount = outgoing.length + incoming.length;

            const typeListId = `node-types-${index}`;
            const typeBtnId = `node-types-btn-${index}`;
            const propListId = `node-props-${index}`;
            const propBtnId = `node-props-btn-${index}`;

            const typesListHtml = `<ul style="margin: 4px 0; padding-left: 20px;">
                  ${types.map((t: any) => `<li>${t.name} (<strong>${t.id}</strong>)</li>`).join('')}
                </ul>`;

            const outgoingHtml = outgoing.length > 0
              ? `<p style="margin: 2px 0; font-size: 13px; font-weight: bold;">Outgoing Relations:</p>
                <ul style="margin: 0 0 6px 0; padding-left: 20px;">
                  ${outgoing.map((l: any) => `<li>&rarr; ${l.target} (<strong>${l.propID}</strong> - ${l.label})</li>`).join('')}
                </ul>`
              : `<p style="margin: 2px 0; font-size: 13px; font-weight: bold;">Outgoing Relations: <span style="color: #718096; font-weight: normal; font-style: italic; margin-left: 5px;">None</span></p>`;

            const incomingHtml = incoming.length > 0
              ? `<p style="margin: 2px 0; font-size: 13px; font-weight: bold;">Incoming Relations:</p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${incoming.map((l: any) => `<li>&larr; ${l.source} (<strong>${l.propID}</strong> - ${l.label})</li>`).join('')}
                </ul>`
              : `<p style="margin: 2px 0; font-size: 13px; font-weight: bold;">Incoming Relations: <span style="color: #718096; font-weight: normal; font-style: italic; margin-left: 5px;">None</span></p>`;

            const propertiesListHtml = `
              <div style="margin-top: 4px; padding-left: 10px;">
                ${outgoingHtml}
                <div style="margin-top: 6px;"></div> ${incomingHtml}
              </div>`;

            return `
              <div style="border-bottom: 1px solid #edf2f7; padding: 12px 0;">
                <h4 style="margin: 0 0 8px 0; color: #3182ce;">Column: ${th.label || 'N/A'}</h4>
                <p style="margin: 2px 0; font-size: 14px;"><strong>Kind:</strong> ${th.kind || '-'}</p>
                <p style="margin: 2px 0; font-size: 14px;"><strong>Role:</strong> ${th.role || '-'}</p>
                <p style="margin: 2px 0; font-size: 14px;">
                  <strong>${th.kind === "literal" ? "Datatype:" : "Semantic Class:"}</strong> ${th.datatype || '-'}
                </p>

                <div style="margin-top: 8px; font-size: 14px">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span><strong>Types (${types.length})</strong></span>
                    ${types.length > 0 ? `<span id="${typeBtnId}" class="action-link" onclick="toggleSection('${typeListId}', '${typeBtnId}')">Show list</span>` : ''}
                  </div>
                  <div id="${typeListId}" class="collapsible-content">${typesListHtml}</div>
                </div>

                <div style="margin-top: 2px; font-size: 14px;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span><strong>Properties (${totalPropertiesCount})</strong></span>
                    ${totalPropertiesCount > 0 ? `<span id="${propBtnId}" class="action-link" onclick="toggleSection('${propListId}', '${propBtnId}')">Show list</span>` : ''}
                  </div>
                  <div id="${propListId}" class="collapsible-content">${propertiesListHtml}</div>
                </div>
              </div>
            `;
          }).join('');

          const relationsMap: Record<string, { source: string; target: string; properties: Array<{ id: string; name: string }> }> = {};

          Object.values(schema).forEach((th: any) => {
            const sourceLabel = cleanStr(th.label);

            (th.metadata ?? []).forEach((m: any) => {
              (m.property ?? []).forEach((p: any) => {
                const targetLabel = cleanStr(p.obj);
                const pairKey = `${sourceLabel}->${targetLabel}`;

                if (!relationsMap[pairKey]) {
                  relationsMap[pairKey] = {
                    source: sourceLabel,
                    target: targetLabel,
                    properties: []
                  };
                }

                if (!relationsMap[pairKey].properties.some((prop) => prop.id === p.id)) {
                  relationsMap[pairKey].properties.push({
                    id: p.id,
                    name: p.name
                  });
                }
              });
            });
          });

          const linksHtml = Object.values(relationsMap).map((rel) => {
            const propertiesList = rel.properties
              .map((p) => `<li style="margin: 4px 0;"><strong>${p.id}</strong> - ${p.name}</li>`)
              .join('');

            return `
              <div style="border-bottom: 1px solid #edf2f7; padding: 12px 0;">
                <h4 style="margin: 0 0 8px 0;  color: #3182ce;">Relation: ${rel.source} &rarr; ${rel.target}</h4>
                <ul style="margin: 4px 0; padding-left: 20px; font-size: 14px; list-style-type: disc;">
                  ${propertiesList}
                </ul>
              </div>
            `;
          }).join('');

          const metricsHtml = (metrics || []).map((m: any) => {
            if (m.name === 'Roles Distribution') {
              const rolesList = m.value.map((r: any) => `<li><strong>${r.role}:</strong> ${r.count}</li>`).join('');
              return `
                <div style="border-bottom: 1px solid #edf2f7; padding: 12px 0;">
                  <h4 style="margin: 0 0 4px 0; font-size: 14px;">${m.name}</h4>
                  <ul style="margin: 4px 0 6px 0; padding-left: 20px; font-size: 14px; list-style-type: disc;">${rolesList}</ul>
                  <p style="margin: 4px 0 0 0; color: #718096; font-size: 13px;"><em>${m.description}</em></p>
                </div>
              `;
            }

              return `
                <div style="border-bottom: 1px solid #edf2f7; padding: 12px 0;">
                  <h4 style="margin: 0 0 4px 0; font-size: 14px;">${m.name}: <span style="color: #2d3748; font-weight: normal;">${m.value}</span></h4>
                  <p style="margin: 0; color: #718096; font-size: 13px;"><em>${m.description}</em></p>
                </div>
              `;
          }).join('');

          const finalHtmlDocument = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>Schema Report - ${tableName}</title>
              <style>
                body { font-family: Roboto, sans-serif; margin: 40px; color: #2d3748; line-height: 1.6; background-color: #f7fafc; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                h1 { color: #1a365d; border-bottom: 3px solid #2b6cb0; padding-bottom: 10px; margin-top: 0; }
                h2 { color: #1a365d; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
                .meta-box { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; border-radius: 4px; margin-bottom: 30px; }
                .section { margin-bottom: 40px; }
                .row { display: flex; gap: 40px; flex-wrap: wrap; }
                .column { flex: 1; min-width: 450px; background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; }
                .graph-container { text-align: center; padding: 30px; border: 1px solid #cbd5e0; border-radius: 8px; }
                .graph-wrapper-rel { position: relative; display: inline-block; max-width: 100%; }
                .graph-img { max-width: 100%; height: auto; }
                .legend-floating-box { position: absolute; top: 8px; left: 0; z-index: 10; display: flex; flex-direction: column; gap: 4px; padding: 16px; border-radius: 6px; border: 1px solid #cbd5e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left; }
                .legend-title { font-weight: bold; margin: 0 0 4px 0; }
                .legend-item { display: flex; align-items: center; gap: 6px; }
                .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
                .dot-subject { background-color: #2ecc71; }
                .dot-entity { background-color: #3498db; }
                .dot-literal { background-color: #e67e22; }
                .action-link { color: #a0aec0; cursor: pointer; font-size: 13px; font-weight: 400; user-select: none; transition: color 0.2s ease; }
                .action-link:hover { color: #4a5568; text-decoration: underline; }
                .collapsible-content { display: none; overflow: hidden; margin-top: 4px; }
                .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; align-items: stretch; }
                .metric-item { background: #fff; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0; justify-content: space-between; }
                ul { padding-left: 20px; margin: 4px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Schema Report</h1>
                <div class="meta-box">
                  <p style="margin: 0;"><strong>Table Name:</strong> ${tableName}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Dataset ID:</strong> ${datasetId} | <strong>Table ID:</strong> ${tableId}</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #4a5568;"><em>Generated on: ${new Date().toLocaleString()}</em></p>
                </div>

                <div class="section graph-container">
                  <h2 style="margin-top: 0; border: none;">Schema Graph Visualization</h2>
                  <div class="graph-wrapper-rel">
                    <div class="legend-floating-box">
                      <p class="legend-title">Legend</p>
                      <div class="legend-item"><span class="dot dot-subject"></span> Subject</div>
                      <div class="legend-item"><span class="dot dot-entity"></span> Entity</div>
                      <div class="legend-item"><span class="dot dot-literal"></span> Literal</div>
                    </div>

                    ${graphSnapshot
                      ? `<img class="graph-img" src="${graphSnapshot}" alt="Schema Graph" />`
                      : '<p style="color: #e53e3e; font-weight: bold; padding: 40px; background: white; border-radius: 6px;">Schema Graph snapshot not available. Please open the Graph View tab before exporting.</p>'}
                    </div>
                  </div>

                <div class="section" style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <h2>Columns (${graphData?.nodes?.length || 0})</h2>
                  ${nodesHtml || '<p>No semantic nodes found.</p>'}
                </div>
                
                <div class="section" style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <h2>Relations (${graphData?.links?.length || 0})</h2>
                  ${linksHtml || '<p>No semantic relations found.</p>'}
                </div>
                
                <div class="section" style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <h2>Graph Structural Metrics</h2>
                  ${metricsHtml || '<p>No graph metrics available.</p>'}
                </div>
                <script>
                  function toggleSection(contentId, elementId) {
                    var content = document.getElementById(contentId);
                    var element = document.getElementById(elementId);
                    if (content.style.display === "block") {
                      content.style.display = "none";
                      element.innerText = "Show list";
                    } else {
                      content.style.display = "block";
                      element.innerText = "Hide list";
                    }
                  }
                </script>
            </body>
            </html>
          `;

          fileDownload(finalHtmlDocument, `${tableName || "report"}.html`);
          return;
        }

        if (params) {
          const { postDownload } = params;
          const processedData = postDownload ? postDownload(data) : data;

          console.log("Processed data for download:", {
            originalType: typeof data,
            processedType: typeof processedData,
            processedPreview:
              typeof processedData === "string"
                ? processedData.substring(0, 100)
                : processedData,
          });

          // Determine the file extension
          const extension =
            format === "RDF"
              ? rdfExtensions[rdfFormat] || "ttl"
              : params.extension || "txt";

          fileDownload(processedData, `${tableName}.${extension}`);
        }
      });
    dispatch(updateUI({ openExportDialog: false }));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <DialogTitle>Export</DialogTitle>
        <IconButton
          aria-label="open-export-tutorial"
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            marginRight: "20px",
          }}
          onClick={() => {
            dispatch(
              updateUI({
                openHelpDialog: true,
                helpStart: "tutorial",
                tutorialStep: 6
              })
            );
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <DialogContentText>Choose what to export:</DialogContentText>
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
            <MenuItem value="schema">Schema</MenuItem>
            <MenuItem value="table">Table</MenuItem>
            <MenuItem value="pipeline">Pipeline</MenuItem>
          </Select>
        </FormControl>
        <DialogContentText>
          Choose an export format from those available:
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: "20px" }}>
          <InputLabel id="export-label" disabled={!type}>
            Export format
          </InputLabel>
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
              const isSchemaReport = name === "HTML Schema Report";
              const isDisabled = (isPipeline && isUnsaved) || (isSchemaReport && currentView !== "graph");

              // For disabled items, wrap with Tooltip
              if (isDisabled) {
                return (
                  <Tooltip
                    key={path}
                    title={isPipeline
                      ? "You must save your changes before generating a pipeline"
                      : "You must switch to the Graph View tab before exporting the HTML Schema Report"}
                    placement="right"
                  >
                    <span>
                      <MenuItem
                        value={name}
                        disabled={isDisabled}
                        sx={{ color: "text.disabled", fontStyle: "italic" }}
                      >
                        {name} {isPipeline ? "(save required)" : "(To enable switch to Graph View tab)"}
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
                  onChange={(e) => setCsvIncludeHeader(e.target.value as "true" | "false")}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
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
                <MenuItem value="XML">XML (.rdf)</MenuItem>
                <MenuItem value="JSON">JSON-LD (.jsonld)</MenuItem>
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
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                value={scoreValue}
                label="Threshold score to filter exported entities"
                onChange={(e) => setScoreValue(Number(e.target.value))}
                variant="outlined"
                required
                helperText="Defines the minimum threshold score for filtering results; only entries with scores equal to or above this value are included."
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "20px" }}>
              <Typography variant="body1">Match value</Typography>
              <RadioGroup
                value={matchValue}
                onChange={(e) => setMatchValue(e.target.value)}
                row
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
        {format === "HTML Schema Report" && (
          <FormControl fullWidth sx={{ marginTop: "20px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body1">Show link labels in snapshot:</Typography>
              <RadioGroup
                row
                value={showLinkLabels ? "true" : "false"}
                onChange={handleLinkLabelsChange}
              >
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="primary" disabled={!type || !format} onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
