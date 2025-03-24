import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
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
import {
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
import { LoadingButton } from "@mui/lab";
import { SquaredBox } from "@components/core";
import { Reconciliator } from "@store/slices/config/interfaces/config";
import DynamicForm from "@components/core/DynamicForm/DynamicForm";

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
  const [reconciliatorsGroups, setReconciliatorsGroups] = useState<
    Map<string, Reconciliator[]>
  >(new Map());
  const dispatch = useAppDispatch();

  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const columnIds = useAppSelector(selectReconciliatioContextColumnIds);
  const selectedCells = useAppSelector(selectReconciliationCells);
  const { loading, error } = useAppSelector(selectReconcileRequestStatus);

  useEffect(() => {
    // Log the value of reconciliators

    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0]);
      groupReconciliators();
    }
  }, [reconciliators]);

  async function groupReconciliators() {
    let mappedReconciliators = new Map();
    for (const reconciliator of reconciliators) {
      console.log("reconciliator", reconciliator);
      const reconUri = reconciliator.uri;
      const reconPrefix = reconciliator.prefix;
      const reconName = reconciliator.name;

      if (mappedReconciliators.has(reconUri)) {
        const reconciliatorGroup = mappedReconciliators.get(reconUri);
        reconciliatorGroup.push(reconciliator);
        mappedReconciliators.set(reconUri, reconciliatorGroup);
      } else {
        mappedReconciliators.set(reconUri, [reconciliator]);
      }

      setReconciliatorsGroups(mappedReconciliators);
    }
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
    if (event.target.value) {
      setCurrentService(
        reconciliators.find((recon) => {
          return recon.prefix === event.target.value;
        })
      );
    }
  };

  const handleChangeContextColumns = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setContextColumns(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = (formState: Record<string, any>) => {
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
        dispatch(
          updateUI({
            openReconciliateDialog: false,
          })
        );
      });
  };

  return (
    <Dialog
      className="default-dialog"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
    >
      <DialogTitle>Reconciliation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Select a service to reconcile with:
        </DialogContentText>
        <Stack gap="10px">
          {currentService && (
            <Stack gap="10px">
              <FormControl className="field">
                <Select
                  value={currentService.prefix}
                  multiline={false}
                  onChange={(e) => handleChange(e)}
                  variant="outlined"
                >
                  {reconciliatorsGroups &&
                    Array.from(reconciliatorsGroups).flatMap(
                      ([uri, reconciliators]) => [
                        <ListSubheader key={`header-${uri}`}>
                          {uri}
                        </ListSubheader>,
                        ...reconciliators.map((reconciliator) => (
                          <MenuItem
                            key={reconciliator.prefix}
                            value={reconciliator.prefix}
                          >
                            {reconciliator.name}
                          </MenuItem>
                        )),
                      ]
                    )}
                </Select>
              </FormControl>
              {error && <Typography color="error">{error.message}</Typography>}
              {currentService.description && (
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
              <Divider />
              <DynamicForm
                service={currentService}
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={handleClose}
              />
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
          )}
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
