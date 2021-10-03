import { ChangeEvent, FC, useState } from 'react';
import { ButtonShortcut, Searchbar } from '@components/kit';
import { Typography } from '@material-ui/core';
import { useAppDispatch } from '@hooks/store';
import { searchTables } from '@store/slices/tables/tables.thunk';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { Link } from 'react-router-dom';
import styles from './Toolbar.module.scss';

interface ToolbarProps { }

const Toolbar: FC<ToolbarProps> = () => {
  const dispatch = useAppDispatch();
  const [currentTables, setCurrentTables] = useState<TableInstance[]>([]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.value) {
      dispatch(searchTables(event.target.value))
        .unwrap()
        .then((res) => {
          setCurrentTables(res);
        });
    } else {
      setCurrentTables([]);
    }
  };

  return (
    <div className={styles.Container}>
      <Typography component="h4" variant="h4">I2T4E</Typography>
      <Searchbar
        onChange={handleSearchChange}
        debounceChange
        enableAutocomplete
        autocompleteComponent={(
          <div className={styles.AutocompleteList}>
            {currentTables.length > 0 ? currentTables.map((table, index) => (
              <Link
                key={table.id}
                to={`/table/${table.id}`}
                className={styles.AutocompleteItem}>
                <Typography className={styles.Name}>{table.name}</Typography>
                <ButtonShortcut text={table.type} />
              </Link>
            )) : (
              <div className={styles.AutocompleteItem}>
                <Typography className={styles.Name}>No results found...</Typography>
              </div>
            )}
          </div>
        )}
        className={styles.Searchbar}
        enableTags={false}
        expand={false}
        placeholder="Search for a table name"
      />
    </div>
  );
};

export default Toolbar;
