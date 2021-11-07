import {
  Button, FormControlLabel, FormGroup, IconButton, Stack,
  Switch,
  ToggleButton, ToggleButtonGroup, Tooltip
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import { InlineInput } from '@components/kit';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
  ChangeEvent, FocusEvent,
  MouseEvent, useState,
  useEffect
} from 'react';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SystemUpdateAltRoundedIcon from '@mui/icons-material/SystemUpdateAltRounded';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  selectCurrentTable,
  selectIsViewOnly,
  selectLastSaved,
  selectSaveTableStatus
} from '@store/slices/table/table.selectors';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import BubbleChartRoundedIcon from '@mui/icons-material/BubbleChartRounded';
import FormatAlignJustifyRoundedIcon from '@mui/icons-material/FormatAlignJustifyRounded';
import { updateCurrentTable, updateUI } from '@store/slices/table/table.slice';
import { saveTable } from '@store/slices/table/table.thunk';
import { useGoBack, useQuery } from '@hooks/router';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import { IconButtonTooltip } from '@components/core';
import styles from './Toolbar.module.scss';
import SaveIndicator from '../TableViewer/SaveIndicator';
import ExportDialog from '../TableViewer/ExportDialog';
import FileMenu from '../Menus/FileMenu';
import EditMenu from '../Menus/EditMenu';
import ViewMenu from '../Menus/ViewMenu';

interface MenuState extends Record<string, boolean> {
}

const initialMenuState: MenuState = {
  file: false,
  edit: false,
  view: false
};

/**
 * Toolbar element.
 */
const Toolbar = () => {
  // keep track of table name
  const [tableName, setTableName] = useState<string>('');

  const [menuState, setMenuState] = useState(initialMenuState);
  const [anchorEl, setAnchorEl] = useState<null | any>(null);

  const history = useHistory();
  const { datasetId, tableId } = useParams<{ datasetId: string; tableId: string; }>();
  const { loading } = useAppSelector(selectSaveTableStatus);
  const {
    name,
    lastModifiedDate
  } = useAppSelector(selectCurrentTable);
  const lastSaved = useAppSelector(selectLastSaved);
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const dispatch = useAppDispatch();

  const { view } = useQuery();

  const setView = (event: MouseEvent<HTMLElement>, newView: string | null) => {
    history.push(`/datasets/${datasetId}/tables/${tableId}?view=${newView}`);
  };

  useEffect(() => {
    if (name) {
      setTableName(name);
    }
  }, [name]);

  const onChangeTableName = (event: ChangeEvent<HTMLInputElement>) => {
    // keep track of name
    setTableName(event.target.value);
  };

  const onBlurTableName = (event: FocusEvent<HTMLInputElement>) => {
    const newValue = event.target.value === '' ? 'Unnamed table' : event.target.value;
    dispatch(updateCurrentTable({ name: newValue }));
  };

  const onInputClick = (event: MouseEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    setMenuState((state) => Object.keys(state)
      .reduce((acc, key) => ({
        ...acc,
        [key]: key === id
      }), {}));
    setAnchorEl(event.currentTarget);
  };

  const handleMenuEnter = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    if (Object.keys(menuState)
      .some((key) => menuState[key])) {
      handleMenuOpen(event, id);
    }
  };

  const handleMenuClose = () => {
    setMenuState(initialMenuState);
    setAnchorEl(null);
  };

  const handleSave = () => {
    dispatch(saveTable({
      datasetId,
      tableId
    }));
  };

  return (
    <>
      <div className={styles.Container}>
        <IconButton component={Link} to={`/datasets/${datasetId}/tables`} size="large">
          <ArrowBackIosRoundedIcon />
        </IconButton>
        <div className={styles.ColumnMenu}>
          <div className={clsx(styles.RowMenu)}>
            <InlineInput
              onClick={onInputClick}
              onBlur={onBlurTableName}
              onChange={onChangeTableName}
              value={tableName}
              className={clsx({
                [styles.DefaultName]: tableName === 'Unnamed table'
              })}
              disabled={!API.ENDPOINTS.SAVE || isViewOnly}
            />
            {(API.ENDPOINTS.SAVE && !isViewOnly) && (
              <SaveIndicator
                value={lastModifiedDate}
                lastSaved={lastSaved}
                loading={!!loading}
                className={styles.SaveIcon} />
            )
            }
          </div>
        </div>
        <Stack direction="row" gap="20px" className={styles.TopButtons}>
          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={setView}
            aria-label="text alignment"
          >
            <ToggleButton value="table" aria-label="left aligned">
              <Tooltip title="Table view">
                <TableChartOutlinedIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="raw" aria-label="centered">
              <Tooltip title="Raw view">
                <FormatAlignJustifyRoundedIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="graph" aria-label="right aligned">
              <Tooltip title="Graph view">
                <BubbleChartRoundedIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          {API.ENDPOINTS.EXPORT && API.ENDPOINTS.EXPORT.length > 0 && (
            <>
              <Button
                onClick={() => dispatch(updateUI({ openExportDialog: true }))}
                variant="contained"
                size="medium"
                startIcon={<SystemUpdateAltRoundedIcon />}
              >
                Export
              </Button>

              <ExportDialog />
            </>
          )}
          {(API.ENDPOINTS.SAVE && !isViewOnly) && (
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              size="medium"
              disabled={lastModifiedDate ? new Date(lastSaved) >= new Date(lastModifiedDate) : true}
              startIcon={<SaveRoundedIcon />}
            >
              Save
            </Button>
          )}
          <IconButtonTooltip
            tooltipText={isViewOnly ? 'Enable changes' : 'Disable changes'}
            Icon={isViewOnly
              ? ModeEditOutlineOutlinedIcon
              : EditOffOutlinedIcon}
            onClick={() => dispatch(updateUI({ viewOnly: !isViewOnly }))}>
            {isViewOnly
              ? <ModeEditOutlineOutlinedIcon />
              : <EditOffOutlinedIcon />
            }
          </IconButtonTooltip>
        </Stack>
      </div>
      {/* <FileMenu
        open={menuState.file}
        anchorElement={anchorEl}
        handleClose={handleMenuClose}
      />
      <EditMenu
        open={menuState.edit}
        anchorElement={anchorEl}
        handleClose={handleMenuClose}
      />
      <ViewMenu
        open={menuState.view}
        anchorElement={anchorEl}
        handleClose={handleMenuClose}
      /> */}

    </>
  );
};

export default Toolbar;
