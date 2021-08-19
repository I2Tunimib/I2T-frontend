import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import {
  selectCellMetadata, selectMetadataDialogOpen,
  selectSelectedCellMetadataTableFormat, updateCellMetadata, updateUI
} from '@store/table/table.slice';
import {
  forwardRef,
  Ref,
  ReactElement,
  useState,
  useEffect
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
  const [selectedMetadata, setSelectedMetadata] = useState<string>('');

  const open = useAppSelector(selectMetadataDialogOpen);
  const { columns, rows } = useAppSelector(selectSelectedCellMetadataTableFormat);
  const selectedMetadataId = useAppSelector(selectCellMetadata);

  useEffect(() => {
    setSelectedMetadata(selectedMetadataId);
  }, [selectedMetadataId]);

  const handleClose = () => {
    dispatch(updateUI({
      openMetadataDialog: false
    }));
  };

  const handleCancel = () => {
    // set to inital state if canceled
    setSelectedMetadata(selectedMetadataId);
    handleClose();
  };

  const handleConfirm = () => {
    // update global state if confirmed
    dispatch(updateCellMetadata(selectedMetadata));
    handleClose();
  };

  const handleSelectRow = (id: string) => {
    setSelectedMetadata(id);
  };

  return (
    <Dialog
      maxWidth="md"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleCancel}
    >
      <DialogTitle>Metadata</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose to which entity the cell is reconciliated to:
        </DialogContentText>
        <SimpleTable
          selectableRows
          selectedValue={selectedMetadata}
          handleSelectRow={handleSelectRow}
          columns={columns}
          rows={rows}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MetadataDialog;
