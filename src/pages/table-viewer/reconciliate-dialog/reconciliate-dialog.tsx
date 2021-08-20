import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Button,
  CircularProgress,
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
  selectCellsReconciliationRequest,
  selectReconcileRequestStatus,
  selectReconciliateDialogOpen,
  updateUI
} from '@store/table/table.slice';
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
import { selectServicesConfig } from '@store/config/config.slice';
import { reconcile } from '@store/table/table.thunk';
import { useSnackbar } from 'notistack';
import styles from './reconciliate-dialog.module.scss';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const ReconciliateDialog = () => {
  // keep track of selected service
  const [currentService, setCurrentService] = useState<any>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const dispatch = useAppDispatch();
  // keep track of open state
  const open = useAppSelector(selectReconciliateDialogOpen);
  const { reconciliators } = useAppSelector(selectServicesConfig);
  // selected columns
  const selectedColumnsCells = useAppSelector(selectCellsReconciliationRequest);
  // loading state for reconciliation request
  const { loading } = useAppSelector(selectReconcileRequestStatus);

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0]);
    }
  }, [reconciliators]);

  const handleConfirm = () => {
    // fetchManualData();
    dispatch(reconcile({
      baseUrl: currentService.relativeUrl,
      data: selectedColumnsCells,
      reconciliator: currentService.name
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
  };

  const handleClose = () => {
    dispatch(updateUI({
      openReconciliateDialog: false
    }));
  };

  const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
    setCurrentService(event.target.value);
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
          {`LOADING: ${loading}`}
        </DialogContentText>
        {currentService && (
          <FormControl className="field">
            <Select
              value={currentService}
              onChange={(e) => handleChange(e)}
              variant="outlined"
            >
              {reconciliators && reconciliators.map((service: any) => (
                <MenuItem key={service.name} value={service}>{service.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          {loading ? <CircularProgress className={styles.Progress} /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReconciliateDialog;
