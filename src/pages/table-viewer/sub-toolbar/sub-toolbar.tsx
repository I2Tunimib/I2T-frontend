import { Button, IconButton } from '@material-ui/core';
// import {
//   deleteColumn, selectIsColumnSelected,
//   updateUI
// } from '@store/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import clsx from 'clsx';
import {
  redo,
  selectIsCellSelected, selectIsMetadataButtonEnabled,
  selectUndoState,
  undo, updateUI
} from '@store/table/table.slice';
import styles from './sub-toolbar.module.scss';
import ReconciliateDialog from '../reconciliate-dialog/reconciliate-dialog';
import MetadataDialog from '../metadata-dialog/metadata-dialog';

/**
 * Action container
 */
const ActionGroup = ({ children, className }: any) => (
  <div className={clsx(
    styles.ActionGroup,
    className
  )}
  >
    {children}
  </div>
);

/**
 * Sub toolbar for common and contextual actions
 */
const SubToolbar = () => {
  const dispatch = useAppDispatch();
  const isCellSelected = useAppSelector(selectIsCellSelected);
  const isMetadataButtonEnabled = useAppSelector(selectIsMetadataButtonEnabled);
  const { canUndo, canRedo } = useAppSelector(selectUndoState);
  // const isColumnSelected = useAppSelector(selectIsColumnSelected);
  // const selectedCell = useAppSelector(selectSelectedCell);

  const handleDelete = () => {
    // dispatch(deleteColumn(null));
  };

  return (
    <>
      <div className={styles.Container}>
        <ActionGroup>
          <IconButton disabled={!canUndo} onClick={() => dispatch(undo())} size="small">
            <UndoRoundedIcon />
          </IconButton>
          <IconButton disabled={!canRedo} onClick={() => dispatch(redo())} size="small">
            <RedoRoundedIcon />
          </IconButton>
          <IconButton onClick={handleDelete} disabled={!false} size="small">
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </ActionGroup>
        <div className={styles.ActionsContainer}>
          <div className={clsx(
            styles.MenusContainer,
            {
              [styles.Hidden]: !isMetadataButtonEnabled,
              [styles.Visible]: isMetadataButtonEnabled
            }
          )}
          >
            <ActionGroup className={clsx(
              styles.HiddenMenu,
              {
                [styles.Hidden]: !isMetadataButtonEnabled,
                [styles.Visible]: isMetadataButtonEnabled
              }
            )}
            >
              <Button
                variant="contained"
                onClick={() => dispatch(updateUI({ openMetadataDialog: true }))}
              >
                Manage Metadata
              </Button>
            </ActionGroup>
            <ActionGroup className={styles.VisibleMenu}>
              <Button
                color="primary"
                disabled={!isCellSelected}
                onClick={() => dispatch(updateUI({ openReconciliateDialog: true }))}
                variant="contained"
              >
                Reconcile
              </Button>
              <Button disabled variant="contained">Extend</Button>
            </ActionGroup>
          </div>
        </div>
      </div>
      <ReconciliateDialog />
      <MetadataDialog />
    </>
  );
};

export default SubToolbar;
