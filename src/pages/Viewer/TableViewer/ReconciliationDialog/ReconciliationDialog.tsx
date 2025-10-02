import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import React, {
  forwardRef,
  Ref,
  ReactElement,
  useEffect,
  useState,
  FC,
  Fragment,
} from "react";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { reconcile } from "@store/slices/table/table.thunk";
import {
  selectReconcileDialogStatus,
  selectReconciliationCells,
  selectReconcileRequestStatus,
  selectReconciliatioContextColumnIds,
  selectSelectedColumnIds,
} from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { selectReconciliatorsAsArray } from "@store/slices/config/config.selectors";
//import { LoadingButton } from "@mui/lab";
import { SquaredBox } from "@components/core";
import {
  Extender,
  Reconciliator,
} from "@store/slices/config/interfaces/config";
import DynamicForm from "@components/core/DynamicForm/DynamicForm";
import {
  ExpandLess,
  ExpandMore,
  HelpOutlineRounded,
} from "@mui/icons-material";
import { getGroupFromUri } from "@services/utils/kg-info";
import HelpDialog from "@pages/Viewer/HelpDialog/HelpDialog";
import { selectIsHelpDialogOpen } from "@store/slices/datasets/datasets.selectors";

const Transition = forwardRef(
  (
    props: TransitionProps & {
      children: ReactElement<any, any>;
    },
    ref: Ref<unknown>,
  ) => <Slide direction="down" ref={ref} {...props} />,
);

export type ReconciliationDialogProps = {
  open: boolean;
  handleClose: () => void;
};

