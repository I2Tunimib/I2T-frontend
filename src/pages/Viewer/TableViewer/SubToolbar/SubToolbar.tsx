import { Button, Menu, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import ViewStreamRoundedIcon from "@mui/icons-material/ViewStreamRounded";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  addTutorialBox,
  deleteSelected,
  redo,
  undo,
  updateSelectedCellExpanded,
  updateUI,
} from "@store/slices/table/table.slice";
import { Searchbar, ToolbarActions } from "@components/kit";
import {
  ActionGroup,
  CheckboxGroup,
  IconButtonTooltip,
  StatusBadge,
  TaggedSearch,
} from "@components/core";
import {
  MouseEvent,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useMemo,
} from "react";
import {
  selectIsCellSelected,
  selectIsAutoMatchingEnabled,
  selectCanUndo,
  selectCanRedo,
  selectCanDelete,
  selectIsDenseView,
  selectIsHeaderExpanded,
  selectIsExtendButtonEnabled,
  selectIsViewOnly,
  selectMetadataDialogStatus,
  selectExtensionDialogStatus,
  selectIsMetadataButtonEnabled,
  selectMetadataColumnDialogStatus,
  selectAutomaticAnnotationStatus,
  selectCurrentTable,
  selectSearchStatus,
  selectAreCellReconciliated,
  selectReconcileDialogStatus,
} from "@store/slices/table/table.selectors";
import { selectAppConfig } from "@store/slices/config/config.selectors";
import {
  automaticAnnotation,
  filterTable,
} from "@store/slices/table/table.thunk";
import { TableUIState } from "@store/slices/table/interfaces/table";
import { useParams } from "react-router-dom";
import { Tag } from "@components/core/TaggedSearch/TagSelect";
import styles from "./SubToolbar.module.scss";
import ReconciliateDialog from "../ReconciliationDialog";
import MetadataDialog from "../MetadataDialog";
import ExtensionDialog from "../ExtensionDialog";
import MetadataColumnDialog from "../MetadataColumnDialog/MetadataColumnDialog";
import RefineMatchingDialog from "../RefineMatching/RefineMatchingDialog";

const tags = [
  {
    label: "label",
    value: "label",
    description: "Search for table cells labels",
  },
  {
    label: "metaName",
    value: "metaName",
    description: "Search for a metadata name",
  },
  {
    label: "metaType",
    value: "metaType",
    description: "Search for a metadata type",
  },
];

const filters = [
  {
    label: (
      <Stack direction="row" alignItems="center" gap="5px">
        <StatusBadge status="match-reconciliator" size="small" />
        <Typography>Matches</Typography>
      </Stack>
    ),
    value: "match",
    checked: true,
  },
  {
    label: (
      <Stack direction="row" alignItems="center" gap="5px">
        <StatusBadge status="warn" size="small" />
        <Typography>Ambiguous</Typography>
      </Stack>
    ),
    value: "pending",
    checked: true,
  },
  {
    label: (
      <Stack direction="row" alignItems="center" gap="5px">
        <StatusBadge status="miss" size="small" />
        <Typography>Miss matches</Typography>
      </Stack>
    ),
    value: "miss",
    checked: true,
  },
];

/**
 * Sub toolbar for common and contextual actions
 */
