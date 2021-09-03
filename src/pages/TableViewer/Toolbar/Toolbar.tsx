import {
  Button, IconButton,
  makeStyles, withStyles
} from '@material-ui/core';
import { InlineInput } from '@components/kit';
import { Link, useParams } from 'react-router-dom';
import {
  ChangeEvent, FocusEvent,
  MouseEvent, useState
} from 'react';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import SaveRoundedIcon from '@material-ui/icons/SaveRounded';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import clsx from 'clsx';
import SubToolbar from '../SubToolbar/SubToolbar';
import styles from './Toolbar.module.scss';
import FileMenu from '../Menus/FileMenu';
import EditMenu from '../Menus/EditMenu';
import SaveIndicator from '../SaveIndicator';

interface MenuState extends Record<string, boolean> { }

const initialMenuState: MenuState = {
  file: false,
  edit: false
};

/**
 * Toolbar element.
 */
const Toolbar = () => {
  // get table name from query params
  const { name } = useParams<{ name: string }>();
  // keep track of table name
  const [tableName, setTableName] = useState<string>('Table name');

  const [menuState, setMenuState] = useState(initialMenuState);
  const [anchorEl, setAnchorEl] = useState<null | any>(null);

  const onChangeTableName = (event: ChangeEvent<HTMLInputElement>) => {
    // keep track of name
    setTableName(event.target.value);
  };

  const onBlurTableName = (event: FocusEvent<HTMLInputElement>) => {
    const newValue = event.target.value === '' ? 'Table name' : event.target.value;
    setTableName(newValue);
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
                [styles.DefaultName]: tableName === 'Table name'
              })}
            />
            <SaveIndicator className={styles.SaveIcon} />
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
              className={styles.SmallButton}
              size="small">
              View
            </Button>
          </div>
        </div>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<SaveRoundedIcon />}
          className={clsx(
            styles.SaveButton
          )}
        >
          Save
        </Button>
      </div>
      <SubToolbar />
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

    </>
  );
};

export default Toolbar;
