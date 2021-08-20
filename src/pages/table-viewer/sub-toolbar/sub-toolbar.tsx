import { Button, IconButton } from '@material-ui/core';
import {
  deleteColumn, selectIsColumnSelected,
  selectSelectedCell, updateUI
} from '@store/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import clsx from 'clsx';
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
  const isColumnSelected = useAppSelector(selectIsColumnSelected);
  const selectedCell = useAppSelector(selectSelectedCell);

  const handleDelete = () => {
    dispatch(deleteColumn(null));
  };

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
          <IconButton onClick={handleDelete} disabled={!isColumnSelected} size="small">
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </ActionGroup>
        <div className={styles.ActionsContainer}>
          <div className={clsx(
            styles.MenusContainer,
            {
              [styles.Hidden]: !selectedCell,
              [styles.Visible]: selectedCell
            }
          )}
          >
            <ActionGroup className={clsx(
              styles.HiddenMenu,
              {
                [styles.Hidden]: !selectedCell,
                [styles.Visible]: selectedCell
              }
            )}
            >
              <Button
                disabled={!selectedCell}
                variant="contained"
                onClick={() => dispatch(updateUI({ openMetadataDialog: true }))}
              >
                Manage Metadata
              </Button>
            </ActionGroup>
            <ActionGroup className={styles.VisibleMenu}>
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
        </div>
      </div>
      <ReconciliateDialog />
      <MetadataDialog />
    </>
  );
};

export default SubToolbar;
