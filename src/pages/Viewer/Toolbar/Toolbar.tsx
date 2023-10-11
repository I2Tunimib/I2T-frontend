import {
  Button, FormControlLabel, FormGroup, IconButton, Stack,
  Switch,
  ToggleButton, ToggleButtonGroup, Tooltip
} from '@mui/material';
import { InlineInput } from '@components/kit';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
  ChangeEvent, FocusEvent,
  MouseEvent, useState,
  useEffect
} from 'react';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SystemUpdateAltRoundedIcon from '@mui/icons-material/SystemUpdateAltRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  selectAutomaticAnnotationStatus,
  selectCurrentTable,
  selectHelpDialogStatus,
  selectIsViewOnly,
  selectLastSaved,
  selectSaveTableStatus,
  selectSettingsDialogStatus
} from '@store/slices/table/table.selectors';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import BubbleChartRoundedIcon from '@mui/icons-material/BubbleChartRounded';
import FormatAlignJustifyRoundedIcon from '@mui/icons-material/FormatAlignJustifyRounded';
import { updateCurrentTable, updateUI } from '@store/slices/table/table.slice';
import { automaticAnnotation, saveTable } from '@store/slices/table/table.thunk';
import { useQuery } from '@hooks/router';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { IconButtonTooltip } from '@components/core';
import UserAvatar from '@components/kit/UserAvatar';
import { selectIsLoggedIn } from '@store/slices/auth/auth.selectors';
import styles from './Toolbar.module.scss';
import SaveIndicator from '../TableViewer/SaveIndicator';
import ExportDialog from '../TableViewer/ExportDialog';
import SettingsDialog from '../SettingsDialog/SettingsDialog';
import HelpDialog from '../HelpDialog/HelpDialog';

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
  const currentTable = useAppSelector(selectCurrentTable);
  const lastSaved = useAppSelector(selectLastSaved);
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const openSettingsDialog = useAppSelector(selectSettingsDialogStatus);
  const openHelpDialog = useAppSelector(selectHelpDialogStatus);
  const { loading: loadingAutomaticAnnotation } = useAppSelector(selectAutomaticAnnotationStatus);
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectIsLoggedIn);

  const { view } = useQuery();

  const setView = (event: MouseEvent<HTMLElement>, newView: string | null) => {
    history.push(`/datasets/${datasetId}/tables/${tableId}?view=${newView}`);
  };

  useEffect(() => {
    if (currentTable.name) {
      setTableName(currentTable.name);
    }
  }, [currentTable.name]);

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

  const handleCloseSettings = () => {
    dispatch(updateUI({ settingsDialog: false }));
  };
  const handleCloseHelp = () => {
    dispatch(updateUI({ openHelpDialog: false }));
  };

  const handleSave = () => {
    dispatch(saveTable({
      datasetId,
      tableId
    }));
  };

  const handleAutomaticAnnotation = () => {
    dispatch(automaticAnnotation({ datasetId, tableId }));
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
              disabled={!API.ENDPOINTS.SAVE || !!isViewOnly}
            />
            {(API.ENDPOINTS.SAVE && !isViewOnly) && (
              <SaveIndicator
                value={currentTable.lastModifiedDate}
                lastSaved={lastSaved}
                loading={!!loading}
                className={styles.SaveIcon} />
            )}
          </div>
        </div>
        <Stack direction="row" gap="20px" alignItems="center" className={styles.TopButtons}>
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
          <Button
            color="primary"
            disabled={loadingAutomaticAnnotation || (currentTable && currentTable.mantisStatus === 'PENDING')}
            onClick={handleAutomaticAnnotation}
            startIcon={<PlayCircleOutlineRoundedIcon />}
            variant="contained">
            Automatic annotation
          </Button>
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
              disabled={currentTable.lastModifiedDate
                ? new Date(lastSaved) >= new Date(currentTable.lastModifiedDate)
                : true}
              startIcon={<SaveRoundedIcon />}
            >
              Save
            </Button>
          )}
          <IconButtonTooltip
            tooltipText="Settings"
            Icon={SettingsIcon}
            onClick={() => dispatch(updateUI({ settingsDialog: true }))}
          />
          <IconButtonTooltip
            tooltipText="Help"
            onClick={() => dispatch(updateUI({ openHelpDialog: true }))}
            Icon={HelpOutlineRoundedIcon} />
          {auth.loggedIn && auth.user && (
            <UserAvatar>
              {auth.user.username.slice(0, 2).toUpperCase()}
            </UserAvatar>
          )}
        </Stack>
      </div>
      <SettingsDialog open={openSettingsDialog} onClose={handleCloseSettings} />
      <HelpDialog open={openHelpDialog} onClose={handleCloseHelp} />
    </>
  );
};

export default Toolbar;
