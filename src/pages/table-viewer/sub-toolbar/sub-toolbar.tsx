import { Button, IconButton } from '@material-ui/core';
import { selectIsColumnSelected, selectSelectedCell, updateUI } from '@store/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import styles from './sub-toolbar.module.scss';
import ReconciliateDialog from '../reconciliate-dialog/reconciliate-dialog';

/**
 * Action container
 */
const ActionGroup = ({ children }: any) => (
  <div className={styles['action-group']}>
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

  const handleReconciliateButtonClick = () => {
    dispatch(updateUI({
      openReconciliateDialog: true
    }));
  };

  return (
    <>
      <div className={styles['sub-toolbar-container']}>
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
          <Button disabled={!selectedCell} variant="contained">View metadata</Button>
        </ActionGroup>
        <ActionGroup>
          <Button color="primary" disabled={!isColumnSelected} onClick={handleReconciliateButtonClick} variant="contained">Reconcile</Button>
          <Button disabled variant="contained">Extend</Button>
        </ActionGroup>
      </div>
      <ReconciliateDialog />
    </>
  );
};

export default SubToolbar;
