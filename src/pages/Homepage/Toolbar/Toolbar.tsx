import { FC } from 'react';
import { Searchbar } from '@components/kit';
import { Typography } from '@material-ui/core';
import styles from './Toolbar.module.scss';

interface ToolbarProps {}

const Toolbar: FC<ToolbarProps> = () => {
  return (
    <div className={styles.Container}>
      <Typography component="h4" variant="h4">I2T4E</Typography>
      <Searchbar
        className={styles.Searchbar}
        enableTags={false}
        expand={false}
        placeholder="Search tables..."
      />
    </div>
  );
};

export default Toolbar;
