import { FC, HTMLAttributes, ReactNode } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import clsx from 'clsx';
import { ClickAwayListener } from '@mui/material';
import styles from './SearchbarBase.module.scss';
import ButtonShortcut from '../ButtonShortcut';

interface SearchbarBaseProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * Tag to display.
   */
  tag?: string;
  enableAutocomplete: boolean;
  autocompleteComponent: ReactNode;
  inputState: { focused: boolean; value: string };
  onClickAway: () => void;
}

/**
 * Wrapper component to SearchBar.
 */
const SearchbarBase: FC<SearchbarBaseProps> = ({
  inputState: { value, focused },
  enableAutocomplete,
  autocompleteComponent,
  tag,
  onClick,
  onClickAway,
  className,
  children
}) => {
  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div className={clsx(
        styles.AutocompleteOverlay,
        className,
        {
          [styles.Searching]: enableAutocomplete && value !== '' && focused
        }
      )}>
        <button
          onClick={onClick}
          className={clsx(
            styles.Container,
            {
              [styles.Focused]: focused,
              [styles.Searching]: enableAutocomplete && value !== '' && !value.startsWith(':') && focused
            }
          )}>
          <SearchRoundedIcon className={styles.Icon} />
          {tag && <ButtonShortcut text={tag} variant="flat" color="white" />}
          {children}
        </button>
        {enableAutocomplete && value !== '' && !value.startsWith(':') && focused ? (
          <div className={styles.AutocompleteContentWrapper}>
            {autocompleteComponent}
          </div>
        ) : null}
      </div>
    </ClickAwayListener>
  );
};

export default SearchbarBase;
