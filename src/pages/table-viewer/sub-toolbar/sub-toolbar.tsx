import { Button, IconButton } from '@material-ui/core';
import { selectIsColumnSelected, selectSelectedCell, updateUI } from '@store/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import styles from './sub-toolbar.module.scss';
import ReconciliateDialog from '../reconciliate-dialog/reconciliate-dialog';
import MetadataDialog from '../metadata-dialog/metadata-dialog';

/**
 * Action container
 */
const ActionGroup = ({ children }: any) => (
  <div className={styles.ActionGroup}>
    {children}
  </div>
);

/**
 * Sub toolbar for common and contextual actions
 */
const SubToolbar = () => {
  const dispatch = useAppDispatch();
  const isColumnSelected = useAppSelector(selectIsColumnSelected);
  const selectedCell = useAppSelector(selectSelectedCell);

  return (
    <>
      <div className={styles.Container}>
        <ActionGroup>
          <IconButton size="small">
            <UndoRoundedIcon />
          </IconButton>
          <IconButton size="small">
            <RedoRoundedIcon />
          </IconButton>
          <IconButton disabled={!isColumnSelected} size="small">
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </ActionGroup>
        <ActionGroup>
          <Button
            disabled={!selectedCell}
            variant="contained"
            onClick={() => dispatch(updateUI({ openMetadataDialog: true }))}
          >
            View metadata
          </Button>
        </ActionGroup>
        <ActionGroup>
          <Button
            color="primary"
            disabled={!isColumnSelected}
            onClick={() => dispatch(updateUI({ openReconciliateDialog: true }))}
            variant="contained"
          >
            Reconcile
          </Button>
          <Button disabled variant="contained">Extend</Button>
        </ActionGroup>
      </div>
      <ReconciliateDialog />
      <MetadataDialog />
    </>
  );
};

export default SubToolbar;
