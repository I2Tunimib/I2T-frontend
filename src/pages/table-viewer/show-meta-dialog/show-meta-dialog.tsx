import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core';
import { selectMetadataDialogOpen, selectSelectedCell } from '@store/table/table.slice';
import {
  forwardRef,
  Ref,
  ReactElement
} from 'react';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { useAppSelector } from '@hooks/store';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const ReconciliateDialog = () => {
  // keep track of open state
  const open = useAppSelector(selectMetadataDialogOpen);
  const selectedCell = useAppSelector(selectSelectedCell);

  // useEffect(() => {
  //   // set initial value of select
  //   if (reconciliators) {
  //     setCurrentService(reconciliators[0].name);
  //   }
  // }, [reconciliators]);

  const handleClose = () => {
    // fetchManualData();
    // dispatch(updateUI({
    //   openReconciliateDialog: false
    // }));
  };

  // const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
  //   setCurrentService(event.target.value as string);
  // };

  return (
    <Dialog
      className="default-dialog"
      open={false}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
    >
      <DialogTitle>Reconciliation</DialogTitle>
      <DialogContent>
        a
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
