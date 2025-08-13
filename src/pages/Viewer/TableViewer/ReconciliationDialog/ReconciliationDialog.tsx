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
import { Reconciliator } from "@store/slices/config/interfaces/config";
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
    props: TransitionProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
  ) => <Slide direction="down" ref={ref} {...props} />
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
  const dispatch = useAppDispatch();

  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const columnIds = useAppSelector(selectReconciliatioContextColumnIds);
  const helpDialogOpen = useAppSelector(selectIsHelpDialogOpen);
  const selectedCells = useAppSelector(selectReconciliationCells);
  const { loading, error } = useAppSelector(selectReconcileRequestStatus);
  const selectRef = React.useRef<HTMLDivElement>(null);
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
    let mappedReconciliators = new Map();
    for (const reconciliator of reconciliators) {
      const reconUri = reconciliator.uri;
      // Get the group name if available, otherwise use the URI
      const groupKey = getGroupFromUri(reconUri) || reconUri;

      if (mappedReconciliators.has(groupKey)) {
        const reconciliatorGroup = mappedReconciliators.get(groupKey);
        reconciliatorGroup.push(reconciliator);
        mappedReconciliators.set(groupKey, reconciliatorGroup);
      } else {
        mappedReconciliators.set(groupKey, [reconciliator]);
      }
    }
    setReconciliatorsGroups(mappedReconciliators);
  }

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

  const handleChange = (event: SelectChangeEvent<string>) => {
    console.log(
      "event",
      event.target.value,
      reconciliators,
      reconciliators.find((recon) => {
        return recon.id === event.target.value;
      })
    );
    if (event.target.value) {
      setCurrentService(
        reconciliators.find((recon) => {
          return recon.id === event.target.value;
        })
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
    dispatch(
      reconcile({
        items: selectedCells,
        reconciliator: currentService,
        formValues: formState,
      })
    )
      .unwrap()
      .then((result) => {
        if (reset) reset();
        setCurrentService(null);
        dispatch(
          updateUI({
            openReconciliateDialog: false,
          })
        );
      });
  };

  const handleHeaderClick = (e, uri) => {
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
        handleClose();
        setCurrentService(null);
        setExpandedGroup(null);
      }}
    >
      {/* <HelpDialog
        open={helpDialogOpen}
        onClose={() => dispatch(updateUI({ helpDialogOpen: false }))}
      /> */}
      <Stack
        direction={"row"}
        alignItems="center"
        justifyContent={"space-between"}
      >
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
        <DialogContentText>
          Select a service to reconcile with:
        </DialogContentText>
        <Stack gap="10px">
          <Stack gap="10px">
            <FormControl className="field">
              <Select
                inputRef={selectRef}
                open={serviceSelectOpen}
                onOpen={handleServiceSelectOpen}
                onClose={handleServiceSelectClose}
                value={currentService?.id || ""} // Use an empty string as the fallback
                onChange={handleChange}
                variant="outlined"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "400px",
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return "Please select a service";
                  const selectedService = reconciliators.find(
                    (service) => service.id === selected
                  );
                  return selectedService ? selectedService.name : "";
                }}
              >
                {reconciliatorsGroups &&
                  Array.from(reconciliatorsGroups).flatMap(([uri, reconciliators]) => [
                    <ListSubheader
                      key={`group-${uri}`}
                      onClick={(e) => handleHeaderClick(e, uri)}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <ListItemText primary={uri} />
                      <Box sx={{ ml: "auto" }}>
                        {expandedGroup === uri ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                    </ListSubheader>,
                    ...(expandedGroup === uri
                      ? reconciliators.map((reconciliator) => (
                        <MenuItem
                          key={reconciliator.id}
                          value={reconciliator.id}
                          sx={{ pl: 4 }}
                          onClick={() => {
                            handleChange({
                              target: { value: reconciliator.id },
                            });

                            // if (selectRef.current) {
                            //   selectRef.current.hidePopover(); // manually closes the dropdown
                            // }
                          }}
                        >
                          {reconciliator.name}
                        </MenuItem>
                        ))
                        : []),
                  ])}
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
                    handleClose();
                    setCurrentService(null);
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