const ReconciliateDialog: FC<ReconciliationDialogProps> = ({
  open,
  handleClose,
}) => {
  // keep track of selected service
  const [contextColumns, setContextColumns] = useState<string[]>([]);
  const [currentService, setCurrentService] = useState<Reconciliator | null>();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [serviceSelectOpen, setServiceSelectOpen] = useState(false);
  const [reconciliatorsGroups, setReconciliatorsGroups] = useState<
    Map<string, Reconciliator[]>
  >(new Map());
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [uniqueGroupNames, setUniqueGroupNames] = useState<string[]>([]);
  const dispatch = useAppDispatch();

  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const columnIds = useAppSelector(selectReconciliatioContextColumnIds);
  const helpDialogOpen = useAppSelector(selectIsHelpDialogOpen);
  const selectedCells = useAppSelector(selectReconciliationCells);
  const { loading, error } = useAppSelector(selectReconcileRequestStatus);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const reconcileRequestRef = React.useRef<any>(null);
  useEffect(() => {
    // Log the value of reconciliators

    // set initial value of select
    if (reconciliators) {
      // setCurrentService(reconciliators[0]);
      groupReconciliators();
    }
  }, [reconciliators]);

  function handleServiceSelectOpen() {
    setServiceSelectOpen(true);
  }
  function handleServiceSelectClose() {
    setServiceSelectOpen(false);
  }
  async function groupReconciliators() {
    const mappedReconciliators = new Map<string, Reconciliator[]>();
    const uniqueGroupNamesSet = new Set<string>();

    const uniqueReconciliators = reconciliators.filter(
      (reconciliator, index, self) =>
        index === self.findIndex((r) => r.id === reconciliator.id),
    );

    for (const reconciliator of uniqueReconciliators) {
      const reconUri = reconciliator.uri;
      const groupKey = getGroupFromUri(reconUri) || "Other Services";
      uniqueGroupNamesSet.add(groupKey);

      if (mappedReconciliators.has(groupKey)) {
        mappedReconciliators.get(groupKey)?.push(reconciliator);
      } else {
        mappedReconciliators.set(groupKey, [reconciliator]);
      }
    }
    setReconciliatorsGroups(mappedReconciliators);
    setUniqueGroupNames(Array.from(uniqueGroupNamesSet));
  }

  const selectedServices = reconciliatorsGroups.get(selectedGroup || "") || [];

  const handleConfirm = () => {
    // const reconciliator = reconciliators.find((recon)
    // => recon.prefix === currentService?.prefix);
    // if (reconciliator) {
    //   dispatch(reconcile({
    //     baseUrl: reconciliator.relativeUrl,
    //     items: selectedCells,
    //     reconciliator,
    //     contextColumns
    //   }))
    //     .unwrap()
    //     .then((result) => {
    //       dispatch(updateUI({
    //         openReconciliateDialog: false
    //       }));
    //     });
    // }
  };

  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    const groupName = event.target.value;
    setSelectedGroup(groupName);
    setCurrentService(null);
  };

  const handleServiceChange = (event: SelectChangeEvent<string>) => {
    const serviceId = event.target.value;
    const selectedService = reconciliators.find(
      (recon) => recon.id === serviceId,
    );
    setCurrentService(selectedService || null);
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    console.log(
      "event",
      event.target.value,
      reconciliators,
      reconciliators.find((recon) => {
        return recon.id === event.target.value;
      }),
    );
    if (event.target.value) {
      setCurrentService(
        reconciliators.find((recon) => {
          return recon.id === event.target.value;
        }),
      );
      handleServiceSelectClose();
    }
  };

  const handleChangeContextColumns = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setContextColumns(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = (formState: Record<string, any>, reset?: Function) => {
    if (!currentService) return;
    console.log("formState", formState);
    const req = dispatch(
      reconcile({
        items: selectedCells,
        reconciliator: currentService,
        formValues: formState,
      }),
    );
    // store the dispatched promise-like object so we can abort it if needed
    reconcileRequestRef.current = req;
    req
      .unwrap()
      .then((result) => {
        if (reset) reset();
        setCurrentService(null);
        setSelectedGroup(null);
        dispatch(
          updateUI({
            openReconciliateDialog: false,
          }),
        );
      })
      .finally(() => {
        reconcileRequestRef.current = null;
      });
  };

  const handleHeaderClick = (e: React.MouseEvent, uri: string) => {
    e.stopPropagation(); // Prevent the Select from closing
    setExpandedGroup((prev) => (prev === uri ? null : uri));
  };
  return (
    <Dialog
      className="default-dialog"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => {
        // abort any in-flight reconcile request when dialog is closed
        if (reconcileRequestRef.current && reconcileRequestRef.current.abort) {
          reconcileRequestRef.current.abort();
          reconcileRequestRef.current = null;
        }
        handleClose();
        setCurrentService(null);
        setExpandedGroup(null);
      }}
    >
      {/* <HelpDialog
        open={helpDialogOpen}
        onClose={() => dispatch(updateUI({ helpDialogOpen: false }))}
      /> */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <DialogTitle>Reconciliation</DialogTitle>
        <IconButton
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            marginRight: "20px",
          }}
          onClick={() => {
            dispatch(updateUI({ openHelpDialog: true, tutorialStep: 3 }));
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <DialogContentText paddingBottom="10px">
          Select a group of service to reconcile with:
        </DialogContentText>
        <Stack gap="10px">
          <Stack gap="10px">
            {/* Select reconciliator group */}
            <FormControl className="field">
              <Select
                labelId="reconciliator-group-label"
                value={selectedGroup || ""}
                onChange={handleGroupChange}
                variant="outlined"
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "400px",
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <em style={{ color: "rgba(0, 0, 0, 0.38)" }}>
                        Choose a service group...
                      </em>
                    );
                  }
                  return selected;
                }}
              >
                <MenuItem disabled value="">
                  <em>Choose a service group...</em>
                </MenuItem>
                {uniqueGroupNames.map((groupName) => (
                  <MenuItem key={groupName} value={groupName}>
                    {groupName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
        {/* Select specific reconciliate service, abled only if a reconciliator group is selected */}
        <DialogContentText paddingTop="10px" paddingBottom="10px">
          Select a specific service of the group selected:
        </DialogContentText>
        <Stack gap="10px">
          <Stack gap="10px">
            <FormControl className="field" disabled={!selectedGroup}>
              <Select
                labelId="reconciliator-service-label"
                value={currentService?.id || ""}
                onChange={handleServiceChange}
                variant="outlined"
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "400px",
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <em style={{ color: "rgba(0, 0, 0, 0.38)" }}>
                        Choose a reconciliation service...
                      </em>
                    );
                  }
                  const selectedService = selectedServices.find(
                    (service) => service.id === selected,
                  );
                  return selectedService ? selectedService.name : "";
                }}
              >
                <MenuItem disabled value="">
                  <em>Choose a reconciliation service...</em>
                </MenuItem>
                {selectedServices.map((reconciliator) => (
                  <MenuItem key={reconciliator.id} value={reconciliator.id}>
                    {reconciliator.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && <Typography color="error">{error.message}</Typography>}
            {currentService && currentService.description && (
              <SquaredBox
                dangerouslySetInnerHTML={{
                  __html: currentService.description,
                }}
              >
                {/*
                 {currentService.description}
                 */}
              </SquaredBox>
            )}
            {currentService && (
              <>
                <Divider />
                <DynamicForm
                  service={currentService}
                  loading={loading}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    // abort any in-flight reconcile request when user cancels the modal form
                    if (
                      reconcileRequestRef.current &&
                      reconcileRequestRef.current.abort
                    ) {
                      reconcileRequestRef.current.abort();
                      reconcileRequestRef.current = null;
                    }
                    handleClose();
                    setCurrentService(null);
                    setSelectedGroup(null);
                    setExpandedGroup(null);
                  }}
                />
              </>
            )}

            {/* <div>
                Select any context columns to provide to the reconciliator service
              </div>
              <FormControl className="field">
                <InputLabel id="demo-multiple-checkbox-label">Context columns</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={contextColumns}
                  onChange={handleChangeContextColumns}
                  input={<OutlinedInput label="Context columns" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {columnIds.map((id) => (
                    <MenuItem key={id} value={id}>
                      <Checkbox checked={contextColumns.indexOf(id) > -1} />
                      <ListItemText primary={<span>{id}</span>} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
          </Stack>
        </Stack>
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton onClick={handleConfirm} loading={!!loading}>
          Confirm
        </LoadingButton>
      </DialogActions> */}
    </Dialog>
  );
};

export default ReconciliateDialog;
