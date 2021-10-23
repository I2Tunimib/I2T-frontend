import { Chip, Stack, Typography } from '@mui/material';
import { Searchbar } from '@components/kit';
import { ChangeEvent, FC, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { globalSearch } from '@store/slices/datasets/datasets.thunk';
import logo from '@assets/tui.png';
import styles from './ToolbarContent.module.scss';

type SearchResult = {
    id: string; // entity id
    name: string; // name
    type: 'table' | 'dataset', // if table or dataset
    datasetId?: string; // if table we need to know the datasetId
}

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const { API } = useAppSelector(selectAppConfig);
  const dispatch = useAppDispatch();

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(globalSearch({ query: event.target.value }))
      .unwrap()
      .then((res) => setSearchResults(res));
  };

  const autocompleteComponent = searchResults.length > 0 ? (
    searchResults.map((res, index) => (
      <SearchResultItem
        key={index}
        to={res.type === 'dataset' ? `/datasets/${res.id}/tables` : `/datasets/${res.datasetId}/tables/${res.id}`}>
        <span>{res.name}</span>
        <Chip size="small" label={res.type} />
      </SearchResultItem>
    ))
  ) : <div className={styles.SearchNoResult}>No results found</div>;

  return (
    <>
      <Stack direction="row" alignItems="center" gap="8px">
        <img src={logo} alt={logo} className={styles.Logo} />

        <Typography className={styles.AppTitle} component="span" variant="h4">
          <strong>t</strong>
          UI
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
