import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles
} from '@material-ui/core';
import { selectMetadataDialogOpen, selectSelectedCellMetadataTableFormat } from '@store/table/table.slice';
import {
  forwardRef,
  Ref,
  ReactElement
} from 'react';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { useAppSelector } from '@hooks/store';
import { SimpleTable } from '@components/kit';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const MetadataDialog = () => {
  // keep track of open state
  const open = useAppSelector(selectMetadataDialogOpen);
  const { columns, rows } = useAppSelector(selectSelectedCellMetadataTableFormat);

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
      maxWidth="md"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
    >
      <DialogTitle>Metadata</DialogTitle>
      <DialogContent>
        <SimpleTable columns={columns} rows={rows} />
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

export default MetadataDialog;
