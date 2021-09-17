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
  Select
} from '@material-ui/core';
import {
  forwardRef,
  Ref,
  ReactElement,
  ChangeEvent,
  useState,
  useEffect
} from 'react';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
// import { selectServicesConfig } from '@store/slices/config/config.selectors';
import { reconcile } from '@store/slices/table/table.thunk';
import { useSnackbar } from 'notistack';
import { ButtonLoading } from '@components/core';
import {
  selectReconcileDialogStatus, selectReconciliationCells,
  selectReconcileRequestStatus
} from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { selectReconciliatorsAsArray } from '@store/slices/config/config.selectors';
import { Reconciliator } from '@store/slices/config/interfaces/config';
import { ID } from '@store/interfaces/store';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const ReconciliateDialog = () => {
  // keep track of selected service
  const [currentService, setCurrentService] = useState<string>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const dispatch = useAppDispatch();
  // keep track of open state
  const open = useAppSelector(selectReconcileDialogStatus);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const selectedCells = useAppSelector(selectReconciliationCells);
  const { loading } = useAppSelector(selectReconcileRequestStatus);

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0].id);
    }
  }, [reconciliators]);

  const handleConfirm = () => {
    const reconciliator = reconciliators.find((recon) => recon.id === currentService);
    if (reconciliator) {
      dispatch(reconcile({
        baseUrl: reconciliator.relativeUrl,
        data: selectedCells,
        reconciliator
      }))
        .unwrap()
        .then((result) => {
          dispatch(updateUI({
            openReconciliateDialog: false
          }));
        })
        .catch((e) => {
          enqueueSnackbar(e.message, {
            variant: 'error',
            autoHideDuration: 3000
          });
        });
    }
  };

  const handleClose = () => {
    if (!loading) {
      dispatch(updateUI({
        openReconciliateDialog: false
      }));
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    if (event.target.value) {
      setCurrentService(event.target.value);
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
        {currentService && (
          <FormControl className="field">
            <Select
              value={currentService}
              onChange={(e) => handleChange(e)}
              variant="outlined"
            >
              {reconciliators && reconciliators.map((reconciliator) => (
                <MenuItem key={reconciliator.id} value={reconciliator.id}>
                  {reconciliator.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <ButtonLoading onClick={handleConfirm} loading={!!loading}>
          Confirm
        </ButtonLoading>
      </DialogActions>
    </Dialog>
  );
};

export default ReconciliateDialog;
