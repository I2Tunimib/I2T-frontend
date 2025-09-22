import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { ClickAwayListener, IconButton, Popper, Stack, Typography } from '@mui/material';
import { ChangeEvent, FC, HTMLAttributes, useState, useEffect, useRef, ReactNode, ReactElement, FocusEvent } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Loader from '../Loader';
import TagSelect, { Tag } from './TagSelect';

type TaggedSearchProps<T = {}> = HTMLAttributes<HTMLDivElement> & {
  tags: Tag[],
  // autocompleteItems?: ReactElement
  autocompleteItems: T[],
  autocompleteMapFnItem: (item: T) => string;
  inputProps?: HTMLAttributes<HTMLInputElement>
  onSearchChange?: ({ tag, value }: { tag: Tag, value: string }) => void;
}

const SearchWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  height: '40px',
  width: '100%',
  maxWidth: '400px',
  paddingRight: '0px 10px',
  borderRadius: '7px',
  backgroundColor: '#f0f1f3',
  overflow: 'hidden',
  '&:focus-within': {
    svg: {
      transform: 'scale(1)',
      color: '#1B74E4'
    }
  }
});

const StyledInput = styled.input({
  height: '100%',
  flexGrow: 1,
  margin: 0,
  padding: '0 10px',
  border: 'none',
  outline: 'none',
  fontSize: '16px',
  backgroundColor: 'transparent'
});

const PopperContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FFF',
  boxShadow: 'rgb(0 0 0 / 20%) 0px 2px 4px -1px, rgb(0 0 0 / 14%) 0px 4px 5px 0px, rgb(0 0 0 / 12%) 0px 1px 10px 0px',
  borderRadius: '7px',
  overflow: 'hidden'
});

const PopperItem = styled.button({
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  border: 'none',
  gap: '10px',
  padding: '10px',
  backgroundColor: '#FFF',
  '&:not(:last-child)': {
    borderBottom: '1px solid #dbdbdb'
  },
  '&:hover': {
    backgroundColor: '#f0f0f0'
  }
});

const PopperItemText = styled.div({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "250px",
});

const SearchIcon = styled(SearchRoundedIcon)({
  padding: '10px',
  transform: 'scale(0.9)',
  transition: 'all 200ms ease-out'
});

const DeleteIcon = styled(CloseRoundedIcon)({
  padding: '10px',
  transform: 'scale(0.9)',
  transition: 'all 200ms ease-out'
});

const StyledPopper = styled(Popper)({
  zIndex: 100
});

const spin = keyframes`
  0% { transform: rotate(0deg) }
  100% { transform: rotate(359deg) }
`;

const LoaderAnnoation = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid;
  border-color: var(--brand-color-one-base) rgba(255,255,255,0.1) rgba(255,255,255,0.1);
  animation: ${spin} .6s linear infinite;
`;

const modifiers = [
  {
    name: 'offset',
    options: {
      offset: [0, 5]
    }
  },
  {
    name: 'sameWidth',
    enabled: true,
    phase: 'beforeWrite',
    requires: ['computeStyles'],
    fn({ state }: any) {
      state.styles.popper.minWidth = `${state.rects.reference.width}px`;
    },
    effect({ state }: any) {
      state.elements.popper.style.minWidth = `${state.elements.reference.offsetWidth}px`;
    }
  }
] as any;

type SearchState = {
  tag: Tag;
  value: string;
}

const initialState: SearchState = {
  tag: {
    label: '',
    value: '',
    description: ''
  },
  value: ''
};

const TaggedSearch: FC<TaggedSearchProps> = ({
  tags,
  onSearchChange,
  inputProps,
  autocompleteMapFnItem,
  autocompleteItems,
  ...props
}) => {
  const [searching, setSearching] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const refSearchWrapper = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const debouncedOnChange = useDebouncedCallback((newSearchState: SearchState) => {
    if (onSearchChange && newSearchState.tag.value !== '') {
      onSearchChange(newSearchState);
    }
    setSearching(false);
  }, 300);

  useEffect(() => {
    debouncedOnChange(searchState);
  }, [searchState, debouncedOnChange]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearching(true);
    setSearchState((old) => ({ ...old, value: event.target.value }));
    if (refSearchWrapper && refSearchWrapper.current) {
      if (!anchorEl) {
        setAnchorEl(refSearchWrapper.current);
      } else {
        if (event.target.value === '') {
          setAnchorEl(null);
        }
      }
    }
  };

  const onTagChange = (tag: Tag) => {
    setSearchState((old) => ({ ...old, tag }));
  };

  const handleClickAway = (event: any) => {
    setAnchorEl(null);
  };

  const handleFocusInput = (event: FocusEvent<HTMLInputElement>) => {
    if (event.target.value) {
      if (!anchorEl) {
        setAnchorEl(refSearchWrapper.current);
      }
    }
  };

  const handleClickTag = () => {
    setAnchorEl(null);
  };

  const handleAutocompleteClick = (value: string) => {
    setSearchState((old) => ({ ...old, value }));
    setAnchorEl(null);
  };

  const handleDeleteQuery = () => {
    setSearchState((old) => ({ ...old, value: '' }));
    inputRef.current?.focus();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'autocomplete' : undefined;

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <SearchWrapper ref={refSearchWrapper} {...props}>
          <TagSelect onClick={handleClickTag} onChange={onTagChange} tags={tags} />
          <StyledInput
            {...inputProps}
            ref={inputRef}
            value={searchState.value}
            onChange={handleChange}
            onFocus={handleFocusInput}
            placeholder="Search table, metadata..." />
          {searchState.value ? (
            <IconButton
              sx={{ marginRight: '5px' }}
              size="small"
              onClick={handleDeleteQuery}>
              <DeleteIcon fontSize="small" sx={{ padding: '0px !important' }} />
            </IconButton>
          ) : <SearchIcon />}
        </SearchWrapper>
      </ClickAwayListener>

      <StyledPopper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        modifiers={modifiers}>
        <PopperContainer onClick={(event) => event.stopPropagation()}>
          {searching ? (
            <Stack alignItems="center" justifyContent="center" padding="10px">
              <LoaderAnnoation />
            </Stack>
          ) : (
            <>
              {autocompleteItems.map((item, key) => (
                <PopperItem
                  key={key}
                  onClick={() => handleAutocompleteClick(autocompleteMapFnItem(item))}>
                  <PopperItemText>
                    {autocompleteMapFnItem(item)}
                  </PopperItemText>
                </PopperItem>
              ))}
            </>
          )}
        </PopperContainer>
      </StyledPopper>
    </>
  );
};

export default TaggedSearch;