const SubToolbar = ({ columns, columnVisibility, setColumnVisibility }: {
  columns: any[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (v: Record<string, boolean>) => void;
}) => {
  const dispatch = useAppDispatch();
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [autoMatchingAnchor, setAutoMatchingAnchor] =
    useState<null | HTMLElement>(null);
  const [searchSuggestions, setSearchSuggestion] = useState<
    { distance: number; label: string }[]
  >([]);
  const [anchorElMenuFilter, setAnchorElMenuFilter] =
    useState<null | HTMLElement>(null);
  const [anchorElMenuColumns, setAnchorElMenuColumns] =
      useState<null | HTMLElement>(null);
  const params = useParams<{ datasetId: string; tableId: string }>();
  const isCellSelected = useAppSelector(selectIsCellSelected);
  const { status: isMetadataButtonEnabled, type: metadataAction } =
    useAppSelector(selectIsMetadataButtonEnabled);
  const { API } = useAppSelector(selectAppConfig);
  const { loading: loadingAutomaticAnnotation } = useAppSelector(
    selectAutomaticAnnotationStatus
  );
  const isExtendButtonEnabled = useAppSelector(selectIsExtendButtonEnabled);
  const isAutoMatchingEnabled = useAppSelector(selectIsAutoMatchingEnabled);
  const isDenseView = useAppSelector(selectIsDenseView);
  const isACellSelected = useAppSelector(selectIsCellSelected);
  const isHeaderExpanded = useAppSelector(selectIsHeaderExpanded);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const canDelete = useAppSelector(selectCanDelete);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const openMetadataDialog = useAppSelector(selectMetadataDialogStatus);
  const openMetadataColumnDialog = useAppSelector(
    selectMetadataColumnDialogStatus
  );
  const openExtensionDialog = useAppSelector(selectExtensionDialogStatus);
  const openReconciliationDialog = useAppSelector(selectReconcileDialogStatus);
  const currenTable = useAppSelector(selectCurrentTable);
  const searchFilter = useAppSelector(selectSearchStatus);
  const cellReconciliated = useAppSelector(selectAreCellReconciliated);

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      const { top, left, right, bottom, height, width, x, y } =
        ref.current.getBoundingClientRect();
      dispatch(
        addTutorialBox({
          id: "prova",
          bbox: {
            top,
            left,
            right,
            bottom,
            height,
            width,
            x,
            y,
          },
        })
      );
    }
  }, [ref]);

  const handleMetadataDialogAction = () => {
    if (metadataAction === "cell") {
      dispatch(updateUI({ openMetadataDialog: true }));
    } else if (metadataAction === "column") {
      dispatch(updateUI({ openMetadataColumnDialog: true }));
    }
  };
  const handleDelete = () => {
    dispatch(deleteSelected({}));
  };

  const handleSearch = ({
    tag: currentTag,
    value,
  }: {
    tag: Tag;
    value: string;
  }) => {
    if (!value) {
      setSearchSuggestion([]);
    } else {
      dispatch(
        filterTable({
          value,
          tag: currentTag.value,
        })
      )
        .unwrap()
        .then((res) => {
          setSearchSuggestion(res);
        });
    }
    dispatch(
      updateUI({
        search: {
          ...searchFilter,
          filter: currentTag.value,
          value,
        },
      })
    );
  };

  const handleClickAutoMatching = (event: MouseEvent<HTMLElement>) => {
    setIsAutoMatching(true);
    setAutoMatchingAnchor(event.currentTarget);
  };
  const handleCloseAutoMatching = () => {
    setIsAutoMatching(false);
  };
  const handleExtensionClose = (key: keyof TableUIState) => {
    dispatch(updateUI({ [key]: false }));
  };
  const handleAutomaticAnnotation = () => {
    dispatch(automaticAnnotation(params));
  };

  const handleFilterButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElMenuFilter(event.currentTarget);
  };
  const handleCloseFilterMenu = () => {
    setAnchorElMenuFilter(null);
  };
  const handleGlobalFilterChange = (selectedFilters: string[]) => {
    dispatch(
      updateUI({
        search: {
          ...searchFilter,
          globalFilter: selectedFilters,
        },
      })
    );
  };

  const openFilterMenu = Boolean(anchorElMenuFilter);

  const memoFilters = useMemo(() => {
    const { globalFilter } = searchFilter;

    return filters.map((filter) => {
      return globalFilter.includes(filter.value)
        ? { ...filter, checked: true }
        : filter;
    });
  });

  const openColumnsMenu = Boolean(anchorElMenuColumns);

  const handleColumnsMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElMenuColumns(event.currentTarget);
  };
  const handleCloseColumnsMenu = () => {
    setAnchorElMenuColumns(null);
  };

  const handleColumnToggle = (selectedIds: string[]) => {
    setColumnVisibility((prev) => {
      const newVisibility: Record<string, boolean> = {};
      columns.forEach((col) => {
        newVisibility[col.id] = selectedIds.includes(col.id);
      });
      return newVisibility;
    });
  };

  const memoColumns = useMemo(() => columns.map((col) => ({
    label: col.header?.toString().trim(),
    value: col.id,
    checked: columnVisibility[col.id] ?? true
  })), [columns, columnVisibility]);

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
            onClick={handleMetadataDialogAction}
          />
          {API.ENDPOINTS.SAVE && !isViewOnly && (
            <IconButtonTooltip
              tooltipText="Refine matching"
              Icon={PlaylistAddCheckRoundedIcon}
              disabled={!isAutoMatchingEnabled}
              onClick={handleClickAutoMatching}
            />
          )}
          <IconButtonTooltip
            tooltipText="Expand cell"
            Icon={ArrowRightAltRoundedIcon}
            disabled={!isACellSelected}
            onClick={() => dispatch(updateSelectedCellExpanded({}))}
          />
          <IconButtonTooltip
            tooltipText="Expand header"
            Icon={UnfoldMoreRoundedIcon}
            onClick={() => dispatch(updateUI({ headerExpanded: !isHeaderExpanded }))
            }
          />
        </ActionGroup>
        <ActionGroup>
          <IconButtonTooltip
            tooltipText={isDenseView ? "Accessible view" : "Dense view"}
            Icon={isDenseView ? ViewStreamRoundedIcon : ReorderRoundedIcon}
            onClick={() => dispatch(updateUI({ denseView: !isDenseView }))}
          />
        </ActionGroup>
        {!isViewOnly && (
          <ActionGroup>
            <Button
              sx={{
                textTransform: "none",
              }}
              color="primary"
              disabled={!isCellSelected}
              onClick={() => dispatch(updateUI({ openReconciliateDialog: true }))}
              variant="contained"
            >
              Reconcile
            </Button>
            <Button
              {...(!cellReconciliated && { color: "info" })}
              sx={{
                textTransform: "none",
              }}
              disabled={!isExtendButtonEnabled}
              onClick={() => {
                if (isExtendButtonEnabled && cellReconciliated) {
                  dispatch(updateUI({ openExtensionDialog: true }));
                }
              }}
              variant="contained"
            >
              Extend
            </Button>
          </ActionGroup>
        )}
        <Stack direction="row" alignItems="center" marginLeft="auto" gap="10px">
          <IconButtonTooltip
            tooltipText="Show/hide columns"
            Icon={VisibilityIcon}
            onClick={handleColumnsMenuClick}
          />
          <Menu
            id="column-menu"
            anchorEl={anchorElMenuColumns}
            open={openColumnsMenu}
            keepMounted
            onClose={handleCloseColumnsMenu}
          >
            <CheckboxGroup
              key={Object.values(columnVisibility).join(',')}
              items={memoColumns}
              onChange={handleColumnToggle}
            />
          </Menu>
          <IconButtonTooltip
            tooltipText="Filter rows"
            Icon={FilterAltOutlinedIcon}
            onClick={handleFilterButtonClick}
          />
          <Menu
            id="basic-menu"
            anchorEl={anchorElMenuFilter}
            open={openFilterMenu}
            keepMounted
            onClose={handleCloseFilterMenu}
          >
            <CheckboxGroup
              items={memoFilters}
              onChange={handleGlobalFilterChange}
            />
          </Menu>
          <TaggedSearch
            tags={tags}
            autocompleteItems={searchSuggestions}
            autocompleteMapFnItem={(item: any) => item.label}
            onSearchChange={handleSearch}
            className={styles.Search}
          />
        </Stack>
      </ToolbarActions>
      {openMetadataDialog && <MetadataDialog open={openMetadataDialog} />}
      <ReconciliateDialog
        open={openReconciliationDialog}
        handleClose={() => handleExtensionClose("openReconciliateDialog")}
      />
      <MetadataColumnDialog
        open={openMetadataColumnDialog}
        onClose={() => handleExtensionClose("openMetadataColumnDialog")}
      />
      <ExtensionDialog
        open={openExtensionDialog}
        handleClose={() => handleExtensionClose("openExtensionDialog")}
      />
      <RefineMatchingDialog
        open={isAutoMatching}
        anchorElement={autoMatchingAnchor}
        handleClose={handleCloseAutoMatching}
      />
      {/* <AutoMatching
        open={isAutoMatching}
        anchorElement={autoMatchingAnchor}
        handleClose={handleCloseAutoMatching}
      /> */}
    </>
  );
};

export default SubToolbar;
