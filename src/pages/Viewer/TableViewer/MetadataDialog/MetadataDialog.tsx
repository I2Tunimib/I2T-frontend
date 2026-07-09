/* eslint-disable react/destructuring-assignment */
import {
  Box,
  Button,
  Dialog,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  addCellMetadata,
  deleteCellMetadata,
  propagateCellDeleteMetadata,
  propagateCellMetadata,
  updateCellMetadata,
  updateUI,
} from "@store/slices/table/table.slice";
import {
  selectCellMetadataTableFormat,
  selectColumnCellMetadataTableFormat,
  selectCurrentCell,
  selectIsViewOnly,
  selectReconcileRequestStatus,
  selectSettings,
} from "@store/slices/table/table.selectors";
import {
  selectAppConfig,
  selectReconciliatorsAsArray,
} from "@store/slices/config/config.selectors";
import { Controller, useForm } from "react-hook-form";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { getCellContext } from "@store/slices/table/utils/table.reconciliation-utils";
import CustomTable from "@components/kit/CustomTable/CustomTable";
import deferMounting from "@components/HOC";
//import { reconcile } from "@store/slices/table/table.thunk";
import { Cell } from "@tanstack/react-table";
import {
  BaseMetadata,
  Cell as TableCell,
  TextAnnotation,
} from "@store/slices/table/interfaces/table";
import {
  ConfirmationDialog,
  StatusBadge,
  IconButtonTooltip,
} from "@components/core";
import { KG_INFO, fetchTypeAndDescription } from "@services/utils/kg-info";
import { extractIdFromUri, resolveURI, createOSMURI } from "@services/utils/uri-utils";
//import { initial } from "lodash";
import usePrepareTable from "./usePrepareTable";
import { getCellComponent } from "./componentsConfig";
import AddMetadataForm from "../MetadataColumnDialog/AddMetadataForm";
import NerAnnotationsTab from "./NerAnnotationsTab";
//import HelpDialog from "../../HelpDialog/HelpDialog";

const DeferredTable = deferMounting(CustomTable);

const makeData = (
  rawData: ReturnType<typeof selectCellMetadataTableFormat>,
) => {
  if (rawData) {
    const { cell, service } = rawData;
    const { metadata } = cell;
    const hasDescriptions = metadata.some(
      (m) => m.description && m.description.trim() !== "",
    );
    let metaToView = {};
    if (service) {
      console.log("meta to view from service", service);
      metaToView = {
        selected: { label: "Selected", type: "checkBox" },
        ...service.metaToView,
      };
    } else {
      metaToView = {
        selected: { label: "Selected", type: "checkBox" },
        id: { label: "Id", type: "link" },
        name: { label: "Name", type: "link" },
        type: { label: "Type", type: "subList" },
        ...(hasDescriptions && { description: { label: "Description" } }),
        score: { label: "Score" },
        match: { label: "Match", type: "tag" },
      };
    }
    // add checkbox column
    const metaWithCheck = {
      selected: { label: "Selected", type: "checkBox" },
      ...metaToView,
    };
    console.log("meta to view: ", metaToView);
    const columns = Object.keys(metaToView).map((key) => {
      const { label = key, type } = metaToView[key];
      console.log("key", key, "label", label, "type", type);
      return {
        header: label,
        accessorKey: key,
        cell: (cellValue: Cell<{}>) => getCellComponent(cellValue, type),
      };
    });

    const data = [...metadata]
      .sort((a, b) => {
        if (a.match) {
          return -1;
        }
        if (b.match) {
          return 1;
        }
        return 1;
      })
      .map((metadataItem) => {
        return Object.keys(metaToView).reduce(
          (acc, key) => {
            let value = metadataItem[key as keyof BaseMetadata];

            if (value !== undefined) {
              acc[key] = value;
            } else {
              acc[key] = null;
            }

            return acc;
          },
          {} as Record<string, any>,
        );
      })
      .map((item) => {
        return {
          ...item,
          selected: item.match,
        };
      });
    console.log("final data", data);
    return {
      columns,
      data,
    };
  }
  return {
    columns: [],
    data: [],
  };
};

type MetadataDialogProps = {
  open: boolean;
};

interface FormState {
  id: string;
  name: string;
  score: number;
  match: string;
  uri: string;
}

