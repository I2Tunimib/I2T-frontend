import { useAppDispatch, useAppSelector } from '@hooks/store';
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
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material';
import {
  forwardRef,
  Ref,
  ReactElement,
  useEffect,
  useState
} from 'react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { reconcile } from '@store/slices/table/table.thunk';
import {
  selectReconcileDialogStatus, selectReconciliationCells,
  selectReconcileRequestStatus,
  selectReconciliatioContextColumnIds,
  selectSelectedColumnIds
} from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { selectReconciliatorsAsArray } from '@store/slices/config/config.selectors';
import { LoadingButton } from '@mui/lab';
import { SquaredBox } from '@components/core';
import { Reconciliator } from '@store/slices/config/interfaces/config';
import DynamicForm from '@components/core/DynamicForm/DynamicForm';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const ReconciliateDialog = () => {
  // keep track of selected service
  const [contextColumns, setContextColumns] = useState<string[]>([]);
  const [currentService, setCurrentService] = useState<Reconciliator | null>();
  const dispatch = useAppDispatch();
  // keep track of open state
  const open = useAppSelector(selectReconcileDialogStatus);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const columnIds = useAppSelector(selectReconciliatioContextColumnIds);
  const selectedCells = useAppSelector(selectReconciliationCells);
  const { loading, error } = useAppSelector(selectReconcileRequestStatus);

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0]);
    }
  }, [reconciliators]);

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

  const handleClose = () => {
    dispatch(updateUI({
      openReconciliateDialog: false
    }));
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (event.target.value) {
      setCurrentService(reconciliators.find((recon) => recon.prefix === event.target.value));
    }
  };

  const handleChangeContextColumns = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value }
    } = event;
    setContextColumns(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = (formState: Record<string, any>) => {
    if (!currentService) return;
    dispatch(reconcile({
      items: selectedCells,
      reconciliator: currentService,
      formValues: formState
    }))
      .unwrap()
      .then((result) => {
        dispatch(updateUI({
          openReconciliateDialog: false
        }));
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
                  onChange={(e) => handleChange(e)}
                  variant="outlined"
                >
                  {reconciliators && reconciliators.map((reconciliator) => (
                    <MenuItem key={reconciliator.prefix} value={reconciliator.prefix}>
                      {reconciliator.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {error && <Typography color="error">{error.message}</Typography>}
              {currentService.description && (
                <SquaredBox>
                  {currentService.description}
                </SquaredBox>
              )}
              <Divider />
              <DynamicForm
                service={currentService}
                loading={loading}
                onSubmit={handleSubmit}
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
