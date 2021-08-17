import { useFetch } from '@hooks/fetch';
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
  addCellsColumnMetadata,
  selectCellsReconciliationRequest,
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
import { asiaGeoEndpoint } from '@services/api/endpoints/table';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const ReconciliateDialog = () => {
  // keep track of selected service
  const [currentService, setCurrentService] = useState<string>('');

  const dispatch = useAppDispatch();
  // keep track of open state
  const open = useAppSelector(selectReconciliateDialogOpen);
  const { reconciliators } = useAppSelector(selectServicesConfig);
  // selected columns
  const selectedColumnsCells = useAppSelector(selectCellsReconciliationRequest);
  // make request to reconciliate selected columns
  const { response, fetchManualData } = useFetch(
    asiaGeoEndpoint({ data: selectedColumnsCells }),
    {
      manual: true,
      dispatchFn: addCellsColumnMetadata,
      mappingFn: (data) => ({ data }),
      dispatchParams: [{ reconciliator: currentService }]
    }
  );

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0].name);
    }
  }, [reconciliators]);

  const handleClose = () => {
    fetchManualData();
    dispatch(updateUI({
      openReconciliateDialog: false
    }));
  };

  const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
    setCurrentService(event.target.value as string);
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
        <FormControl className="field">
          <Select
            value={currentService}
            onChange={(e) => handleChange(e)}
            variant="outlined"
          >
            {reconciliators && reconciliators.map((service: any) => (
              <MenuItem key={service.name} value={service.name}>{service.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleClose} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReconciliateDialog;
