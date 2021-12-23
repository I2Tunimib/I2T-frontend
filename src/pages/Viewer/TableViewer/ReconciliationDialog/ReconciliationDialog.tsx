import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
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
  selectReconcileRequestStatus
} from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { selectReconciliatorsAsArray } from '@store/slices/config/config.selectors';
import { LoadingButton } from '@mui/lab';
import { SquaredBox } from '@components/core';
import { Reconciliator } from '@store/slices/config/interfaces/config';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const ReconciliateDialog = () => {
  // keep track of selected service
  const [currentService, setCurrentService] = useState<Reconciliator | null>();
  const dispatch = useAppDispatch();
  // keep track of open state
  const open = useAppSelector(selectReconcileDialogStatus);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const selectedCells = useAppSelector(selectReconciliationCells);
  const { loading, error } = useAppSelector(selectReconcileRequestStatus);

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0]);
    }
  }, [reconciliators]);

  const handleConfirm = () => {
    const reconciliator = reconciliators.find((recon) => recon.prefix === currentService?.prefix);
    if (reconciliator) {
      dispatch(reconcile({
        baseUrl: reconciliator.relativeUrl,
        items: selectedCells,
        reconciliator
      }))
        .unwrap()
        .then((result) => {
          dispatch(updateUI({
            openReconciliateDialog: false
          }));
        });
    }
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
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton onClick={handleConfirm} loading={!!loading}>
          Confirm
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ReconciliateDialog;
