import { Button, IconButton } from '@material-ui/core';
import { InlineInput } from '@components/kit';
import { useParams } from 'react-router-dom';
import { ChangeEvent, FocusEvent, useState } from 'react';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import SubToolbar from '../sub-toolbar/sub-toolbar';
import styles from './toolbar.module.scss';

/**
 * Toolbar element
 */
const Toolbar = () => {
  // get table name from query params
  const { name } = useParams<{ name: string }>();
  // keep track of table name
  const [tableName, setTableName] = useState<string>(name);

  const onChangeTableName = (event: ChangeEvent<HTMLInputElement>) => {
    // keep track of name
    setTableName(event.target.value);
  };

  const onBlurTableName = (event: FocusEvent<HTMLInputElement>) => {
    const newValue = event.target.value === '' ? 'Table name' : event.target.value;
    setTableName(newValue);
    // update name only on blur (saving to redux)
  };

  return (
    <>
      <div className={styles.Container}>
        <IconButton>
          <ArrowBackIosRoundedIcon />
        </IconButton>
        <div className={styles.ColumnMenu}>
          <InlineInput onBlur={onBlurTableName} onChange={onChangeTableName} value={tableName} />
          <div className={styles.RowMenu}>
            <Button className={styles.SmallButton} size="small">File</Button>
            <Button className={styles.SmallButton} size="small">Edit</Button>
          </div>
        </div>
      </div>
      <SubToolbar />
    </>
  );
};

export default Toolbar;
