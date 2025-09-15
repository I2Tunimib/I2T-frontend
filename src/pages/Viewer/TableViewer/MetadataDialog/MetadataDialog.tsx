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
  selectCurrentCell,
  selectIsViewOnly,
  selectReconcileRequestStatus,
  selectSettings,
  selectHelpDialogStatus,
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
import { reconcile } from "@store/slices/table/table.thunk";
import { Cell } from "@tanstack/react-table";
import {
  BaseMetadata,
  Cell as TableCell,
} from "@store/slices/table/interfaces/table";
import {
  ConfirmationDialog,
  StatusBadge,
  IconButtonTooltip,
} from "@components/core";
import usePrepareTable from "./usePrepareTable";
import { getCellComponent } from "./componentsConfig";
import HelpDialog from "../../HelpDialog/HelpDialog";
import { initial } from "lodash";

const DeferredTable = deferMounting(CustomTable);

const makeData = (
  rawData: ReturnType<typeof selectCellMetadataTableFormat>
) => {
  if (rawData) {
    const { cell, service } = rawData;
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
        score: { label: "Score" },
        match: { label: "Match", type: "tag" },
      };
    }
    const { metadata } = cell;
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
        return Object.keys(metaToView).reduce((acc, key) => {
          let value = metadataItem[key as keyof BaseMetadata];

          if (value !== undefined) {
            acc[key] = value;
          } else {
            acc[key] = null;
          }

          return acc;
        }, {} as Record<string, any>);
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
  const {
    setState,
    memoizedState: { columns, data },
  } = usePrepareTable({
    selector: selectCellMetadataTableFormat,
    makeData,
    dependencies: [toUpdate],
  });
  const [currentService, setCurrentService] = useState<string>();
  const [selectedMetadata, setSelectedMetadata] = useState<FormState | null>(
    null
  );
  const [newMetaMatching, setNewMetaMatching] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [initialMatching, setInitialMatching] = useState<string[]>([]);
  const [metasToDelete, setMetasToDelete] = useState<any[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showPropagate, setShowPropagate] = useState<boolean>(false);
  const { handleSubmit, reset, register, control } = useForm<FormState>({
    defaultValues: {
      score: 1,
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
  const uniqueReconciliators = Array.from(new Set(reconciliators.map(r => r.prefix)))
      .map(prefix => reconciliators.find(r => r.prefix === prefix));

  const {
    lowerBound: { isScoreLowerBoundEnabled, scoreLowerBound },
  } = settings;

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0].prefix);
    }
  }, [reconciliators]);

  useEffect(() => {
    //this useEffect is used to track the initial selected metadata in order to not show the propagation if not needed
    if (cell) {
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
      })
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
      selectedMetadata
    );

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
              })
            );
          } else if (selectedMetadata.match === "false") {
            // For when we're deselecting a newly selected item
            dispatch(
              updateCellMetadata({
                metadataId: selectedMetadata.id,
                cellId: cell.id,
                match: false,
              })
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
              })
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

  const handleSelectedRowDelete = useCallback((row: any) => {
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
          // Check if the row is already matched (selected)
          const isCurrentlyMatched = row.match;

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
                  !currentState.matched
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
                initialMatching
              );
              setShowPropagate(selectionChanged);

              return {
                ...item,
                match: match,
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
    [initialMatching]
  );

  const handleDeleteRow = (original: any) => {
    console.log("original Id", original.id);
    if (cell) {
      console.log();
      dispatch(
        deleteCellMetadata({
          cellId: cell.id,
          metadataId: original.id.label || original.id,
        })
      );
    }
  };

  const onSubmitNewMetadata = (formState: FormState) => {
    if (cell) {
      let tempPrefix = getCellContext(cell);
      if (formState.id.split(":").length > 1) {
        tempPrefix = formState.id.split(":")[0];
      } else {
        if (
          tempPrefix === "" ||
          (tempPrefix.startsWith("r0$") && cell.id.split(":").length > 1)
        ) {
          tempPrefix = cell.id.split(":")[0];
        }
      }

      console.log(
        "prefix",
        getCellContext(cell) !== ""
          ? getCellContext(cell)
          : cell.id.split(":")[0]
      );

      dispatch(
        addCellMetadata({
          cellId: cell.id,
          prefix: tempPrefix,
          value: { ...formState },
        })
      );
      let newMetadata = {
        ...formState,
        id: formState.id.startsWith(tempPrefix)
          ? formState.id
          : tempPrefix + ":" + formState.id,
      };
      setSelectedMetadata(newMetadata);
      if (formState.match === "true") {
        setSelectedMetadata(newMetadata);
        setShowPropagate(true);
      }
      setShowPropagate(true);

      reset();
      setNewMetaMatching(formState.match === "true");
      setShowAdd(false);
      setToUpdate(!toUpdate);
    }
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
    const {
      annotationMeta: { match, highestScore },
    } = cellItem;

    if (match.value) {
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
      if (scoreLowerBound && highestScore < scoreLowerBound) {
        return "miss";
      }
    }
    return "warn";
  };

  const fetchMetadata = (service: string) => {
    const reconciliator = reconciliators.find(
      (recon) => recon.prefix === service
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
          })
        );
      }
      if (metasToDelete.length > 0 && cell) {
        dispatch(
          propagateCellDeleteMetadata({
            metadataIds: metasToDelete.map((meta) => meta.id),
            cellId: cell.id,
          })
        );
      }
      handleClose();
    } catch (error) {}
  };
  const handleChangeService = (event: SelectChangeEvent<string>) => {
    const newService = event.target.value;
    if (newService) {
      setCurrentService(newService);
      fetchMetadata(newService);
    }
  };

  // Add a handler for row checking
  const handleRowCheck = useCallback((rowId: string) => {
    // This function is required by CustomTable but in our case we're using radio buttons
    // We can implement it as a no-op, but it could be extended if needed
    console.log("Row checked:", rowId);
  }, []);

  return cell ? (
    <Dialog maxWidth="lg" open={open} onClose={handleCancel}>
      <Stack height="100%" minHeight="600px">
        <Stack
          direction="row"
          gap="10px"
          alignItems="center"
          padding="12px 16px"
        >
          <Stack direction="row" alignItems="center" gap={1}>
            {cell.annotationMeta && cell.annotationMeta.annotated && (
              <StatusBadge status={getBadgeStatus(cell)} />
            )}
            <Typography variant="h5">{cell?.label}</Typography>
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
              tooltipText="Help"
              onClick={() =>
                dispatch(updateUI({ openHelpDialog: true, tutorialStep: 8 }))
              }
              Icon={HelpOutlineRoundedIcon}
            />
          </Stack>
        </Stack>
        <Divider orientation="horizontal" flexItem />
        <Box paddingLeft="16px" paddingBottom="12px" marginTop="20px">
          {currentService && (
            <FormControl
              sx={{
                maxWidth: "200px",
              }}
              fullWidth
              size="small"
            >
              <InputLabel variant="outlined" id="reconciliator-label">
                Reconciliator service
              </InputLabel>
              <Select
                labelId="reconciliator-label"
                label="Reconciliator service"
                value={currentService}
                onChange={(e) => handleChangeService(e)}
                variant="outlined"
              >
                {uniqueReconciliators &&
                    uniqueReconciliators.map((reconciliator) => (
                    <MenuItem
                      key={reconciliator.prefix}
                      value={reconciliator.prefix}
                    >
                      {reconciliator.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </Box>
        <Typography
          sx={{
            display: showAdd ? "block" : "none",
            opacity: showAdd ? 1 : 0,
            transition: "opacity 300ms ease-out",
            marginLeft: "27px",
          }}
          variant="body2"
        >
          * required fields
        </Typography>
        {API.ENDPOINTS.SAVE && !isViewOnly && (
          <Stack
            position="relative"
            direction="row"
            alignItems="center"
            alignSelf="flex-start"
            padding="0px 12px"
          >
            <Typography
              sx={{
                display: !showAdd ? "block" : "none",
                opacity: !showAdd ? 1 : 0,
                transition: "opacity 300ms ease-out",
              }}
              variant="body2"
            >
              Add Metadata
            </Typography>

            <Tooltip open={showTooltip} title="Add metadata" placement="right">
              <IconButton
                color="primary"
                onMouseLeave={handleTooltipClose}
                onMouseEnter={handleTooltipOpen}
                onClick={handleShowAdd}
              >
                <AddRoundedIcon
                  sx={{
                    transition: "transform 150ms ease-out",
                    transform: showAdd ? "rotate(45deg)" : "rotate(0)",
                  }}
                />
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                position: "absolute",
                left: "100%",
                top: "50%",
                padding: "12px 16px",
                borderRadius: "6px",
                transition: "all 150ms ease-out",
                display: showAdd ? "block" : "none",
                opacity: showAdd ? 1 : 0,
                transform: showAdd
                  ? "translateY(-50%) translateX(0)"
                  : "translateY(-50%) translateX(-20px)",
              }}
            >
              <Stack
                component="form"
                direction="row"
                gap="10px"
                onSubmit={handleSubmit(onSubmitNewMetadata)}
              >
                <TextField
                  sx={{ minWidth: "200px" }}
                  size="small"
                  label="Id"
                  required
                  variant="outlined"
                  {...register("id")}
                />
                <TextField
                  sx={{ minWidth: "200px" }}
                  size="small"
                  label="Name"
                  required
                  variant="outlined"
                  {...register("name")}
                />
                <TextField
                  sx={{ minWidth: "200px" }}
                  size="small"
                  label="Uri"
                  variant="outlined"
                  required
                  {...register("uri")}
                />
                <TextField
                  sx={{ minWidth: "200px" }}
                  size="small"
                  label="Score"
                  variant="outlined"
                  {...register("score")}
                />
                <FormControl size="small" sx={{ width: "200px" }}>
                  <InputLabel>Match</InputLabel>
                  <Controller
                    render={({ field }) => (
                      <Select {...field} labelId="select-match" label="Match">
                        <MenuItem value="true">true</MenuItem>
                        <MenuItem value="false">false</MenuItem>
                      </Select>
                    )}
                    name="match"
                    control={control}
                  />
                </FormControl>
                <Button
                  type="submit"
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
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
      </Stack>
    </Dialog>
  ) : null;
};

export default MetadataDialog;
