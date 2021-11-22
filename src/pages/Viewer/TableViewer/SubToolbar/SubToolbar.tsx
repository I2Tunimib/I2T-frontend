import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SettingsEthernetRoundedIcon from '@mui/icons-material/SettingsEthernetRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import ReorderRoundedIcon from '@mui/icons-material/ReorderRounded';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import clsx from 'clsx';
import {
  addTutorialBox,
  deleteSelected,
  redo, undo, updateSelectedCellExpanded, updateUI
} from '@store/slices/table/table.slice';
import { Searchbar, ToolbarActions } from '@components/kit';
import { ActionGroup, IconButtonTooltip } from '@components/core';
import {
  ChangeEvent, MouseEvent,
  useState, useCallback, FormEvent,
  useRef,
  useEffect
} from 'react';
import {
  selectIsCellSelected, selectIsOnlyOneCellSelected,
  selectIsAutoMatchingEnabled, selectCanUndo,
  selectCanRedo, selectCanDelete, selectIsDenseView,
  selectSearchStatus, selectIsHeaderExpanded, selectIsExtendButtonEnabled,
  selectIsViewOnly, selectMetadataDialogStatus, selectExtensionDialogStatus
} from '@store/slices/table/table.selectors';
import { useDebouncedCallback } from 'use-debounce';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import styles from './SubToolbar.module.scss';
import ReconciliateDialog from '../ReconciliationDialog';
import MetadataDialog from '../MetadataDialog';
import AutoMatching from '../AutoMatching';
import ExtensionDialog from '../ExtensionDialog';

const tagRegex = /:([A-Za-z]+):/;

const permittedTags = ['metaName', 'metaType'];

/**
 * Sub toolbar for common and contextual actions
 */
const SubToolbar = () => {
  const dispatch = useAppDispatch();
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [autoMatchingAnchor, setAutoMatchingAnchor] = useState<null | HTMLElement>(null);
  const [tag, setTag] = useState<string>('label');
  const isCellSelected = useAppSelector(selectIsCellSelected);
  const isMetadataButtonEnabled = useAppSelector(selectIsOnlyOneCellSelected);
  const isExtendButtonEnabled = useAppSelector(selectIsExtendButtonEnabled);
  const isAutoMatchingEnabled = useAppSelector(selectIsAutoMatchingEnabled);
  const isDenseView = useAppSelector(selectIsDenseView);
  const isACellSelected = useAppSelector(selectIsCellSelected);
  const isHeaderExpanded = useAppSelector(selectIsHeaderExpanded);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const canDelete = useAppSelector(selectCanDelete);
  const searchFilter = useAppSelector(selectSearchStatus);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const { API } = useAppSelector(selectAppConfig);
  const openMetadataDialog = useAppSelector(selectMetadataDialogStatus);
  const openExtensionDialog = useAppSelector(selectExtensionDialogStatus);

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      const {
        top,
        left,
        right,
        bottom,
        height,
        width,
        x,
        y
      } = ref.current.getBoundingClientRect();
      dispatch(addTutorialBox({
        id: 'prova',
        bbox: {
          top,
          left,
          right,
          bottom,
          height,
          width,
          x,
          y
        }
      }));
    }
  }, [ref]);

  const debouncedSearchChange = useDebouncedCallback((event: any) => {
    if (event.target) {
      dispatch(updateUI({
        search: {
          filter: tag,
          value: event.target.value || ''
        }
      }));
    }
  }, 300);

  const handleTagChange = (newTag: string) => {
    setTag(newTag);
  };

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
  const handleExtensionClose = () => {
    dispatch(updateUI({ openExtensionDialog: false }));
  };

  return (
    <>
      <ToolbarActions>
        <ActionGroup>
          <IconButtonTooltip
            ref={ref}
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
          {(API.ENDPOINTS.SAVE && !isViewOnly)
            && (
              <IconButtonTooltip
                tooltipText="Auto matching"
                Icon={PlaylistAddCheckRoundedIcon}
                disabled={!isAutoMatchingEnabled}
                onClick={handleClickAutoMatching}
              />
            )
          }
          <IconButtonTooltip
            tooltipText="Expand cell"
            Icon={ArrowRightAltRoundedIcon}
            disabled={!isACellSelected}
            onClick={() => dispatch(updateSelectedCellExpanded({}))}
          />
          <IconButtonTooltip
            tooltipText="Expand header"
            Icon={UnfoldMoreRoundedIcon}
            onClick={() => dispatch(updateUI({ headerExpanded: !isHeaderExpanded }))}
          />
        </ActionGroup>
        <ActionGroup>
          <IconButtonTooltip
            tooltipText={isDenseView ? 'Accessible view' : 'Dense view'}
            Icon={isDenseView ? ViewStreamRoundedIcon : ReorderRoundedIcon}
            onClick={() => dispatch(updateUI({ denseView: !isDenseView }))}
          />
        </ActionGroup>
        {!isViewOnly && (
          <ActionGroup>
            <Button
              color="primary"
              disabled={!isCellSelected}
              onClick={() => dispatch(updateUI({ openReconciliateDialog: true }))}
              variant="contained">
              Reconcile
            </Button>
            <Button
              disabled={!isExtendButtonEnabled}
              onClick={() => dispatch(updateUI({ openExtensionDialog: true }))}
              variant="contained">
              Extend
            </Button>
          </ActionGroup>
        )}
        <Searchbar
          defaultTag="label"
          placeholder="Search table, metadata..."
          tagRegex={tagRegex}
          permittedTags={permittedTags}
          onTagChange={handleTagChange}
          onChange={(e) => debouncedSearchChange(e)}
          className={styles.Search}
        />
      </ToolbarActions>
      {openMetadataDialog && <MetadataDialog open={openMetadataDialog} />}
      <ReconciliateDialog />
      <ExtensionDialog open={openExtensionDialog} handleClose={handleExtensionClose} />
      <AutoMatching
        open={isAutoMatching}
        anchorElement={autoMatchingAnchor}
        handleClose={handleCloseAutoMatching}
      />
    </>
  );
};

export default SubToolbar;
