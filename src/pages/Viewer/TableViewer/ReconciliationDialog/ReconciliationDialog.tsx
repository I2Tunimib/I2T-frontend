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
              {currentService.formSchema && (
                <>
                  <Divider />
                  <DynamicForm
                    service={currentService}
                    loading={loading}
                    onCancel={handleClose}
                    onSubmit={handleSubmit}
                  />
                </>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ReconciliateDialog;
