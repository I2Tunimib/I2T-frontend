import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@material-ui/core';
import {
  forwardRef,
  Ref,
  ReactElement,
  useState,
  useEffect,
  useMemo,
  ChangeEvent
} from 'react';
import Slide from '@material-ui/core/Slide';
import CachedRoundedIcon from '@material-ui/icons/CachedRounded';
import { TransitionProps } from '@material-ui/core/transitions';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  addCellMetadata, deleteCellMetadata,
  updateCellMetadata, updateUI
} from '@store/slices/table/table.slice';
import {
  selectMetadataDialogStatus,
  selectCellMetadataTableFormat,
  selectCurrentCell,
  selectReconcileRequestStatus
} from '@store/slices/table/table.selectors';
import Table from '@components/kit/Table/Table';
import { selectReconciliatorsAsArray, selectReconciliatorsAsObject } from '@store/slices/config/config.selectors';
import { reconcile } from '@store/slices/table/table.thunk';
import { Skeleton } from '@material-ui/lab';
import { IconButtonTooltip } from '@components/core';
import { useForm } from 'react-hook-form';
import { ButtonShortcut } from '@components/kit';
import { getCellContext } from '@store/slices/table/utils/table.reconciliation-utils';
import styles from './MetadataDialog.module.scss';

const Transition = forwardRef((
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) => (<Slide direction="down" ref={ref} {...props} />));

const LoadingSkeleton = () => {
  return (
    <div className={styles.SkeletonContainer}>
      <Skeleton height={60} />
      <Skeleton height={60} />
      <Skeleton height={60} />
      <Skeleton height={60} />
    </div>
  );
};

interface FormState {
  id: string;
  name: string;
}

const MetadataDialog = () => {
  const dispatch = useAppDispatch();
  const [currentReconciliator, setCurrentReconciliator] = useState<string>('');
  const [selectedMetadata, setSelectedMetadata] = useState<string>('');
  const { handleSubmit, reset, register } = useForm<FormState>();
  const { columns, data } = useAppSelector(selectCellMetadataTableFormat);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const open = useAppSelector(selectMetadataDialogStatus);
  const cell = useAppSelector(selectCurrentCell);
  const reconciliators = useAppSelector(selectReconciliatorsAsObject);

  const columnsTable = useMemo(() => columns, [columns]);
  const dataTable = useMemo(() => data, [data]);

  useEffect(() => {
    if (cell) {
      const cellContext = getCellContext(cell);
      if (cellContext) {
        setCurrentReconciliator(reconciliators[cellContext].name);
      }
    }
  }, [cell, reconciliators]);

  const handleClose = () => {
    dispatch(updateUI({
      openMetadataDialog: false
    }));
  };

  const handleCancel = () => {
    // set to inital state if canceled
    handleClose();
  };

  const handleConfirm = () => {
    // update global state if confirmed
    if (cell) {
      dispatch(updateCellMetadata({ metadataId: selectedMetadata, cellId: cell.id }));
      handleClose();
    }
  };

  const handleSelectedRowChange = (row: any) => {
    setSelectedMetadata(row.id.label);
  };

  const handleDeleteRow = ({ original }: any) => {
    if (cell) {
      dispatch(deleteCellMetadata({
        cellId: cell.id,
        metadataId: original.id.label
      }));
    }
  };

  const onSubmitNewMetadata = (formState: FormState) => {
    if (cell) {
      dispatch(addCellMetadata({
        cellId: cell.id,
        prefix: getCellContext(cell),
        value: { ...formState }
      }));
      reset();
    }
  };

  return (
    <Dialog
      maxWidth="md"
      open={open}
      TransitionComponent={Transition}
      onClose={handleCancel}
    >
      <DialogTitle>Metadata</DialogTitle>
      <DialogContent className={styles.DialogContent}>
        {dataTable.length > 0 && (
          <DialogContentText>
            {`Current reconciliator: ${currentReconciliator}`}
          </DialogContentText>
        )}
        <div className={styles.Container}>
          <div className={styles.Content}>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {(dataTable.length > 0 && columnsTable.length > 0) ? (
                  <>
                    <Table
                      columns={columnsTable}
                      data={dataTable}
                      tableHeaderClass={styles.TableHeader}
                      onSelectedRowChange={handleSelectedRowChange}
                      onDeleteRow={handleDeleteRow}
                    />
                    <form className={styles.AddRow} onSubmit={handleSubmit(onSubmitNewMetadata)}>
                      <TextField size="small" label="id" variant="outlined" {...register('id')} />
                      <TextField size="small" label="name" variant="outlined" {...register('name')} />
                      <Button type="submit" color="primary" variant="outlined">Add metadata</Button>
                    </form>
                  </>
                ) : (
                  <Typography color="textSecondary">This cell does not have any metadata</Typography>
                )}
              </>
            )}
          </div>
        </div>
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
