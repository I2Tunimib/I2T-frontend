import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import {
  forwardRef,
  Ref,
  ReactElement,
  useState,
  useMemo
} from 'react';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { updateCellMetadata, updateUI } from '@store/slices/table/table.slice';
import {
  selectMetadataDialogStatus,
  selectCellMetadataTableFormat,
  // selectMetdataCellId,
  selectSelectedCellIds
} from '@store/slices/table/table.selectors';
import Table from '@components/kit/Table/Table';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const MetadataDialog = () => {
  const dispatch = useAppDispatch();
  const [selectedMetadata, setSelectedMetadata] = useState<string>('');
  const { columns, data } = useAppSelector(selectCellMetadataTableFormat);
  const open = useAppSelector(selectMetadataDialogStatus);
  const selectedCells = useAppSelector(selectSelectedCellIds);

  const columnsTable = useMemo(() => columns, [columns]);
  const dataTable = useMemo(() => data, [data]);

  const handleClose = () => {
    dispatch(updateUI({
      openMetadataDialog: false
    }));
  };

  const handleCancel = () => {
    // set to inital state if canceled
    // setSelectedMetadata(selectedMetadataId);
    handleClose();
  };

  const handleConfirm = () => {
    const cellId = Object.keys(selectedCells)[0];
    // update global state if confirmed
    dispatch(updateCellMetadata({ metadataId: selectedMetadata, cellId }));
    handleClose();
  };

  const handleSelectedRowChange = (row: any) => {
    setSelectedMetadata(row.id.label);
  };

  const handleDeleteRow = (id: string) => {
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
        <Table
          columns={columnsTable}
          data={dataTable}
          onSelectedRowChange={handleSelectedRowChange}
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
