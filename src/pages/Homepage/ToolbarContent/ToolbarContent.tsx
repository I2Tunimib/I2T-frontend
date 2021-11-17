import { Chip, Stack, Typography } from '@mui/material';
import { Searchbar } from '@components/kit';
import { ChangeEvent, FC, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { globalSearch } from '@store/slices/datasets/datasets.thunk';
import logo from '@assets/tui.png';
import { GlobalSearchResult } from '@services/api/datasets';
import styles from './ToolbarContent.module.scss';

const SearchResultItem = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 8px',
  textDecoration: 'none',
  color: 'inherit',
  '> span': {
    marginRight: 'auto'
  },
  '&:hover': {
    backgroundColor: 'rgb(234, 238, 243, 0.3)'
  }
});

const ToolbarContent: FC<any> = () => {
  const [
    { datasets, tables },
    setSearchResults] = useState<GlobalSearchResult>({ datasets: [], tables: [] });

  const { API } = useAppSelector(selectAppConfig);
  const dispatch = useAppDispatch();

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(globalSearch({ query: event.target.value }))
      .unwrap()
      .then((res) => setSearchResults(res));
  };

  const autocompleteComponent = tables.length > 0 || datasets.length > 0 ? (
    <>
      {datasets.map((item) => (
        <SearchResultItem
          key={item.id}
          to={`/datasets/${item.id}/tables`}>
          <span>{item.name}</span>
          <Chip size="small" label="dataset" />
        </SearchResultItem>
      ))}
      {
        tables.map((item) => (
          <SearchResultItem
            key={item.id}
            to={`/datasets/${item.idDataset}/tables/${item.id}`}>
            <span>{item.name}</span>
            <Chip size="small" label="table" />
          </SearchResultItem>
        ))
      }

    </>
  ) : <div className={styles.SearchNoResult}>No results found</div>;

  return (
    <>
      <Stack direction="row" alignItems="center" gap="8px">
        <Typography className={styles.AppTitle} component="span" variant="h4">
          I2T4E
        </Typography>
      </Stack>

      {API.ENDPOINTS.GLOBAL_SEARCH && (
        <Searchbar
          onChange={handleOnChange}
          debounceChange
          enableAutocomplete
          autocompleteComponent={autocompleteComponent}
          className={styles.Searchbar}
          enableTags={false}
          expand={false}
          placeholder="Search for a table name"
        />
      )}
    </>
  );
};

export default ToolbarContent;
