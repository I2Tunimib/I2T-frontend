import { Typography } from '@mui/material';
import { Searchbar } from '@components/kit';
import { FC } from 'react';
import styles from './ToolbarContent.module.scss';

const ToolbarContent: FC<any> = () => {
  return (
    <>
      <Typography variant="h4">I2T4E</Typography>
      <Searchbar
        onChange={(e) => console.log(e)}
        debounceChange
        enableAutocomplete
        autocompleteComponent={(
          <div>Result</div>
        )}
        className={styles.Searchbar}
        enableTags={false}
        expand={false}
        placeholder="Search for a table name"
      />
    </>
  );
};

export default ToolbarContent;
