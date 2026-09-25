import {
  Button,
  Box,
  Dialog,
  DialogProps,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { FC, ReactNode, SyntheticEvent, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { selectAppConfig, selectReconciliatorsAsArray } from "@store/slices/config/config.selectors";
import {
  selectCurrentCol,
  selectColumnKind,
  selectColumnDatatype,
  selectColumnRole,
  selectIsViewOnly,
  selectMetadataColumnDialogColId,
  selectColumnCellMetadataTableFormat,
} from "@store/slices/table/table.selectors";
import {
  updateColumnKind,
  updateColumnDatatype,
  updateColumnRole,
  updateUI,
} from "@store/slices/table/table.slice";
import { ConfirmationDialog, IconButtonTooltip } from "@components/core";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PrivacyTipRoundedIcon from "@mui/icons-material/PrivacyTipRounded";
import TypeTab from "./TypeTab";
import PropertyTab from "./PropertyTab";
import styles from './MetadataColumnDialog.module.scss';

type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
};
type ReduxEditObject = {
  type: string;
  payload: Object;
};
const TabPanel: FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return value === index ? (
    <Stack
      flexGrow={1}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Stack flexGrow={1}>{children}</Stack>
    </Stack>
  ) : null;
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const Content = () => {
  const [value, setValue] = useState(0);
  const [editsState, setEditsState] = useState<ReduxEditObject[]>([]);
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const kind = useAppSelector(selectColumnKind);
  const datatype = useAppSelector(selectColumnDatatype);
  const currentColId = useAppSelector(selectMetadataColumnDialogColId);
  const [currentKind, setCurrentKind] = useState(kind);
  const [currentDatatype, setCurrentDatatype] = useState(datatype || "none");
  const role = useAppSelector(selectColumnRole);
  const [currentRole, setCurrentRole] = useState(role);
  const metadata = useAppSelector(selectColumnCellMetadataTableFormat);
  const column = useAppSelector(selectCurrentCol);
  const currentService = metadata?.column?.reconciler || null;
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const dispatch = useAppDispatch();
  const [showConfirmMessage, setShowConfirmMessage] = useState<boolean>(false);
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const initialTab = useAppSelector((state: any) => state.table.ui.metadataColumnDialogInitialTab);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const tableInstance = useAppSelector((state: any) => state.table.entities.tableInstance);
  const complianceStatus = tableInstance?.complianceStatus;
  /**
   * Function used to remove the last edit of a specific type from the editsState array,
   * used in cases like updating the column type, where only the last
   * edit is kept to the same information
   * @param type : the string used to identify the type of the edit
   * @returns the new array of edits without the last edit of the specified type
   */
  const removeLastEditOfType = (type: string) => {
    // Find the index of the last occurrence of the element with the specified type
    const lastIndex = editsState.map((edit) => edit.type).lastIndexOf(type);

    // If the type is not found, return the original array
    if (lastIndex === -1) {
      return editsState;
    }

    // Create a new array that excludes the element at the found index
    return editsState.filter((_, index) => index !== lastIndex);
  };

  /**
   * Adds an edit to the editsState array and optionally increments the undo steps.
   * If removeLast is true, it removes the last edit of the
   * specified type before adding the new edit.
   * @param {ReduxEditObject} editFunction - The edit object to be added.
   * @param {boolean} [undoable=false] - If true, increments the undo steps.
   * @param {boolean} [removeLast=false] - If true, removes the last edit of the specified type before adding the new edit.
   */
  const handleAddEdit = (
    editFunction: ReduxEditObject,
    undoable: boolean = false,
    removeLast: boolean = false
  ) => {
    //increment the number of undo steps if undoable
    //remove last edit of the same type if needed and set the new state else add the new edit
    if (removeLast) {
      const filteredEdits = removeLastEditOfType(editFunction.type);
      setEditsState([...filteredEdits, editFunction]);
    } else setEditsState([...editsState, editFunction]);
  };

  /**
   * Applies all the edits stored in the editsState array by dispatching them.
   * Clears the editsState array and closes the metadata column dialog.
   * Logs any errors encountered during the process.
   */
  const handleApplyEdits = () => {
    try {
      editsState.forEach((edit) => {
        console.log("Dispatching edit:", edit);
        dispatch(edit);
      });
      setEditsState([]);

      dispatch(updateUI({ openMetadataColumnDialog: false }));
    } catch (error) {
      console.error("Error during edits apply", error);
    }
  };

  /**
   * Resets the edits state and undo steps, and closes the metadata column dialog.
   * Logs any errors encountered during the process.
   */
  const handleCancel = () => {
    try {
      setEditsState([]);

      dispatch(updateUI({ openMetadataColumnDialog: false }));
    } catch (error) {
      console.error("Error during edits apply", error);
    }
  };
  const handleKindChange = (event: SelectChangeEvent<string>) => {
    const newKind = event.target.value;
    if (newKind === currentKind) return;
    setCurrentKind(newKind);
    const edit = updateColumnKind({
      colId: currentColId,
      kind: newKind,
    });
    handleAddEdit(edit, true, true);
  };
  const handleDatatypeChange = (event: SelectChangeEvent<string>) => {
    setCurrentDatatype(event.target.value);
    const edit = updateColumnDatatype({
      colId: currentColId,
      datatype: event.target.value,
    });
    handleAddEdit(edit, true, true);
  };
  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setCurrentRole(event.target.value);
    const edit = updateColumnRole({
      colId: currentColId,
      role: event.target.value,
    });
    handleAddEdit(edit, true, true);
  };

  const handleConfirmClick = () => {
    if (editsState.length > 0) {
      setShowConfirmMessage(true);
    } else {
      // If no edits were made, just close the main dialog directly
      dispatch(updateUI({ openMetadataColumnDialog: false }));
    }
  };

  const entityDatatypes = ["PERSON", "PLACE", "ORGANIZATION", "EVENT", "OTHER"];
  const literalDatatypes = ["DATE", "NUMBER", "STRING"];
  const OTHER_TOOLTIP = "Includes: Work of Art, Product, Law, Language, Facilities (FAC), and Nationalities/Groups (NORP).";

  useEffect(() => {
    if (currentDatatype === "none") return;
    const isDatatypeInvalid =
      (currentKind === "entity" && !entityDatatypes.includes(currentDatatype)) ||
      (currentKind === "literal" && !literalDatatypes.includes(currentDatatype));
    if (isDatatypeInvalid || currentKind === "none") {
      setCurrentDatatype("none");
      const editDatatype = updateColumnDatatype({
        colId: currentColId,
        datatype: "none",
      });
      handleAddEdit(editDatatype, true, true);
    }
  }, [currentKind, currentDatatype, currentColId]);

  useEffect(() => {
    if (column) {
      setCurrentKind((prev) => ((prev === "none" || !prev) ? (column.kind || "none") : prev));
      setCurrentDatatype((prev) => ((prev === "none" || !prev) ? (column.datatype || "none") : prev));
      setCurrentRole((prev) => ((prev === "none" || !prev) ? (column.role || "none") : prev));

      if (isInitialMount) {
        if (initialTab === 1) {
          setValue(1);
        } else {
          setValue(0);
        }
        setIsInitialMount(false);
      }
    }
  }, [column, initialTab, isInitialMount]);

  useEffect(() => {
    if (!column) {
      setIsInitialMount(true);
    }
  }, [column]);

  const currentColumnCompliance = (() => {
    const reports = tableInstance?.complianceReports || [];
    const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;
    const result = latestReport?.result;

    if (!result || complianceStatus !== "DONE" || !currentColId) {
      return null;
    }

    const columnResult = result.slice(1).find((item) => item.hasOwnProperty(currentColId));

    return columnResult ? columnResult[currentColId] : null;
  })();

  const getComplianceBoxConfig = (classification: string) => {
    const map: Record<string, { className: string, Icon: any }> = {
      personalData: { className: styles.personalData, Icon: PrivacyTipRoundedIcon },
      quasiIdentifiers: { className: styles.quasiIdentifiers, Icon: SecurityRoundedIcon },
      nonPersonalData: { className: styles.nonPersonalData, Icon: GavelRoundedIcon },
      anonymousData: { className: styles.anonymousData, Icon: GavelRoundedIcon },
    };
    return map[classification] || null;
  };

  return (
    <Stack>
      <Stack direction="row" alignItems="center" marginTop="16px" gap="8px">
        <Stack flexWrap="wrap">
          <InputLabel style={{ marginLeft: 16 }} id="column-label">
            <Typography variant="h5">
              {currentColId}
            </Typography>
          </InputLabel>
        </Stack>
        <InputLabel style={{ marginLeft: 16 }} id="kind-select-label">
          Kind:
        </InputLabel>
        <Select
          labelId="kind-select-label"
          value={currentKind ?? "none"}
          onChange={handleKindChange}
          variant="outlined"
          size="small"
        >
          <MenuItem value="entity">Named Entity</MenuItem>
          <MenuItem value="literal">Literal</MenuItem>
          <MenuItem value="none">Undefined</MenuItem>
        </Select>
        <InputLabel style={{ marginLeft: 8 }} id="datatype-select-label">
          {(currentKind === "literal" || currentKind === "none") ? "Datatype:" : "Semantic Class:"}
        </InputLabel>
        <Tooltip
          title={currentKind === "none" ? "Please first define column kind" : ""}
          arrow
        >
          <span>
            <Select
              labelId="datatype-select-label"
              value={currentDatatype}
              onChange={handleDatatypeChange}
              variant="outlined"
              size="small"
              disabled={currentKind === "none"}
              displayEmpty
              renderValue={(selected) => {
                if (selected === "none" || !selected) return "Undefined";
                const labelText = (selected as string).toUpperCase();
                if (selected === "OTHER") {
                  return (
                    <Tooltip title={OTHER_TOOLTIP} placement="bottom" arrow>
                      <span style={{ display: 'block', width: '100%', minWidth: '60px' }}>
                        {labelText}
                      </span>
                    </Tooltip>
                  );
                }
                return labelText;
              }}
            >
              {(currentKind === "entity" ? entityDatatypes : literalDatatypes).map((datatypeOption) => (
                <MenuItem key={datatypeOption} value={datatypeOption}>
                  {datatypeOption === "OTHER" ? (
                    <Tooltip title={OTHER_TOOLTIP} placement="right" arrow>
                      <span style={{ width: '100%', display: 'block' }}>{datatypeOption}</span>
                    </Tooltip>
                  ) : (
                    datatypeOption
                  )}
                </MenuItem>
              ))}
            </Select>
          </span>
        </Tooltip>
        <InputLabel style={{ marginLeft: 8 }} id="role-select-label">
          Role:
        </InputLabel>

        <Select
          labelId="role-select-label"
          value={currentRole ?? "none"}
          onChange={handleRoleChange}
          variant="outlined"
          size="small"
        >
          <MenuItem value="subject">Subject</MenuItem>
          <MenuItem value="none">Undefined</MenuItem>
        </Select>

        <Stack direction="row" marginLeft="auto" marginRight="15px" gap="10px">
          <Button onClick={handleCancel} variant="outlined">
            {API.ENDPOINTS.SAVE && !isViewOnly ? "Cancel" : "Close"}
          </Button>
          {API.ENDPOINTS.SAVE && !isViewOnly && (
            <>
              <Button onClick={handleConfirmClick} variant="outlined">
                Confirm and Close
              </Button>
              <ConfirmationDialog
                open={showConfirmMessage}
                onClose={() => setShowConfirmMessage(false)}
                title="Apply Column Changes"
                content="Are you sure you want to apply these changes to the column metadata? Make sure you have added
                  all the types and properties you need before proceeding."
                actions={[
                  {
                    label: "Cancel",
                    callback: () => setShowConfirmMessage(false),
                  },
                  {
                    label: "Confirm",
                    callback: handleApplyEdits,
                  },
                ]}
              />
            </>
          )}
          <IconButtonTooltip
            aria-label="open-metadata-column-tutorial"
            tooltipText="Help"
            onClick={() =>
              dispatch(
                updateUI({
                  openHelpDialog: true,
                  helpStart: "tutorial",
                  tutorialStep: 11,
                }),
              )
            }
            Icon={HelpOutlineRoundedIcon}
          />
        </Stack>
      </Stack>
      <Tabs
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#FFF",
        }}
        value={value}
        onChange={handleChange}
      >
        <Tab label="Column types" {...a11yProps(0)} />
        <Tab label="Column properties" {...a11yProps(1)} />
      </Tabs>
      <Stack minHeight="600px">
        <Stack position="sticky" top={0} zIndex={10} bgcolor="#FFF">
          <Stack paddingLeft="16px" paddingTop="16px" paddingBottom="8px">
            {metadata?.column?.status !== "empty" ? (
              <Typography color="text.secondary">
                Reconciliation service:{" "}
                <Typography component="span" color="primary" sx={{ fontWeight: 500 }}>
                  {currentService === "manual"
                    ? "manual"
                    : reconciliators.find((r) => r.id === currentService)?.name ||
                    currentService}
                </Typography>
              </Typography>
            ) : (
              <Typography color="text.secondary">
                This column has not been reconciled yet.
              </Typography>
            )}
            {complianceStatus === "DONE" && currentColumnCompliance && (() => {
              const config = getComplianceBoxConfig(currentColumnCompliance.classification);
              if (!config) return null;
              const { className, Icon } = config;
              const isCompliant = currentColumnCompliance.action === "noChange";

              return (
                <Box className={`${styles.complianceBox} ${className}`}>
                  <Icon sx={{ marginTop: "2px" }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      GDPR Compliance Check
                    </Typography>
                    <Typography variant="body2">
                      The column contains <i>{currentColumnCompliance.classification}</i> and is <i>{isCompliant ? "GDPR compliant" : "GDPR NON-compliant"}</i> with a confidence score of {Math.round((currentColumnCompliance.score ?? 0) * 100)}%.
                      Check directly in the{" "}
                      <Box
                        component="span"
                        onClick={() => {
                          dispatch(updateUI({ openMetadataColumnDialog: false }));
                          dispatch(updateUI({ initialComplianceType: "GDPR" }));
                          dispatch(updateUI({ openComplianceStatusDialog: true }));
                        }}
                        sx={{
                          fontStyle: "italic",
                          textDecoration: "underline",
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      >
                        GDPR Compliance Report
                      </Box>
                      .
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
          </Stack>
        </Stack>
        <TabPanel value={value} index={0}>
          <TypeTab
            addEdit={handleAddEdit}
            currentKind={currentKind}
            currentDatatype={currentDatatype}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PropertyTab
            addEdit={handleAddEdit}
            setCurrentRole={setCurrentRole}
            currentKind={currentKind}
            currentDatatype={currentDatatype}
          />
        </TabPanel>
      </Stack>
    </Stack>
  );
};

const MetadataColumnDialog: FC<DialogProps> = ({
  maxWidth = "lg",
  ...props
}) => {
  return (
    <Dialog maxWidth={maxWidth} {...props}>
      <Content />
    </Dialog>
  );
};

export default MetadataColumnDialog;