const MetadataDialog: FC<MetadataDialogProps> = ({ open }) => {
  const [toUpdate, setToUpdate] = useState<boolean>(false);
  const [showConfirmPropagate, setShowConfirmPropagate] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const {
    setState,
    memoizedState: { columns, data },
  } = usePrepareTable({
    selector: selectCellMetadataTableFormat,
    makeData,
    dependencies: [toUpdate],
  });
  const [currentService, setCurrentService] = useState<string>();
  const [isManualMatch, setIsManualMatch] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<FormState | null>(
    null,
  );
  const [newMetaMatching, setNewMetaMatching] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [initialMatching, setInitialMatching] = useState<string[]>([]);
  const [metasToDelete, setMetasToDelete] = useState<any[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showPropagate, setShowPropagate] = useState<boolean>(false);
  const [formSelectedPrefix, setFormSelectedPrefix] = useState<string>("");
  const { handleSubmit, reset, register, control } = useForm<FormState>({
    defaultValues: {
      score: 1.0,
      match: "true",
    },
  });
  const { API } = useAppSelector(selectAppConfig);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const cell = useAppSelector(selectCurrentCell);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();
  const uniqueReconciliators = Array.from(
    new Set(reconciliators.map((r) => r.id)),
  ).map((id) => reconciliators.find((r) => r.id === id));

  const {
    lowerBound: { isScoreLowerBoundEnabled, scoreLowerBound },
  } = settings;

  useEffect(() => {
    if (!cell) return;
    const isCellReconciled = cell?.annotationMeta?.annotated;
    if (isCellReconciled) {
      const reason = cell?.annotationMeta?.match?.reason;
      if (reason === "manual") {
        setIsManualMatch(true);
      } else if (cell?.metadata && cell.metadata.length > 0) {
        const serviceRec = cell?.reconciler;
        setIsManualMatch(false);
        setCurrentService(serviceRec);
      } else {
        setIsManualMatch(false);
        setCurrentService("");
      }
    } else {
      setIsManualMatch(false);
      setCurrentService("");
    }
  }, [cell, reconciliators]);

  useEffect(() => {
    //When a cell has been reconciliated manually, the other ones can be reconciled using the same prefix
    if (cell && cell.id) {
      const cellContext = getCellContext(cell);
      if (cellContext && cellContext !== "") {
        const prefix = cellContext.replace(":", "");
        setCurrentService(prefix);
      }
    }
  }, [cell]);

  useEffect(() => {
    //this useEffect is used to track the initial selected metadata in order to not show the propagation if not needed
    if (cell && cell.metadata && cell.metadata.length > 0) {
      const { metadata } = cell;
      const initialMatch = metadata
        .filter((meta) => meta.match)
        .map((meta) => meta.id);
      setInitialMatching(initialMatch);
    }
  }, [cell]);

  const handleClose = () => {
    setShowAdd(false);
    setShowTooltip(false);
    setShowPropagate(false);
    dispatch(
      updateUI({
        openMetadataDialog: false,
      }),
    );
  };

  const handleCancel = () => {
    // set to inital state if canceled
    handleClose();
  };

  const handleConfirm = () => {
    // update global state if confirmed
    console.log(
      "confirm condition",
      cell && selectedMetadata,
      selectedMetadata,
    );

    // Safety check for empty metadata
    if (!cell || !cell.metadata || cell.metadata.length === 0) {
      console.warn("Cannot confirm: cell metadata is empty");
      handleClose();
      return;
    }

    // Check if the selection has changed from the initial state
    const hasSelectionChanged = () => {
      if (!cell || !selectedMetadata) {
        console.log("case 0");
        return false;
      }

      // If there was initially no match, check if we've selected something
      if (initialMatching.length === 0) {
        console.log("case 1");
        return selectedMetadata.match === "true";
      }

      // If there was a match initially:
      if (initialMatching.length > 0) {
        // Case 1: We're now matching something different than what was initially matched
        if (
          selectedMetadata.match === "true" &&
          !initialMatching.includes(selectedMetadata.id)
        ) {
          console.log("case 2");
          return true;
        }

        // Case 2: We're now NOT matching something that WAS initially matched
        if (
          selectedMetadata.match === "false" &&
          initialMatching.includes(selectedMetadata.id)
        ) {
          console.log("case 3");
          return true;
        }
      }
      console.log("no change in selection");
      return false;
    };

    let previousMatch = null;
    if (cell && selectedMetadata) {
      previousMatch = cell.metadata.find((meta) => meta.match);
      console.log("previous match", previousMatch, selectedMetadata);

      // Only proceed with changes and show propagate if selection changed
      if (hasSelectionChanged()) {
        // Always show the propagate button for any change
        setShowPropagate(true);

        if (!previousMatch || previousMatch.id !== selectedMetadata.id) {
          if (!previousMatch?.match && selectedMetadata.match === "true") {
            dispatch(
              updateCellMetadata({
                metadataId: selectedMetadata.id,
                cellId: cell.id,
              }),
            );
          } else if (selectedMetadata.match === "false") {
            // For when we're deselecting a newly selected item
            dispatch(
              updateCellMetadata({
                metadataId: selectedMetadata.id,
                cellId: cell.id,
                match: false,
              }),
            );
          }
        } else {
          console.log("previous match", previousMatch);
          if (previousMatch.id === selectedMetadata.id) {
            // remove match
            dispatch(
              updateCellMetadata({
                metadataId: selectedMetadata.id,
                cellId: cell.id,
                match: selectedMetadata.match === "true",
              }),
            );
          }
        }
      }

      // Always close the dialog
      handleClose();
    } else {
      handleClose();
    }
  };

  const handleDeleteRow = (original: any) => {
    console.log("original Id", original?.id);
    if (!cell || !cell.metadata || cell.metadata.length === 0) {
      console.warn("Cannot delete: cell metadata is empty");
      return;
    }
    if (!original || !original.id) {
      console.warn("Cannot delete: invalid row data");
      return;
    }

    // Resolve metadata identifier robustly:
    // - If original.id is a string, use it.
    // - If it's an object, prefer `.id`, then `.label`, then `.value`.
    // - Otherwise pass the whole object so reducers that accept object shapes can handle it.
    let metadataIdToDelete: any = original.id;
    if (typeof original.id === "object" && original.id !== null) {
      if (original.id.id) {
        metadataIdToDelete = original.id.id;
      } else if (original.id.label) {
        metadataIdToDelete = original.id.label;
      } else if (original.id.value) {
        metadataIdToDelete = original.id.value;
      } else {
        metadataIdToDelete = original.id;
      }
    }

    dispatch(
      deleteCellMetadata({
        cellId: cell.id,
        metadataId: metadataIdToDelete,
      }),
    );
  };

  const handleSelectedRowDelete = useCallback((row: any) => {
    if (!row || !row.id) {
      console.warn("Cannot delete: invalid row data");
      return;
    }
    handleDeleteRow(row);
    setMetasToDelete((prev) => {
      const newMetas = [...prev];
      const index = newMetas.findIndex((item) => item.id === row.id);
      if (index === -1) {
        console.log("adding to delete", row.id, row.name);
        newMetas.push(row);
      }
      return newMetas;
    });
    setShowPropagate(true);
    console.log("request to delete: ", row);
  }, []);

  const handleSelectedRowChange = useCallback(
    (row: any) => {
      if (row) {
        setState(({ columns: colState, data: dataState }) => {
          // Safety check: ensure data is not empty and row exists
          if (!dataState || dataState.length === 0) {
            console.warn("Cannot update selection: data is empty");
            return { columns: colState, data: dataState };
          }

          const newData = dataState.map((item: any) => {
            if (item.id === row.id) {
              const match = !item.match;
              setSelectedMetadata({ ...row, match: match ? "true" : "false" });
              console.log("changing selected row", {
                ...item,
                match: match ? "true" : "false",
                selected: match,
              });

              // Show propagate button only if the selection is different from initial state
              let selectionChanged = false;

              // Store the current "state" of this row for better comparison
              const currentState = {
                id: item.id,
                matched: match, // The new state after toggling
              };

              // When we're in a different state from the initial matching
              if (initialMatching.length === 0) {
                // Initially nothing was matched
                // Show propagate if we're matching anything
                selectionChanged = match;
              } else if (initialMatching.length > 0) {
                // Initially something was matched
                console.log(
                  "item",
                  item,
                  initialMatching.includes(item.id),
                  !currentState.matched,
                );
                if (
                  initialMatching.includes(item.id) &&
                  !currentState.matched
                ) {
                  console.log("case 1");
                  // This item was initially matched, show propagate if we're unmatching
                  selectionChanged = true;
                } else if (
                  !initialMatching.includes(item.id) &&
                  !currentState.matched
                ) {
                  console.log("case 2");

                  // This item was initially matched, show propagate if we're unmatching
                  selectionChanged = true;
                } else {
                  console.log("case 3");
                  if (
                    initialMatching.includes(item.id) &&
                    currentState.matched
                  ) {
                    console.log("case 3.5");
                    selectionChanged = false;
                  } else {
                    selectionChanged = match;
                  }
                  // This item was not initially matched, show propagate if we're matching it
                }
              }

              console.log(
                "Selection changed:",
                selectionChanged,
                "Current state:",
                currentState,
                "Initial matching:",
                initialMatching,
              );
              setShowPropagate(selectionChanged);

              return {
                ...item,
                match,
                selected: match,
              };
            }
            return {
              ...item,
              selected: false,
              match: false,
            };
          });

          return {
            columns: colState,
            data: newData,
          };
        });
      }
    },
    [initialMatching],
  );

  const onSubmitNewMetadata = async (formState: FormState) => {
    if (!cell || !cell.metadata) {
      console.warn("Cannot add metadata: cell is invalid");
      return;
    }
    const { prefix, uri, name } = formState;
    const cleanPrefix = prefix.replace(/:$/, "");
    // Extract id from URI for type and description fetching
    let idFromUri = extractIdFromUri(uri, cleanPrefix);
    let finalUri = uri;
    let extraOsmData = { osmId: "", osmType: "" };
    const reconciliator = reconciliators.find(
      (recon) => recon.prefix === cleanPrefix,
    );

    if (cleanPrefix === "geoCoord" || cleanPrefix === "georss") {
      try {
        const base = import.meta.env.VITE_BACKEND_API_URL;
        const response = await fetch(`${base}/metadata/osm?id=${encodeURIComponent(idFromUri)}`);
        if (response.ok) {
          const osmData = await response.json();
          if (osmData.lat && osmData.lon) {
            idFromUri = `${osmData.lat},${osmData.lon}`;
          }
          if (osmData.osmType && osmData.osmId) {
            extraOsmData = {
              osmId: String(osmData.osmId),
              osmType: osmData.osmType
            };
            finalUri = createOSMURI(reconciliator.uri, extraOsmData);
          }
        }
      } catch (err) {
        console.warn("OSM Proxy failed", err);
      }
    } else {
      if (reconciliator) {
        finalUri = resolveURI(reconciliator, { id: idFromUri });
      }
      finalUri = uri;
    }

    let description = "";
    let type: any[] = [];

    try {
      const result = await fetchTypeAndDescription(cleanPrefix, idFromUri, name);
      description = result.description || "";
      type = result.type || [];
    } catch (err) {
      console.error("Error fetching metadata info:", err);
    }

    const finalId = `${cleanPrefix}:${idFromUri}`;

    const newMetadata = {
      ...formState,
      id: finalId,
      uri: finalUri,
      description,
      type,
      ...extraOsmData
    };

    dispatch(addCellMetadata({
      cellId: cell.id,
      prefix: getCellContext(cell) || cleanPrefix,
      value: newMetadata,
    }));

    setSelectedMetadata(newMetadata);
    if (formState.match === "true") {
      setShowPropagate(true);
    }

    reset();
    setNewMetaMatching(formState.match === "true");
    setShowAdd(false);
    setToUpdate(!toUpdate);
  };

  const handleTooltipOpen = () => {
    setShowTooltip(!showAdd);
  };

  const handleTooltipClose = () => {
    setShowTooltip(false);
  };

  const handleShowAdd = () => {
    setShowAdd(!showAdd);
    setShowTooltip(false);
  };

  const getBadgeStatus = (cellItem: TableCell) => {
    // Defensive / null-safe checks to avoid runtime errors when opening a table
    // if some cells don't have annotationMeta populated.
    const match = cellItem?.annotationMeta?.match;
    const highestScore = cellItem?.annotationMeta?.highestScore;

    if (match && match.value) {
      switch (match.reason) {
        case "manual":
          return "match-manual";
        case "reconciliator":
          return "match-reconciliator";
        case "refinement":
          return "match-refinement";
        default:
          return "match-reconciliator";
      }
    }

    if (isScoreLowerBoundEnabled) {
      // Ensure highestScore is a number before comparing
      if (
        scoreLowerBound &&
        typeof highestScore === "number" &&
        highestScore < scoreLowerBound
      ) {
        return "miss";
      }
    }
    return "warn";
  };

  const fetchMetadata = (service: string) => {
    const reconciliator = reconciliators.find(
      (recon) => recon.prefix === service,
    );
    if (reconciliator && cell) {
      // dispatch(reconcile({
      //   baseUrl: reconciliator.relativeUrl,
      //   items: [{
      //     id: cell.id,
      //     label: cell.label
      //   }],
      //   reconciliator,
      //   contextColumns: []
      // }));
    }
  };
  const handlePropagate = () => {
    try {
      if (cell && selectedMetadata) {
        dispatch(
          propagateCellMetadata({
            value: selectedMetadata,
            metadataId: selectedMetadata.id,
            cellId: cell.id,
          }),
        );
      }
      if (metasToDelete.length > 0 && cell) {
        dispatch(
          propagateCellDeleteMetadata({
            metadataIds: metasToDelete.map((meta) => meta.id),
            cellId: cell.id,
          }),
        );
      }
      handleClose();
    } catch (error) {}
  };

  // Add a handler for row checking
  const handleRowCheck = useCallback((rowId: string) => {
    // This function is required by CustomTable but in our case we're using radio buttons
    // We can implement it as a no-op, but it could be extended if needed
    console.log("Row checked:", rowId);
  }, []);

  const servicesById = reconciliators.reduce<Record<string, any>>(
    (acc, service) => {
      acc[service.id] = service;
      return acc;
    },
    {},
  );

  const servicesByPrefix = reconciliators.reduce<Record<string, any>>(
    (acc, service) => {
      acc[service.prefix] = service;
      return acc;
    },
    {},
  );

  const getPrefixFromCellMetadata = () => {
    if (!cell || !cell.metadata || cell.metadata.length === 0) return null;
    const matchedMeta = cell.metadata.find((m) => m.match) || cell.metadata[0];
    if (!matchedMeta || !matchedMeta.id) return null;
    const parts = matchedMeta.id.split(":");
    return parts.length > 1 ? parts[0] : null;
  };

  const getActiveSearchService = () => {
    // Cell reconciliated with inTableLinker -> prefix selected when reconciliating
    if (cell?.reconciler === "inTableLinker") {
      const prefix = getPrefixFromCellMetadata();
      if (prefix && servicesByPrefix[prefix]?.searchPattern) {
        return servicesByPrefix[prefix];
      }
    }

    // Cell reconciliated -> service's prefix
    if (cell?.reconciler && servicesById[cell?.reconciler]?.searchPattern) {
      const activePrefixId = reconciliators.find((rec) => rec.prefix === formSelectedPrefix)?.id;
      if (activePrefixId !== cell?.reconciler) {
        return servicesById[activePrefixId];
      }
      return servicesById[cell?.reconciler];
    }
    // Cell not reconciliated -> prefix selected in the form
    if (
      formSelectedPrefix &&
      servicesByPrefix[formSelectedPrefix]?.searchPattern
    ) {
      return servicesByPrefix[formSelectedPrefix];
    }
    return null;
  };

  const activeSearchService = getActiveSearchService();
  console.log("ATT activeSearchService", activeSearchService);

  const hasNerAnnotations =
    !!cell?.annotations &&
    Object.values(cell.annotations).some(
      (anns: TextAnnotation[]) => anns.length > 0,
    );

  const handleSearchInService = () => {
    if (!cell?.label || !activeSearchService) return;

    const url = activeSearchService.searchPattern.replace(
      "{label}",
      encodeURIComponent(cell.label),
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return cell ? (
    <Dialog maxWidth="lg" open={open} onClose={handleCancel}>
      <Stack height="100%" minHeight="600px">
        <Stack direction="row" gap="8px" alignItems="center" padding="16px">
          <Stack direction="row" alignItems="center" gap={1}>
            {cell.annotationMeta && cell.annotationMeta.annotated && (
              <StatusBadge status={getBadgeStatus(cell)} />
            )}
            <Typography variant="h5">{cell?.label || "N/A"}</Typography>
            <Typography color="textSecondary">(Cell label)</Typography>
          </Stack>
          <Stack direction="row" marginLeft="auto" gap="10px">
            <Button onClick={handleClose}>
              {API.ENDPOINTS.SAVE && !isViewOnly ? "Cancel" : "Close"}
            </Button>
            {API.ENDPOINTS.SAVE && !isViewOnly && (
              <Button onClick={handleConfirm} variant="outlined">
                Confirm and Close
              </Button>
            )}
            {showPropagate && (
              <>
                <Button
                  onClick={() => setShowConfirmPropagate(true)}
                  variant="outlined"
                >
                  Confirm and Propagate
                </Button>
                <ConfirmationDialog
                  open={showConfirmPropagate}
                  onClose={() => setShowConfirmPropagate(false)}
                  title="Are you sure to propagate?"
                  content="You are about to propagate the selected metadata to all cells in this column. Cells with the same value will have their matching status updated."
                  actions={[
                    {
                      label: "Cancel",
                      callback: () => setShowConfirmPropagate(false),
                    },
                    {
                      label: "Confirm",
                      callback: handlePropagate,
                    },
                  ]}
                />
              </>
            )}
            <IconButtonTooltip
              aria-label="open-metadata-tutorial"
              tooltipText="Help"
              onClick={() =>
                dispatch(
                  updateUI({
                    openHelpDialog: true,
                    helpStart: "tutorial",
                    tutorialStep: cell?.annotationMeta?.annotated ? 19 : 16,
                  }),
                )
              }
              Icon={HelpOutlineRoundedIcon}
            />
          </Stack>
        </Stack>
        <Divider orientation="horizontal" flexItem />
        {hasNerAnnotations && (
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Entity Matching" />
              <Tab label="Text Annotations" />
            </Tabs>
          )}
        {activeTab === 1 && hasNerAnnotations ? (
          <NerAnnotationsTab
            label={cell.label}
            annotations={cell.annotations!}
          />
        ) : (
          <>
        <Box padding="16px">
          {cell.reconciler || isManualMatch ? (
            <Typography color="text.secondary">
              Reconciliation service:{" "}
              <Typography
                component="span"
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                {isManualMatch
                  ? "manual"
                  : cell.reconciler
                    ? `${
                        reconciliators.find((rec) => rec.id === cell.reconciler)
                          .name
                      }`
                    : ""}
              </Typography>
            </Typography>
          ) : (
            <Typography color="text.secondary">
              This cell has not been reconciled yet
            </Typography>
          )}
        </Box>
        {API.ENDPOINTS.SAVE && !isViewOnly && (
          <Stack
            position="relative"
            direction="column"
            alignItems="flex-start"
            padding="0px 16px"
            gap={1}
          >
            <Stack direction="row" gap={1} alignItems="center">
              <Tooltip
                open={showTooltip}
                title="Add metadata"
                placement="right"
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onMouseLeave={handleTooltipClose}
                  onMouseEnter={handleTooltipOpen}
                  onClick={handleShowAdd}
                  sx={{
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Add metadata
                  <AddRoundedIcon
                    sx={{
                      transition: "transform 150ms ease-out",
                      transform: showAdd ? "rotate(45deg)" : "rotate(0)",
                    }}
                  />
                </Button>
              </Tooltip>
              {showAdd && activeSearchService && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleSearchInService}
                  sx={{ textTransform: "none" }}
                >
                  Search "{cell?.label}" in{" "}
                  {KG_INFO[activeSearchService.prefix].groupName}
                </Button>
              )}
            </Stack>
            {showAdd && (
              <Box sx={{ width: "100%", paddingTop: "8px" }}>
                <AddMetadataForm
                  onPrefixChange={setFormSelectedPrefix}
                  currentService={
                    cell?.reconciler === "inTableLinker"
                      ? getPrefixFromCellMetadata()
                      : servicesById[cell?.reconciler]?.prefix
                  }
                  onSubmit={onSubmitNewMetadata}
                  context="metadataDialog"
                />
              </Box>
            )}
          </Stack>
        )}
        <DeferredTable
          flexGrow={1}
          columns={columns}
          data={data}
          loading={loading}
          onDeleteRow={handleDeleteRow}
          onSelectedRowChange={handleSelectedRowChange}
          onSelectedRowDeleteRequest={handleSelectedRowDelete}
          showRadio={!!API.ENDPOINTS.SAVE && !isViewOnly}
          onRowCheck={handleRowCheck}
        />
          </>
        )}
      </Stack>
    </Dialog>
  ) : null;
};

export default MetadataDialog;
