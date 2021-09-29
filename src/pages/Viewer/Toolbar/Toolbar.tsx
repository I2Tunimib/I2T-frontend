import {
  Button, IconButton,
  makeStyles, withStyles
} from '@material-ui/core';
import { InlineInput } from '@components/kit';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
  ChangeEvent, FocusEvent,
  MouseEvent, useState,
  useEffect
} from 'react';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import SaveRoundedIcon from '@material-ui/icons/SaveRounded';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import SystemUpdateAltRoundedIcon from '@material-ui/icons/SystemUpdateAltRounded';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectCurrentTable, selectLastSaved, selectSaveTableStatus } from '@store/slices/table/table.selectors';
import { updateCurrentTable, updateUI } from '@store/slices/table/table.slice';
import { saveTable } from '@store/slices/table/table.thunk';
import styles from './Toolbar.module.scss';
import SaveIndicator from '../TableViewer/SaveIndicator';
import ExportDialog from '../TableViewer/ExportDialog';
import FileMenu from '../Menus/FileMenu';
import EditMenu from '../Menus/EditMenu';
import ViewMenu from '../Menus/ViewMenu';

interface MenuState extends Record<string, boolean> { }

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
  const { loading } = useAppSelector(selectSaveTableStatus);
  const { name, lastModifiedDate } = useAppSelector(selectCurrentTable);
  const lastSaved = useAppSelector(selectLastSaved);
  const dispatch = useAppDispatch();

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
    setMenuState((state) => Object.keys(state).reduce((acc, key) => ({
      ...acc,
      [key]: key === id
    }), {}));
    setAnchorEl(event.currentTarget);
  };

  const handleMenuEnter = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    if (Object.keys(menuState).some((key) => menuState[key])) {
      handleMenuOpen(event, id);
    }
  };

  const handleMenuClose = () => {
    setMenuState(initialMenuState);
    setAnchorEl(null);
  };

  const handleSave = () => {
    dispatch(saveTable())
      .unwrap()
      .then((res) => {
        history.push(res.id);
      });
  };

  return (
    <>
      <div className={styles.Container}>
        <IconButton component={Link} to="/">
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
            />
            <SaveIndicator
              value={lastModifiedDate}
              lastSaved={lastSaved}
              loading={!!loading}
              className={styles.SaveIcon} />
          </div>
          <div className={clsx(styles.RowMenu, styles.ActionsContainer)}>
            <Button
              onMouseEnter={(e) => handleMenuEnter(e, 'file')}
              onClick={(e) => handleMenuOpen(e, 'file')}
              className={styles.SmallButton}
              size="small">
              File
            </Button>
            <Button
              onMouseEnter={(e) => handleMenuEnter(e, 'edit')}
              onClick={(e) => handleMenuOpen(e, 'edit')}
              className={styles.SmallButton}
              size="small">
              Edit
            </Button>
            <Button
              onMouseEnter={(e) => handleMenuEnter(e, 'view')}
              onClick={(e) => handleMenuOpen(e, 'view')}
              className={styles.SmallButton}
              size="small">
              View
            </Button>
            <Button
              className={styles.SmallButton}
              size="small">
              Help
            </Button>
          </div>
        </div>
        <Button
          onClick={() => dispatch(updateUI({ openExportDialog: true }))}
          variant="contained"
          size="medium"
          className={styles.SaveButton}
          startIcon={<SystemUpdateAltRoundedIcon />}
        >
          Export
        </Button>
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
      </div>
      <FileMenu
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
      />
      <ExportDialog />
    </>
  );
};

export default Toolbar;
