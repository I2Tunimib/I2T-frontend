import {
  Drawer,
  IconButton,
  Typography,
  Divider,
  Box,
  Stack,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import { useAppSelector, useAppDispatch } from "@hooks/store";
import { selectComplianceDialogStatus } from "@store/slices/table/table.selectors";
import { updateUI, updateCurrentTable } from "@store/slices/table/table.slice";
import { saveTable } from "@store/slices/table/table.thunk";
import { useState, useRef, useEffect, useCallback, MouseEvent as ReactMouseEvent } from "react";
import EvaluatorContent from "./EvaluatorContent";
import ValidatorContent from "./ValidatorContent";
import GDPRContent from "./GDPRContent";
import styles from "./CompliancePolicyPanel.module.scss";

interface CompliancePolicyPanelProps {
  tableId?: string;
  datasetId?: string;
  readonly?: boolean;
}

const DRAWER_DEFAULT_WIDTH_VW = 50;
const DRAWER_MIN_WIDTH = 280;
const DRAWER_MAX_WIDTH_VW = 90;

const CompliancePolicyPanel = ({
  tableId,
  datasetId,
  readonly = false,
}: CompliancePolicyPanelProps) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectComplianceDialogStatus);
  const columns = useAppSelector((state) => state.table.entities.columns);
  const tableInstance = useAppSelector((state) => state.table.entities.tableInstance);
  const initialComplianceType = useAppSelector((state: any) => state.table.ui.initialComplianceType);
  const [complianceType, setComplianceType] = useState<string>("");

  const policyEditorBaseUrl = useAppSelector((state: any) => state.config?.policyEditorUrl);
  const policyEditorUrl =
    policyEditorBaseUrl
      ? `${policyEditorBaseUrl}${policyEditorBaseUrl.includes('?') ? '&' : '?'}&showHeader=true&showLeftPanel=false&showCenterPanel=true&templateMode=true&showRightPanel=false&showRuleTabsHeader=true&showSHACL=false`
      : '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const targetOptions = [
    tableInstance.name,
    ...(columns?.allIds?.map((colId) => {
      const colLabel = columns.byId[colId]?.label || colId;
      return `${tableInstance.name}/${colLabel}`;
    }) || [])
  ];

  const [policyOperationType, setPolicyOperationType] = useState<string>("");
  const [tab, setTab] = useState<number>(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      // Policy Editor ready: sending existing policies
      if (event.data.type === "MSG_READY") {
        const iframeWindow = (document.querySelector('iframe[title="Policy Editor"]') as HTMLIFrameElement)?.contentWindow;
        if (iframeWindow) {
          iframeWindow.postMessage(
            {
              type: "MSG_INITIATE",
              policy: tableInstance?.odrlPolicies || {},
              targetOptions: targetOptions,
            },
            "*"
          );
        }
      }

      // Publishing policies and saving it into the table's description
      if (event.data.type === "MSG_FINALIZE") {
        const policyJson = event.data.policy;
        dispatch(
          updateCurrentTable({
            odrlPolicies: policyJson,
          })
        );
        dispatch(
          saveTable({
            ...tableInstance,
            odrlPolicies: policyJson,
          })
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch, tableInstance]);

  const handleClose = () => {
    dispatch(updateUI({ openComplianceStatusDialog: false }));
  };

  useEffect(() => {
    if (open) {
      setComplianceType(initialComplianceType || "");
    } else {
      setComplianceType("");
      dispatch(updateUI({ initialComplianceType: "" }));
    }
  }, [open, initialComplianceType, dispatch]);

  const handleTypeChange = (e: SelectChangeEvent<string>) => {
    setComplianceType(e.target.value);
  };

  const handleOperationTypeChange = (e: SelectChangeEvent<string>) => {
    setPolicyOperationType(e.target.value);
  };

  const [drawerWidth, setDrawerWidth] = useState(
    Math.round((DRAWER_DEFAULT_WIDTH_VW / 100) * window.innerWidth)
  );
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = drawerWidth;
      e.preventDefault();
    },
    [drawerWidth]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(
        Math.max(startWidth.current + delta, DRAWER_MIN_WIDTH),
        Math.round((DRAWER_MAX_WIDTH_VW / 100) * window.innerWidth)
      );
      setDrawerWidth(newWidth);
    };
    const onMouseUp = () => {
      isResizing.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      PaperProps={{
        sx: {
          width: drawerWidth,
          position: "relative",
          height: "100%",
          border: "none",
          borderLeft: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: isResizing.current ? "none" : "width 0.25s ease",
        "& .MuiDrawer-paper": {
          transition: isResizing.current ? "none" : "width 0.25s ease",
        },
      }}
    >
      <Box
        onMouseDown={handleResizeMouseDown}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: "col-resize",
          zIndex: 10,
          transition: "background 0.15s",
          "&:hover": { background: "rgba(25, 118, 210, 0.18)" },
          "&:active": { background: "rgba(25, 118, 210, 0.32)" },
        }}
      />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={0.75}
        className={styles.Header}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <VerifiedUserRoundedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            {readonly ? "Compliance Report" : "Compliance Assessment"}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <IconButton
            aria-label="open-compliance-tutorial"
            size="small"
            onClick={() => {
              dispatch(
                updateUI({
                  openHelpDialog: true,
                  helpStart: "tutorial",
                  tutorialStep: 23,
                })
              );
            }}
          >
            <HelpOutlineRounded fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleClose} aria-label="Close panel">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        className={styles.Tabs}
      >
        <Tab
          icon={<VerifiedUserRoundedIcon fontSize="small" />}
          iconPosition="start"
          label="Compliance"
          sx={{ minHeight: 40, textTransform: "none", fontSize: "0.8rem" }}
        />
        <Tab
          icon={<EditNoteRoundedIcon fontSize="small" />}
          iconPosition="start"
          label="Policy Editor"
          sx={{ minHeight: 40, textTransform: "none", fontSize: "0.8rem" }}
        />
        <Tab
          icon={<PolicyRoundedIcon fontSize="small" />}
          iconPosition="start"
          label="Policy Engine"
          sx={{ minHeight: 40, textTransform: "none", fontSize: "0.8rem" }}
        />
      </Tabs>

      <Divider />

      {/* Compliance */}
      <Box
        className={styles.Body}
        flex={1}
        overflow="auto"
        p={2}
        display={tab === 0 ? "block" : "none"}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            Select the type of compliance check you want to perform:
          </Typography>
          <IconButton
            aria-label="open-compliance-discover"
            size="small"
            onClick={() => {
              dispatch(
                updateUI({
                  openHelpDialog: true,
                  helpStart: "discover",
                  discoverStep: 30,
                })
              );
            }}
          >
            <HelpOutlineRounded fontSize="small" />
          </IconButton>
        </Stack>

        <FormControl fullWidth sx={{ marginTop: "10px", marginBottom: "20px" }}>
          <InputLabel
            id="compliance-type-label"
          >
            Compliance type
          </InputLabel>
          <Select
            labelId="compliance-type-label"
            value={complianceType}
            label="Compliance type"
            onChange={handleTypeChange}
            variant="outlined"
            size="medium"
          >
            <MenuItem value="GDPR">
              GDPR (General Data Protection Regulation)
            </MenuItem>
          </Select>
        </FormControl>

        {complianceType === "GDPR" && (
          <Box sx={{ pt: 2, borderTop: "1px solid #eee" }}>
            <GDPRContent tableId={tableId} datasetId={datasetId} readonly={readonly} />
          </Box>
        )}
      </Box>

      {/* Policy Editor */}
      <Box
        className={styles.Body}
        flex={1}
        overflow="hidden"
        p={0}
        display={tab === 1 ? "flex" : "none"}
        flexDirection="column"
        width="100%"
        height="100%"
      >
        {policyEditorBaseUrl ? (
          <iframe
            ref={iframeRef}
            src={policyEditorUrl}
            title="Policy Editor"
            style={{
              width: "100%",
              height: "100%",
              minWidth: 0,
              border: "none",
              flex: 1,
              boxSizing: "border-box",
            }}
          />
        ) : (
          <Stack alignItems="center" textAlign="center">
            <ErrorOutlineRoundedIcon color="warning" sx={{ fontSize: 48 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Not available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The Policy Editor URL has not been configured.
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Policy Engine */}
      <Box
        className={styles.Body}
        flex={1}
        overflow="auto"
        p={2}
        display={tab === 2 ? "block" : "none"}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            Select the Policy Engine operation you want to perform:
          </Typography>
          <IconButton
            aria-label="open-compliance-discover"
            size="small"
            onClick={() => {
              dispatch(
                updateUI({
                  openHelpDialog: true,
                  helpStart: "discover",
                  discoverStep: 30,
                })
              );
            }}
          >
            <HelpOutlineRounded fontSize="small" />
          </IconButton>
        </Stack>

        <FormControl fullWidth sx={{ marginTop: "10px", marginBottom: "20px" }}>
          <InputLabel
            id="operation-type-label"
          >
            Operation type
          </InputLabel>
          <Select
            labelId="operation-type-label"
            value={policyOperationType}
            label="Operation type"
            onChange={handleOperationTypeChange}
            variant="outlined"
            size="medium"
          >
            <MenuItem value="EvaluatorMonitoring">Policy Evaluator on SotW</MenuItem>
            <MenuItem value="SHACLInspector">SHACL Inspector</MenuItem>
          </Select>
        </FormControl>

        {policyOperationType === "EvaluatorMonitoring" && (
          <Box sx={{ pt: 2, borderTop: "1px solid #eee" }}>
            <EvaluatorContent tableId={tableId} datasetId={datasetId} />
          </Box>
        )}

        {policyOperationType === "SHACLInspector" && (
          <Box sx={{ pt: 2, borderTop: "1px solid #eee" }}>
            <ValidatorContent tableId={tableId} datasetId={datasetId} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CompliancePolicyPanel;
