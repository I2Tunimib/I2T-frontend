import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import { selectMetadataDialogOpen, selectSelectedCellMetadataTableFormat, updateUI } from '@store/table/table.slice';
import {
  forwardRef,
  Ref,
  ReactElement
} from 'react';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { SimpleTable } from '@components/kit';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const MetadataDialog = () => {
  const dispatch = useAppDispatch();
  // keep track of open state
  const open = useAppSelector(selectMetadataDialogOpen);
  const { columns, rows } = useAppSelector(selectSelectedCellMetadataTableFormat);

  const handleClose = () => {
    // fetchManualData();
    dispatch(updateUI({
      openMetadataDialog: false
    }));
  };

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
        <DialogContentText>
          Choose to which entity the cell is reconciliated to.
        </DialogContentText>
        <SimpleTable
          selectableRows
          columns={columns}
          rows={rows}
        />
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
