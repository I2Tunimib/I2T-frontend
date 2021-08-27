import { Button, IconButton, Tooltip } from '@material-ui/core';
// import {
//   deleteColumn, selectIsColumnSelected,
//   updateUI
// } from '@store/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import SettingsEthernetRoundedIcon from '@material-ui/icons/SettingsEthernetRounded';
import PlaylistAddCheckRoundedIcon from '@material-ui/icons/PlaylistAddCheckRounded';
import clsx from 'clsx';
import {
  deleteColumn,
  redo,
  selectCanDelete,
  selectCanRedo,
  selectCanUndo,
  selectIsCellSelected, selectIsMetadataButtonEnabled,
  undo, updateUI
} from '@store/slices/table/table.slice';
import { ToolbarActions } from '@components/kit';
import { ActionGroup, IconButtonTooltip } from '@components/core';
import { MouseEvent, useState } from 'react';
import styles from './SubToolbar.module.scss';
import ReconciliateDialog from '../ReconciliationDialog';
import MetadataDialog from '../MetadataDialog';
import AutoMatching from '../AutoMatching';

/**
 * Sub toolbar for common and contextual actions
 */
const SubToolbar = () => {
  const dispatch = useAppDispatch();
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [autoMatchingAnchor, setAutoMatchingAnchor] = useState<null | HTMLElement>(null);
  const isCellSelected = useAppSelector(selectIsCellSelected);
  const isMetadataButtonEnabled = useAppSelector(selectIsMetadataButtonEnabled);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const canDelete = useAppSelector(selectCanDelete);

  const handleDelete = () => {
    dispatch(deleteColumn({ undoable: true }));
  };

  const handleClickAutoMatching = (event: MouseEvent<HTMLElement>) => {
    setIsAutoMatching(true);
    setAutoMatchingAnchor(event.currentTarget);
  };
  const handleCloseAutoMatching = () => {
    setIsAutoMatching(false);
  };

  return (
    <>
      <ToolbarActions>
        <ActionGroup>
          <IconButtonTooltip
            tooltipText="Undo"
            Icon={UndoRoundedIcon}
            disabled={!canUndo}
            onClick={() => dispatch(undo())}
          />
          <IconButtonTooltip
            tooltipText="Redo"
            Icon={RedoRoundedIcon}
            disabled={!canRedo}
            onClick={() => dispatch(redo())}
          />
          <IconButtonTooltip
            tooltipText="Delete selected"
            Icon={DeleteOutlineRoundedIcon}
            disabled={!canDelete}
            onClick={handleDelete}
          />
        </ActionGroup>
        <ActionGroup>
          <IconButtonTooltip
            tooltipText="Manage metadata"
            Icon={SettingsEthernetRoundedIcon}
            disabled={!isMetadataButtonEnabled}
            onClick={() => dispatch(updateUI({ openMetadataDialog: true }))}
          />
          <IconButtonTooltip
            tooltipText="Auto matching"
            Icon={PlaylistAddCheckRoundedIcon}
            disabled={false}
            onClick={handleClickAutoMatching}
          />
        </ActionGroup>
        <ActionGroup className={styles.VisibleMenu}>
          <Button
            color="primary"
            disabled={!isCellSelected}
            onClick={() => dispatch(updateUI({ openReconciliateDialog: true }))}
            variant="contained">
            Reconcile
          </Button>
          <Button disabled variant="contained">Extend</Button>
        </ActionGroup>
      </ToolbarActions>
      <ReconciliateDialog />
      <MetadataDialog />
      <AutoMatching
        open={isAutoMatching}
        anchorElement={autoMatchingAnchor}
        handleClose={handleCloseAutoMatching}
      />
    </>
  );
};

export default SubToolbar;
