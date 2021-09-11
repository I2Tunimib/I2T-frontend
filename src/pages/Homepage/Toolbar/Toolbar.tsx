import { FC, useState } from 'react';
import { ButtonShortcut, Searchbar } from '@components/kit';
import { Typography } from '@material-ui/core';
import { useAppDispatch } from '@hooks/store';
import { searchTables } from '@store/slices/tables/tables.thunk';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'react-router-dom';
import { loadUpTable } from '@store/slices/table/table.thunk';
import styles from './Toolbar.module.scss';

interface ToolbarProps { }

const Toolbar: FC<ToolbarProps> = () => {
  const dispatch = useAppDispatch();
  const [currentTables, setCurrentTables] = useState<TableInstance[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const debouncedSearchChange = useDebouncedCallback((event: any) => {
    if (event.target && event.target.value) {
      dispatch(searchTables(event.target.value))
        .unwrap()
        .then((res) => {
          setCurrentTables(res);
          setLoadingTables(false);
        });
    } else {
      setCurrentTables([]);
    }
  }, 300);

  const setCurrentTable = (table: TableInstance) => {
    const { name, type, ...meta } = table;
    dispatch(loadUpTable({
      table: {
        name: table.name,
        type: table.type,
        meta
      }
    }));
  };

  return (
    <div className={styles.Container}>
      <Typography component="h4" variant="h4">I2T4E</Typography>
      <Searchbar
        onChange={(e) => { setLoadingTables(true); debouncedSearchChange(e); }}
        enableAutocomplete
        autocompleteComponent={(
          <div className={styles.AutocompleteList}>
            {loadingTables ? (
              <div className={styles.AutocompleteItem}>
                <Typography color="textSecondary">Searching...</Typography>
              </div>
            ) : (
              <>
                {currentTables.length > 0 ? currentTables.map((table, index) => (
                  <Link
                    key={table.name}
                    to={
                      table.type === 'raw'
                        ? `/table/${table.name}?draft=true`
                        : `/table/${table.name}`
                    }
                    onClick={() => setCurrentTable(table)}
                    className={styles.AutocompleteItem}>
                    <Typography className={styles.Name}>{table.name}</Typography>
                    <ButtonShortcut text={table.type} />
                  </Link>
                )) : (
                  <div className={styles.AutocompleteItem}>
                    <Typography className={styles.Name}>No results found...</Typography>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        className={styles.Searchbar}
        enableTags={false}
        expand={false}
        placeholder="Search tables..."
      />
    </div>
  );
};

export default Toolbar;
