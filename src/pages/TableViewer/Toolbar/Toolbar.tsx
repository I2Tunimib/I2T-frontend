import { Button, IconButton } from '@material-ui/core';
import { InlineInput } from '@components/kit';
import { useParams } from 'react-router-dom';
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

/**
 * Toolbar element.
 */
const Toolbar = () => {
  // get table name from query params
  const { name } = useParams<{ name: string }>();
  // keep track of table name
  const [tableName, setTableName] = useState<string>('Table name');

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

  return (
    <>
      <div className={styles.Container}>
        <IconButton>
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
            <CloudOffIcon className={styles.SaveIcon} />
          </div>
          <div className={clsx(styles.RowMenu, styles.ActionsContainer)}>
            <Button className={styles.SmallButton} size="small">File</Button>
            <Button className={styles.SmallButton} size="small">Edit</Button>
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
    </>
  );
};

export default Toolbar;
