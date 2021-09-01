import { Button, IconButton, Tooltip } from '@material-ui/core';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import SettingsEthernetRoundedIcon from '@material-ui/icons/SettingsEthernetRounded';
import PlaylistAddCheckRoundedIcon from '@material-ui/icons/PlaylistAddCheckRounded';
import ViewStreamRoundedIcon from '@material-ui/icons/ViewStreamRounded';
import ReorderRoundedIcon from '@material-ui/icons/ReorderRounded';
import ArrowRightAltRoundedIcon from '@material-ui/icons/ArrowRightAltRounded';
import clsx from 'clsx';
import {
  deleteSelected,
  redo, undo, updateSelectedCellExpanded, updateUI
} from '@store/slices/table/table.slice';
import { ToolbarActions } from '@components/kit';
import { ActionGroup, IconButtonTooltip } from '@components/core';
import { MouseEvent, useState, useEffect } from 'react';
import {
  selectIsCellSelected, selectIsOnlyOneCellSelected,
  selectIsAutoMatchingEnabled, selectCanUndo,
  selectCanRedo, selectCanDelete, selectIsDenseView
} from '@store/slices/table/table.selectors';
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
  const isMetadataButtonEnabled = useAppSelector(selectIsOnlyOneCellSelected);
  const isAutoMatchingEnabled = useAppSelector(selectIsAutoMatchingEnabled);
  const isDenseView = useAppSelector(selectIsDenseView);
  const isACellSelected = useAppSelector(selectIsCellSelected);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const canDelete = useAppSelector(selectCanDelete);

  const handleDelete = () => {
    dispatch(deleteSelected({}));
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
            disabled={!isAutoMatchingEnabled}
            onClick={handleClickAutoMatching}
          />
          <IconButtonTooltip
            tooltipText="Expand cell"
            Icon={ArrowRightAltRoundedIcon}
            disabled={!isACellSelected}
            onClick={() => dispatch(updateSelectedCellExpanded({}))}
          />
        </ActionGroup>
        <ActionGroup>
          <IconButtonTooltip
            tooltipText={isDenseView ? 'Accessible view' : 'Dense view'}
            Icon={isDenseView ? ViewStreamRoundedIcon : ReorderRoundedIcon}
            onClick={() => dispatch(updateUI({ denseView: !isDenseView }))}
          />
        </ActionGroup>
        <ActionGroup>
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
